// This file is part of midnightntwrk/example-journal.
// Copyright (C) 2025 Midnight Foundation
// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License");
// You may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Provides types and utilities for working with journal contracts.
 *
 * @packageDocumentation
 */

import contractModule from '../../contract/src/managed/journal/contract/index.cjs';
const { Contract, ledger, pureCircuits, State } = contractModule;

import { type ContractAddress, convert_bigint_to_Uint8Array } from '@midnight-ntwrk/compact-runtime';
import { type Logger } from 'pino';
import {
  type JournalDerivedState,
  type JournalContract,
  type JournalProviders,
  type DeployedJournalContract,
  journalPrivateStateKey,
} from './common-types.js';
import { type JournalPrivateState, createJournalPrivateState, witnesses } from '../../contract/src/index';
import * as utils from './utils/index.js';
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { combineLatest, map, tap, from, type Observable } from 'rxjs';
import { toHex } from '@midnight-ntwrk/midnight-js-utils';

/** @internal */
const journalContractInstance: JournalContract = new Contract(witnesses);

/**
 * An API for a deployed journal.
 */
export interface DeployedJournalAPI {
  readonly deployedContractAddress: ContractAddress;
  readonly state$: Observable<JournalDerivedState>;

  post: (thought: string, rating: number) => Promise<void>;
  delete: () => Promise<void>;
}

/**
 * Provides an implementation of {@link DeployedJournalAPI} by adapting a deployed journal contract.
 *
 * @remarks
 * The `JournalPrivateState` is managed at the DApp level by a private state provider. As such, this
 * private state is shared between all instances of {@link JournalAPI}, and their underlying deployed
 * contracts. The private state defines a `'secretKey'` property that effectively identifies the current
 * user, and is used to determine if the current user is the owner of the entry as the observable
 * contract state changes.
 *
 * In the future, Midnight.js will provide a private state provider that supports private state storage
 * keyed by contract address. This will remove the current workaround of sharing private state across
 * the deployed journal contracts, and allows for a unique secret key to be generated for each journal
 * that the user interacts with.
 */
// TODO: Update JournalAPI to use contract level private state storage.
export class JournalAPI implements DeployedJournalAPI {
  /** @internal */
  private constructor(
    public readonly deployedContract: DeployedJournalContract,
    providers: JournalProviders,
    private readonly logger?: Logger,
  ) {
    this.deployedContractAddress = deployedContract.deployTxData.public.contractAddress;
    this.state$ = combineLatest(
      [
        // Combine public (ledger) state with...
        providers.publicDataProvider.contractStateObservable(this.deployedContractAddress, { type: 'latest' }).pipe(
          map((contractState) => ledger(contractState.data)),
          tap((ledgerState) =>
            logger?.trace({
              ledgerStateChanged: {
                ledgerState: {
                  ...ledgerState,
                  state: ledgerState.state === State.OCCUPIED ? 'occupied' : 'vacant',
                  owner: toHex(ledgerState.owner),
                },
              },
            }),
          ),
        ),
        // ...private state...
        from(providers.privateStateProvider.get(journalPrivateStateKey) as Promise<JournalPrivateState>),
      ],
      // ...and combine them to produce the required derived state.
      (ledgerState, privateState) => {
        const hashedSecretKey = pureCircuits.publicKey(
          privateState.secretKey,
          convert_bigint_to_Uint8Array(32, ledgerState.sequence),
        );

        const entryValue = ledgerState.entry?.is_some ? ledgerState.entry.value : undefined;

        return {
          state: ledgerState.state,
          thought: entryValue?.thought,
          rating: entryValue ? Number(entryValue.rating) : undefined,
          sequence: ledgerState.sequence,
          isOwner: toHex(ledgerState.owner) === toHex(hashedSecretKey),
          entry: entryValue?.thought,
        };
      },
    );
  }

  /**
   * Gets the address of the current deployed contract.
   */
  readonly deployedContractAddress: ContractAddress;

  /**
   * Gets an observable stream of state changes based on the current public (ledger),
   * and private state data.
   */
  readonly state$: Observable<JournalDerivedState>;

  /**
   * Attempts to post a new journal entry.
   *
   * @param thought The journal entry text.
   * @param rating The mood rating (1–10).
   *
   * @remarks
   * This method can fail during local circuit execution if the journal is currently occupied.
   */
  async post(thought: string, rating: number): Promise<void> {
    this.logger?.info(`postingEntry: thought=${thought}, rating=${rating}`);

    const txData = await this.deployedContract.callTx.post(thought, BigInt(rating));

    this.logger?.trace({
      transactionAdded: {
        circuit: 'post',
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });
  }

  /**
   * Attempts to delete the current journal entry.
   *
   * @remarks
   * This method can fail during local circuit execution if the journal is currently vacant,
   * or if the entry isn’t owned by the owner computed from the current private state.
   */
  async delete(): Promise<void> {
    this.logger?.info('deletingEntry');

    const txData = await this.deployedContract.callTx.delete();

    this.logger?.trace({
      transactionAdded: {
        circuit: 'delete',
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });
  }

  /**
   * Deploys a new journal contract to the network.
   *
   * @param providers The journal providers.
   * @param logger An optional 'pino' logger to use for logging.
   * @returns A `Promise` that resolves with a {@link JournalAPI} instance that manages the newly deployed
   * {@link DeployedJournalContract}; or rejects with a deployment error.
   */
  static async deploy(providers: JournalProviders, logger?: Logger): Promise<JournalAPI> {
    logger?.info('deployContract');

    const deployedJournalContract = await deployContract<typeof journalContractInstance>(providers, {
      privateStateId: journalPrivateStateKey,
      contract: journalContractInstance,
      initialPrivateState: await JournalAPI.getPrivateState(providers),
    });

    logger?.trace({
      contractDeployed: {
        finalizedDeployTxData: deployedJournalContract.deployTxData.public,
      },
    });

    return new JournalAPI(deployedJournalContract, providers, logger);
  }

  /**
   * Finds an already deployed journal contract on the network, and joins it.
   *
   * @param providers The journal providers.
   * @param contractAddress The contract address of the deployed journal contract to search for and join.
   * @param logger An optional 'pino' logger to use for logging.
   * @returns A `Promise` that resolves with a {@link JournalAPI} instance that manages the joined
   * {@link DeployedJournalContract}; or rejects with an error.
   */
  static async join(providers: JournalProviders, contractAddress: ContractAddress, logger?: Logger): Promise<JournalAPI> {
    logger?.info({
      joinContract: {
        contractAddress,
      },
    });

    const deployedJournalContract = await findDeployedContract<JournalContract>(providers, {
      contractAddress,
      contract: journalContractInstance,
      privateStateId: journalPrivateStateKey,
      initialPrivateState: await JournalAPI.getPrivateState(providers),
    });

    logger?.trace({
      contractJoined: {
        finalizedDeployTxData: deployedJournalContract.deployTxData.public,
      },
    });

    return new JournalAPI(deployedJournalContract, providers, logger);
  }

  private static async getPrivateState(providers: JournalProviders): Promise<JournalPrivateState> {
    const existingPrivateState = await providers.privateStateProvider.get(journalPrivateStateKey);
    return existingPrivateState ?? createJournalPrivateState(utils.randomBytes(32));
  }
}

/**
 * A namespace that represents the exports from the `'utils'` sub-package.
 *
 * @public
 */
export * as utils from './utils/index.js';

export * from './common-types.js';
