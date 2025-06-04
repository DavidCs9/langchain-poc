# Sand Silo Operations AI Analysis PoC

A proof of concept for AI-powered analysis of sand silo operations data using LangChain.js.

## Project Overview

This project implements an AI-driven system for analyzing sand silo operations data, providing intelligent insights, anomaly detection, and proactive recommendations using LangChain.js and OpenAI's GPT models.

## Features

- Raw data ingestion and processing
- AI-powered analysis of silo operations
- Anomaly detection
- Proactive recommendations
- Retrieval Augmented Generation (RAG) for context-aware responses

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- OpenAI API key

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   OPENAI_API_KEY=your-api-key-here
   NODE_ENV=development
   ```
4. Build the project:
   ```bash
   npm run build
   ```

## Project Structure

```
sand-silo-insights-poc/
├── src/
│   ├── index.ts              # Main entry point
│   ├── types/               # TypeScript type definitions
│   ├── rag/                 # RAG implementation
│   └── parsers/             # Output parsing utilities
├── data/                    # Sample and test data
├── .env                     # Environment variables (create from .env.example)
├── package.json
└── tsconfig.json
```

## Development

To start the development server:

```bash
npm run dev
```

## License

ISC
