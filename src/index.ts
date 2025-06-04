import { config } from "dotenv";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { SiloData } from "./types/siloData";
import { SiloRag } from "./rag/siloRag";
import fs from "fs/promises";
import path from "path";

// Load environment variables
config();

// Initialize the LLM
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0.0,
});

// Initialize RAG system
const siloRag = new SiloRag();

// Create the prompt template
const promptTemplate = ChatPromptTemplate.fromTemplate(`
You are an expert in analyzing sand silo operations data. Use the following context from similar historical operations to inform your analysis:

Historical Context:
{context}

Current Data to Analyze:
{daily_data}

Based on both the historical context and current data, provide insights about:
1. Key events and operations
2. Any anomalies or concerns
3. Trends in volume changes
4. Sensor status and maintenance needs

Provide your analysis in a clear, structured format.
`);

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

    // Create the prompt with both context and current data
    const prompt = await promptTemplate.formatMessages({
      context: contextText,
      daily_data: formattedData,
    });

    // Debug log: print the prompt
    console.log("Context:", {
      context: contextText,
      daily_data: formattedData,
      prompt: prompt,
    });

    // Get the LLM response
    const response = await llm.invoke(prompt);

    console.log("Analysis Results:");
    console.log("----------------");
    console.log(response.content);
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
