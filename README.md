# Silo Operations Analysis PoC

This is a Proof of Concept (PoC) project that demonstrates the use of LangChain and Google's Gemini AI model for analyzing silo operations data. The system uses Retrieval Augmented Generation (RAG) to provide context-aware analysis of silo operations, identifying patterns, anomalies, and generating actionable insights.

## Features

- 🤖 Powered by Google's Gemini 2.0 Flash model
- 🔍 Context-aware analysis using RAG (Retrieval Augmented Generation)
- 📊 Structured insights generation including:
  - Anomaly detection with severity levels
  - Trend identification
  - Actionable recommendations
- 🌐 REST API endpoint for data analysis
- 📝 Support for both sample data and custom data input

## Technical Stack

- Node.js/TypeScript
- LangChain
- Google Generative AI (Gemini)
- Express.js
- Zod for data validation

## API Endpoints

### Health Check

```
GET /health
```

Returns the API health status.

### Analyze Silo Data

```
POST /api/analyze
```

Analyzes silo operations data and returns structured insights.

**Request Body:**

```json
{
  "siloData": [
    // Array of silo data objects
  ]
}
```

**Response:**
Returns structured insights including:

- Summary
- Anomalies (sorted by severity)
- Trends
- Recommendations

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with required environment variables:
   ```
   PORT=3000
   GOOGLE_API_KEY=your_google_api_key
   ```
4. Start the server:
   ```bash
   npm start
   ```

## Development

This is a PoC project demonstrating the integration of LangChain with Google's Gemini model for industrial data analysis. The system is designed to be extensible and can be adapted for various industrial monitoring and analysis use cases.

## Note

This is a Proof of Concept and should not be used in production without proper testing and security measures.
