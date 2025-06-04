import { z } from "zod";
import { StructuredOutputParser } from "langchain/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";

// Define the schema for parsed insights
export const InsightSchema = z.object({
  summary: z
    .string()
    .describe("A concise summary of the silo operations analysis"),
  anomalies: z
    .array(
      z.object({
        type: z
          .enum(["volume", "sensor", "operation"])
          .describe("Type of anomaly detected"),
        description: z.string().describe("Detailed description of the anomaly"),
        severity: z
          .enum(["low", "medium", "high"])
          .describe("Severity level of the anomaly"),
        recommendation: z
          .string()
          .describe("Recommended action to address the anomaly"),
      })
    )
    .describe("List of detected anomalies"),
  trends: z
    .array(
      z.object({
        metric: z.string().describe("The metric being analyzed"),
        description: z.string().describe("Description of the trend"),
        impact: z
          .enum(["positive", "negative", "neutral"])
          .describe("Impact of the trend"),
      })
    )
    .describe("List of identified trends"),
  recommendations: z
    .array(z.string())
    .describe("List of actionable recommendations"),
});

export type Insight = z.infer<typeof InsightSchema>;

export class InsightParser {
  private parser: StructuredOutputParser<typeof InsightSchema>;
  private promptTemplate: PromptTemplate;

  constructor() {
    this.parser = StructuredOutputParser.fromZodSchema(InsightSchema);
    this.promptTemplate = PromptTemplate.fromTemplate(`
You are an expert in analyzing sand silo operations data. Analyze the following data and provide insights in a structured format.

{format_instructions}

Historical Context:
{context}

Current Data to Analyze:
{daily_data}

Based on both the historical context and current data, provide your analysis following the specified format.
`);
  }

  async parseLLMResponse(response: string): Promise<Insight> {
    try {
      // Parse the response using the structured output parser
      const parsedOutput = await this.parser.parse(response);
      return parsedOutput;
    } catch (error) {
      console.error("Error parsing LLM response:", error);
      throw new Error("Failed to parse LLM response into structured insights");
    }
  }

  getFormatInstructions(): string {
    return this.parser.getFormatInstructions();
  }

  async formatPrompt(context: string, dailyData: string): Promise<string> {
    return this.promptTemplate.format({
      format_instructions: this.getFormatInstructions(),
      context,
      daily_data: dailyData,
    });
  }
}
