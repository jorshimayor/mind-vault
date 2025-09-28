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

import {
  type CircuitContext,
  QueryContext,
  sampleContractAddress,
  constructorContext,
  convert_bigint_to_Uint8Array,
} from "@midnight-ntwrk/compact-runtime";
import {
  Contract,
  type Ledger,
  ledger,
} from "../managed/journal/contract/index.cjs";
import { type JournalPrivateState, witnesses } from "../witnesses.js";

/**
 * Serves as a testbed to exercise the Journal contract in tests
 */
export class JournalSimulator {
  readonly contract: Contract<JournalPrivateState>;
  circuitContext: CircuitContext<JournalPrivateState>;

  constructor(secretKey: Uint8Array) {
    this.contract = new Contract<JournalPrivateState>(witnesses);
    const {
      currentPrivateState,
      currentContractState,
      currentZswapLocalState,
    } = this.contract.initialState(
      constructorContext({ secretKey }, "0".repeat(64)),
    );
    this.circuitContext = {
      currentPrivateState,
      currentZswapLocalState,
      originalState: currentContractState,
      transactionContext: new QueryContext(
        currentContractState.data,
        sampleContractAddress(),
      ),
    };
  }

  /***
   * Switch to a different secret key for simulating another user
   */
  public switchUser(secretKey: Uint8Array) {
    this.circuitContext.currentPrivateState = {
      secretKey,
    };
  }

  private normalizeLedger(l: Ledger): Ledger {
    if (l.entry.is_some) {
      return {
        ...l,
        entry: {
          ...l.entry,
          value: {
            ...l.entry.value,
            rating: Number(l.entry.value.rating), // ✅ force number
          },
        },
      };
    }
    return l;
  }

  public getLedger(): Ledger {
    return this.normalizeLedger(ledger(this.circuitContext.transactionContext.state));
  }

  public getPrivateState(): JournalPrivateState {
    return this.circuitContext.currentPrivateState;
  }

  /**
   * Write a new encrypted journal entry
   * @param thought - user’s encrypted text content
   * @param rating - mood rating (1–10)
   */
  public post(thought: string, rating: number): Ledger {
    const ratingUint8 = BigInt(rating); // contract expects bigint

    this.circuitContext = this.contract.impureCircuits.post(
      this.circuitContext,
      thought,
      ratingUint8,
    ).context;

    return this.getLedger(); // ✅ always normalized
  }

  /**
   * Remove the last journal entry (user-controlled deletion)
   */
  public delete(): Ledger {
    this.circuitContext = this.contract.impureCircuits.delete(
      this.circuitContext,
    ).context;
    return this.getLedger(); // ✅ always normalized
  }

  /**
   * Derive the public key associated with this user’s secret key
   */
  public publicKey(): Uint8Array {
    const sequence = convert_bigint_to_Uint8Array(
      32,
      this.getLedger().sequence,
    );
    return this.contract.circuits.publicKey(
      this.circuitContext,
      this.getPrivateState().secretKey,
      sequence,
    ).result;
  }
}
