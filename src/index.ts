import { config } from "dotenv";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { SiloData } from "./types/siloData";
import fs from "fs/promises";
import path from "path";

// Load environment variables
config();

// Initialize the LLM
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0.0,
});

// Create the prompt template
const promptTemplate = ChatPromptTemplate.fromTemplate(`
You are an expert in analyzing sand silo operations data. Analyze the following daily data and provide insights about:
1. Key events and operations
2. Any anomalies or concerns
3. Trends in volume changes
4. Sensor status and maintenance needs

Data:
{daily_data}

Provide your analysis in a clear, structured format.
`);

async function loadSampleData(): Promise<SiloData[]> {
  const dataPath = path.join(__dirname, "../data/sample-daily-data.json");
  const rawData = await fs.readFile(dataPath, "utf-8");
  const { siloData } = JSON.parse(rawData);
  return siloData;
}

async function analyzeSiloData(data: SiloData[]) {
  try {
    // Format the data for the prompt
    const formattedData = JSON.stringify(data, null, 2);

    // Create the prompt
    const prompt = await promptTemplate.formatMessages({
      daily_data: formattedData,
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
