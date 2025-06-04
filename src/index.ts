import { config } from "dotenv";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { SiloData } from "./types/siloData";
import { SiloRag } from "./rag/siloRag";
import { InsightParser } from "./parsers/insightParser";
import fs from "fs/promises";
import path from "path";

// Load environment variables
config();

// Initialize the LLM
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0.0,
});

// Initialize RAG system and parser
const siloRag = new SiloRag();
const insightParser = new InsightParser();

async function loadSampleData(): Promise<SiloData[]> {
  const __dirname = path.resolve();
  const dataPath = path.join(__dirname, "data/sample-daily-data.json");
  const rawData = await fs.readFile(dataPath, "utf-8");
  const { siloData } = JSON.parse(rawData);
  return siloData;
}

async function analyzeSiloData(data: SiloData[]) {
  try {
    // Initialize RAG system
    await siloRag.initialize();

    // Format the data for the prompt
    const formattedData = JSON.stringify(data, null, 2);

    // Get relevant context using RAG
    const { relevantContext } = await siloRag.analyzeSiloOperations(
      data,
      "Analyze current silo operations and identify any patterns or anomalies"
    );

    // Format the context for the prompt
    const contextText = relevantContext
      .map((doc, i) => `Context ${i + 1}:\n${doc.pageContent}\n`)
      .join("\n");

    // Create the prompt with both context and current data using the parser
    const prompt = await insightParser.formatPrompt(contextText, formattedData);

    // Get the LLM response
    const response = await llm.invoke(prompt);

    // Ensure we have a string response
    const responseContent =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);

    // Parse the response into structured insights
    const insights = await insightParser.parseLLMResponse(responseContent);

    // Log the structured insights
    console.log("\nAnalysis Results:");
    console.log("----------------");
    console.log("Summary:", insights.summary);

    if (insights.anomalies.length > 0) {
      console.log("\nDetected Anomalies:");
      if (insights.anomalies.length > 1) {
        insights.anomalies.sort((a, b) => {
          const severityOrder = {
            low: 1,
            medium: 2,
            high: 3,
          };
          return severityOrder[b.severity] - severityOrder[a.severity];
        });
      }
      insights.anomalies.forEach((anomaly, i) => {
        console.log(`\n${i + 1}. Type: ${anomaly.type}`);
        console.log(`   Description: ${anomaly.description}`);
        console.log(`   Severity: ${anomaly.severity}`);
        console.log(`   Recommendation: ${anomaly.recommendation}`);
      });
    }

    if (insights.trends.length > 0) {
      console.log("\nIdentified Trends:");
      insights.trends.forEach((trend, i) => {
        console.log(`\n${i + 1}. Metric: ${trend.metric}`);
        console.log(`   Description: ${trend.description}`);
        console.log(`   Impact: ${trend.impact}`);
      });
    }

    if (insights.recommendations.length > 0) {
      console.log("\nRecommendations:");
      insights.recommendations.forEach((rec, i) => {
        console.log(`${i + 1}. ${rec}`);
      });
    }

    return insights;
  } catch (error) {
    console.error("Error analyzing silo data:", error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    console.log("Loading sample data...");
    const data = await loadSampleData();

    console.log("Analyzing silo data...");
    await analyzeSiloData(data);
  } catch (error) {
    console.error("Error in main execution:", error);
    process.exit(1);
  }
}

// Run the main function
main();
