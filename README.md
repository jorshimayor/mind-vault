# Mind Vault Journal

## Product Overview
Mind Vault is a privacy-first mental health journaling app built on the Midnight blockchain. It leverages zero-knowledge (ZK) proofs and programmable data protection to let users securely log journal entries, track moods, and share selective insights—without exposing sensitive personal data. The MVP is a web-first prototype, optimized for desktop and mobile browsers, with a roadmap for native mobile expansion.

## Key Features
- **Private Journal Entries:** Write and store encrypted journal entries on Midnight's blockchain. Only you can decrypt and view your content.
- **Selective Sharing via ZK Proofs:** Generate zero-knowledge proofs to share existence, timestamp, or excerpts of entries without revealing full content.
- **Responsive UI:** Built with React/Next.js and Tailwind CSS for seamless experience on desktop and mobile.
- **Blockchain Integration:** Uses Midnight SDK and Compact smart contracts for secure storage and access control.
- **Tokenomics:** Supports NIGHT and DUST tokens for low-cost transactions and user incentives.
- **Offline Support:** Progressive Web App (PWA) features for local caching and offline journaling.

## Tech Stack
- **Frontend:** React.js, Next.js, Tailwind CSS
- **Backend/Blockchain:** Midnight SDK, Compact smart contracts
- **Tokens:** NIGHT (staking), DUST (transaction fees)

## MVP Goals
- Demonstrate privacy features on Midnight testnet
- Highlight ZK proofs in mental health context
- Batch transactions for efficiency and low fees

## Usage
1. **Write a Journal Entry:**
   - Use the text editor to write your thoughts. Entries are encrypted client-side and stored on-chain.
2. **Share an Excerpt:**
   - Generate a ZK proof to share existence, timestamp, or excerpt without revealing full entry.
3. **Offline Journaling:**
   - Entries are cached locally and synced when online.

## Privacy & Security
- All entries are encrypted before upload.
- Only encrypted blobs and ZK-verifiable metadata are visible on-chain.
- No third-party data sharing; full data sovereignty for users.

## For Developers
- Compact smart contract source in `/contract`
- React/Next.js frontend in `/client`
- API and integration code in `/journal/api`

## License
MIT

---
