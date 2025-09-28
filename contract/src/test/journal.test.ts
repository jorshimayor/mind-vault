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

import { JournalSimulator } from "./journal-simulator";
import {
  NetworkId,
  setNetworkId,
} from "@midnight-ntwrk/midnight-js-network-id";
import { describe, it, expect } from "vitest";
import { randomBytes } from "./utils.js";
import { State } from "../managed/journal/contract/index.cjs";

setNetworkId(NetworkId.Undeployed);

describe("Journal smart contract", () => {
  it("generates initial ledger state deterministically", () => {
    const key = randomBytes(32);
    const sim0 = new JournalSimulator(key);
    const sim1 = new JournalSimulator(key);
    expect(sim0.getLedger()).toEqual(sim1.getLedger());
  });

  it("properly initializes ledger and private state", () => {
    const key = randomBytes(32);
    const sim = new JournalSimulator(key);
    const initialLedger = sim.getLedger();
    expect(initialLedger.sequence).toEqual(1n);
    expect(initialLedger.entry.is_some).toEqual(false);
    expect(initialLedger.owner).toEqual(new Uint8Array(32));
    expect(initialLedger.state).toEqual(State.VACANT);
    const initialPrivateState = sim.getPrivateState();
    expect(initialPrivateState).toEqual({ secretKey: key });
  });

  it("lets you post a journal entry", () => {
    const sim = new JournalSimulator(randomBytes(32));
    const initialPrivate = sim.getPrivateState();
    const thought = "The night is dark and full of terrors.";
    const mood = 7;
    sim.post(thought, mood);
    // Private state remains unchanged
    expect(initialPrivate).toEqual(sim.getPrivateState());
    // Public ledger should update correctly
    const ledger = sim.getLedger();
    expect(ledger.sequence).toEqual(1n);
    expect(ledger.entry.is_some).toEqual(true);
    expect(ledger.entry.value.thought).toEqual(thought);
    expect(ledger.entry.value.rating).toEqual(mood);
    expect(ledger.owner).toEqual(sim.publicKey());
    expect(ledger.state).toEqual(State.OCCUPIED);
  });

  it("lets you delete a journal entry", () => {
    const sim = new JournalSimulator(randomBytes(32));
    const initialPrivate = sim.getPrivateState();
    const initialPubKey = sim.publicKey();
    const thought = "I am the sword in the darkness.";
    const mood = 9;
    sim.post(thought, mood);
    sim.delete();
    // Private state remains unchanged
    expect(initialPrivate).toEqual(sim.getPrivateState());
    // Ledger should reset correctly
    const ledger = sim.getLedger();
    expect(ledger.sequence).toEqual(2n);
    expect(ledger.entry.is_some).toEqual(false);
    // Owner not cleared by circuit
    expect(ledger.owner).toEqual(initialPubKey);
    expect(ledger.state).toEqual(State.VACANT);
  });

  it("lets you post again after deleting", () => {
    const sim = new JournalSimulator(randomBytes(32));
    const initialPrivate = sim.getPrivateState();
    sim.post("First entry", 5);
    sim.delete();
    const thought = "Second entry after deletion.";
    const mood = 8;
    sim.post(thought, mood);
    // Private state remains unchanged
    expect(initialPrivate).toEqual(sim.getPrivateState());
    // Ledger reflects new entry
    const ledger = sim.getLedger();
    expect(ledger.sequence).toEqual(2n);
    expect(ledger.entry.is_some).toEqual(true);
    expect(ledger.entry.value.thought).toEqual(thought);
    expect(ledger.entry.value.rating).toEqual(mood);
    expect(ledger.owner).toEqual(sim.publicKey());
    expect(ledger.state).toEqual(State.OCCUPIED);
  });

  it("lets a different user post after deletion", () => {
    const sim = new JournalSimulator(randomBytes(32));
    sim.post("My private thought.", 6);
    sim.delete();
    sim.switchUser(randomBytes(32));
    const thought = "A new user's thought.";
    const mood = 4;
    sim.post(thought, mood);
    const ledger = sim.getLedger();
    expect(ledger.sequence).toEqual(2n);
    expect(ledger.entry.is_some).toEqual(true);
    expect(ledger.entry.value.thought).toEqual(thought);
    expect(ledger.entry.value.rating).toEqual(mood);
    expect(ledger.owner).toEqual(sim.publicKey());
    expect(ledger.state).toEqual(State.OCCUPIED);
  });

  it("doesn't let the same user post twice without deleting", () => {
    const sim = new JournalSimulator(randomBytes(32));
    sim.post("First entry", 5);
    expect(() => sim.post("Second entry", 7)).toThrow(
      "failed assert: Cannot post: journal is already occupied"
    );
  });

  it("doesn't let different users post if occupied", () => {
    const sim = new JournalSimulator(randomBytes(32));
    sim.post("Entry from user A", 3);
    sim.switchUser(randomBytes(32));
    expect(() => sim.post("Entry from user B", 4)).toThrow(
      "failed assert: Cannot post: journal is already occupied"
    );
  });

  it("doesn't let another user delete the entry", () => {
    const sim = new JournalSimulator(randomBytes(32));
    sim.post("My secret.", 10);
    sim.switchUser(randomBytes(32));
    expect(() => sim.delete()).toThrow(
      "failed assert: Not authorized to delete this entry"
    );
  });

  it("rejects invalid mood ratings", () => {
    const sim = new JournalSimulator(randomBytes(32));
    expect(() => sim.post("Bad mood", 0)).toThrow(
      "failed assert: Mood must be between 1 and 10"
    );
    expect(() => sim.post("Too happy", 11)).toThrow(
      "failed assert: Mood must be between 1 and 10"
    );
  });
});
