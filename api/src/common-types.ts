// This file is part of midnightntwrk/example-journal.
// Copyright (C) 2025 Midnight Foundation
// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License");
// You may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Journal contract common types and abstractions.
 *
 * @module
 */

import { type MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { type FoundContract } from '@midnight-ntwrk/midnight-js-contracts';
import type { State, JournalPrivateState, Contract, Witnesses } from '../../contract/src/index';

export const journalPrivateStateKey = 'journalPrivateState';
export type PrivateStateId = typeof journalPrivateStateKey;

/**
 * The private states consumed throughout the application.
 *
 * @remarks
 * {@link PrivateStates} can be thought of as a type that describes a schema for all
 * private states for all contracts used in the application. Each key represents
 * the type of private state consumed by a particular type of contract.
 * The key is used by the deployed contract when interacting with a private state provider,
 * and the type (i.e., `typeof PrivateStates[K]`) represents the type of private state
 * expected to be returned.
 *
 * Since there is only one contract type for the journal example, we only define a
 * single key/type in the schema.
 *
 * @public
 */
export type PrivateStates = {
  /**
   * Key used to provide the private state for {@link JournalContract} deployments.
   */
  readonly journalPrivateState: JournalPrivateState;
};

/**
 * Represents a journal contract and its private state.
 *
 * @public
 */
export type JournalContract = Contract<JournalPrivateState, Witnesses<JournalPrivateState>>;

/**
 * The keys of the circuits exported from {@link JournalContract}.
 *
 * @public
 */
export type JournalCircuitKeys = Exclude<keyof JournalContract['impureCircuits'], number | symbol>;

/**
 * The providers required by {@link JournalContract}.
 *
 * @public
 */
export type JournalProviders = MidnightProviders<JournalCircuitKeys, PrivateStateId, JournalPrivateState>;

/**
 * A {@link JournalContract} that has been deployed to the network.
 *
 * @public
 */
export type DeployedJournalContract = FoundContract<JournalContract>;

/**
 * A type that represents the derived combination of public (or ledger), and private state.
 */
export type JournalDerivedState = {
  readonly state: State;
  readonly sequence: bigint;
  readonly entry: string | undefined;
  readonly thought: string | undefined;
  readonly rating: number | undefined;

  /**
   * A readonly flag that determines if the current entry was created by the current user.
   *
   * @remarks
   * The `owner` property of the public (or ledger) state is the public key of the entry owner, while
   * the `secretKey` property of {@link JournalPrivateState} is the secret key of the current user. If
   * `owner` corresponds to the public key derived from `secretKey`, then `isOwner` is `true`.
   */
  readonly isOwner: boolean;
};

// TODO: for some reason I needed to include "@midnight-ntwrk/wallet-sdk-address-format": "1.0.0-rc.1", should we bump it to rc-2 ?
