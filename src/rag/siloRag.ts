import { Document } from "langchain/document";
import { VectorStore } from "./vectorStore";
import { SiloData } from "../types/siloData";

export class SiloRag {
  private vectorStore: VectorStore;
  private isInitialized: boolean = false;

  constructor() {
    this.vectorStore = new VectorStore();
  }

  async initialize() {
    if (!this.isInitialized) {
      await this.vectorStore.initialize();
      this.isInitialized = true;
    }
  }

  private createDocumentFromSiloData(data: SiloData): Document {
    // Create a text representation of the silo data
    const content = `
      Silo ${data.siloId} Status Report for ${data.date}:
      Current Volume: ${data.currentVolumePercentage}%
      Daily Volume Change: ${data.dailyVolumeChange} tons
      Material Type: ${data.materialType}
      
      Transfer Operations:
      ${data.transferOperations
        .map(
          (op) =>
            `- ${op.type}: ${op.volume} tons over ${op.durationHours} hours at ${op.timestamp}`
        )
        .join("\n")}
      
      Sensor Status:
      ${data.sensorStatus
        .map(
          (sensor) =>
            `- ${sensor.sensorId}: ${sensor.status}${
              sensor.lastCalibrationDate
                ? ` (Last calibrated: ${sensor.lastCalibrationDate})`
                : ""
            }`
        )
        .join("\n")}
      
      ${data.temperature ? `Temperature: ${data.temperature}°C` : ""}
      ${data.humidity ? `Humidity: ${data.humidity}%` : ""}
      ${data.notes ? `Notes: ${data.notes}` : ""}
    `.trim();

    return new Document({
      pageContent: content,
      metadata: {
        date: data.date,
        siloId: data.siloId,
        materialType: data.materialType,
      },
    });
  }

  async addSiloData(data: SiloData[]) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const documents = data.map((data) =>
      this.createDocumentFromSiloData(data)
    ) as Document[];
    await this.vectorStore.addDocuments(documents);
  }

  async searchSimilarOperations(
    query: string,
    k: number = 4
  ): Promise<Document[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return this.vectorStore.similaritySearch(query, k);
  }

  // Example of how to use the RAG system for analysis
  async analyzeSiloOperations(
    data: SiloData[],
    query: string
  ): Promise<{
    relevantContext: Document[];
    analysis: string;
  }> {
    // First, add the new data to our vector store
    await this.addSiloData(data);

    // Then, search for relevant context
    const relevantContext = await this.searchSimilarOperations(query);

    // In a real implementation, you would use this context to inform the LLM's analysis
    // For now, we'll just return the context and a placeholder analysis
    return {
      relevantContext,
      analysis: `Found ${relevantContext.length} relevant historical operations that might inform the analysis of: ${query}`,
    };
  }
}
