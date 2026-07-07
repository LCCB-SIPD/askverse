# AskVerse

AskVerse is a wallet-connected Q&A app where users can ask questions, share answers, heart useful posts, and send XLM gifts to helpful answer creators. The app also includes a leaderboard that ranks users by the up-vote score they earn from gifted answers.

## Hackathon Submission

**Project Description:**  
AskVerse is a wallet-connected Q&A platform that helps communities reward useful knowledge. Users can ask questions, answer posts, heart helpful content, send XLM gifts to valuable answers, and compete on a leaderboard based on gifted answer score.

**GitHub Repository Link:**  
https://github.com/LCCB-SIPD/askverse.git

**Live Demo:**  
https://askverse-pi.vercel.app/

**Video Demo Link:**  
[![AskVerse video demo](https://drive.google.com/thumbnail?id=10wXNliNkMXPn7wIUB3l65hrJZ7KT7n47)](https://drive.google.com/file/d/1NMawIzTk_0krOAeY8xzMi5ykWmgvEO3d/view?usp=sharing)

**Presentation (PPT) Link:**  
https://canva.link/qnrbb2f8ll3fq7l

## Contract Addresses

### EVM - Base Sepolia

```env
NEXT_PUBLIC_RPC_ENDPOINT=https://sepolia.base.org
NEXT_PUBLIC_TOKENADDRESS=0x7E0A673a70eC87C0a16370929280da2483703e62
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=67d2d578d855e579911095f9db6d4b29
```

### Stellar / Soroban Testnet

```env
NEXT_PUBLIC_STELLAR_HORIZON=https://horizon-testnet.stellar.org
NEXT_PUBLIC_STELLAR_CONTRACT_ID=CCYP4YM6HBHLZSXPYMX7EBFZPJUB3N7RWXXPPQ2CLNPW2R5URNYNW6V7
NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
```

## Features

- Ask questions with a title and detailed body
- Browse, search, and filter the community feed
- Answer questions from other users
- Heart posts in the feed
- Send XLM gifts to helpful answers
- Track profile balance and total up-vote score
- Edit display name and username
- View leaderboards for top answer creators
- Connect EVM and Non-EVM wallets through Cordy Minikit

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- CSS Modules
- Supabase
- TanStack Query
- CordyStack Cordy Minikit
- Stellar testnet support
- Base Sepolia EVM support

## App Routes

- `/` - landing page
- `/auth/sign-in` - wallet sign-in
- `/home` - main Q&A feed
- `/leader_boards` - top users by gifted answer score

## API Routes

- `/services/supabase/auth` - create or authenticate user profile
- `/services/supabase/retrieve` - retrieve user profile
- `/services/supabase/update` - update profile
- `/services/supabase/post` - create a question
- `/services/supabase/retrieve_post` - retrieve questions and answers
- `/services/supabase/answer` - submit an answer
- `/services/supabase/hearts` - toggle post hearts
- `/services/supabase/upvote` - record gifted answer score
- `/services/supabase/health` - health check

## Getting Started

Install dependencies:

```bash
npm install
```

Create `.env.local` and add your own project values:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=
SUPABASE_PUBLISHABLE_KEY=

NEXT_PUBLIC_RPC_ENDPOINT=
NEXT_PUBLIC_TOKENADDRESS=
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=

NEXT_PUBLIC_STELLAR_HORIZON=
NEXT_PUBLIC_STELLAR_CONTRACT_ID=
NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE=
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## How Rewards Work

AskVerse does not automatically mint rewards. Users can send XLM gifts to answers they find helpful. Those gifts are recorded as up-vote score, and the leaderboard ranks users by the total score earned from their answers.

## Live Demo

https://askverse-pi.vercel.app/

## Repository

https://github.com/LCCB-SIPD/askverse.git

## Team

**Marc Giestin Louis Cordova (CordyStackX)**  
Founder and Lead Developer

- Designed and developed the platform
- Built the frontend and backend routes
- Integrated wallet connection
- Implemented question, answer, gift, profile, and leaderboard flows

**Gilbert Lerion** - Developer

**Julian Martir** and **Angel Lucenio**  
Documentation and Presentation

- Prepared project documentation
- Created the pitch deck
- Presented the project during the hackathon

## License

MIT
