import { Pinecone } from "@pinecone-database/pinecone";
import { Document } from "langchain/document";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export class VectorStore {
  private pinecone: Pinecone | null = null;
  private embeddingPipeline: any = null;
  private readonly dimension = 384; // Dimension for 'Xenova/all-MiniLM-L6-v2' model
  private readonly indexName = "silo-operations";

  async initialize() {
    const { pipeline } = await import("@xenova/transformers");
    // Initialize the embedding pipeline
    this.embeddingPipeline = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );

    // Initialize Pinecone
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY || "",
    });

    // Delete and recreate index for a clean test
    await this.deleteAndRecreateIndex();
  }

  private async deleteAndRecreateIndex() {
    if (!this.pinecone) return;
    const indexes = await this.pinecone.listIndexes();
    const indexExists =
      indexes.indexes?.some(
        (index: { name: string }) => index.name === this.indexName
      ) ?? false;
    if (indexExists) {
      await this.pinecone.deleteIndex(this.indexName);
      // Wait for deletion to propagate by polling
      for (let i = 0; i < 15; i++) {
        // up to ~15 seconds
        const indexesAfterDelete = await this.pinecone.listIndexes();
        const stillExists = indexesAfterDelete.indexes?.some(
          (index: { name: string }) => index.name === this.indexName
        );
        if (!stillExists) break;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    await this.pinecone.createIndex({
      name: this.indexName,
      dimension: this.dimension,
      spec: {
        serverless: {
          cloud: "aws",
          region: "us-east-1",
        },
      },
    });
    // Wait a bit for creation to propagate
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  private async getEmbedding(text: string): Promise<number[]> {
    const output = await this.embeddingPipeline(text, {
      pooling: "mean",
      normalize: true,
    });
    const embedding = Array.from(output.data) as number[];
    // Debug log: print shape and sample of embedding
    console.log(
      "[DEBUG] Embedding shape:",
      Array.isArray(embedding) ? embedding.length : typeof embedding
    );
    console.log("[DEBUG] Embedding sample:", embedding.slice(0, 8));
    return embedding;
  }

  async addDocuments(documents: Document[]) {
    if (!this.pinecone) {
      throw new Error("Vector store not initialized. Call initialize() first.");
    }

    // Split documents into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const chunks = await textSplitter.splitDocuments(documents);
    const index = this.pinecone.index(this.indexName);

    // Helper function to sanitize metadata
    const sanitizeMetadata = (
      metadata: Record<string, any>
    ): Record<string, string | number | boolean | string[]> => {
      const sanitized: Record<string, string | number | boolean | string[]> =
        {};
      for (const [key, value] of Object.entries(metadata)) {
        // Skip complex objects and null/undefined values
        if (
          value === null ||
          value === undefined ||
          typeof value === "object"
        ) {
          continue;
        }
        // Only keep primitive values and arrays of strings
        if (
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean" ||
          (Array.isArray(value) &&
            value.every((item) => typeof item === "string"))
        ) {
          sanitized[key] = value;
        }
      }
      return sanitized;
    };

    // Process each chunk
    for (const [i, chunk] of chunks.entries()) {
      const embedding = await this.getEmbedding(chunk.pageContent);
      const id = `doc_${Date.now()}_${i}`;

      // Sanitize metadata before storing
      const sanitizedMetadata = sanitizeMetadata({
        content: chunk.pageContent,
        ...chunk.metadata,
      });

      await index.upsert([
        {
          id,
          values: embedding,
          metadata: sanitizedMetadata,
        },
      ]);
      console.log(`[DEBUG] Upsert response for ${id}`);
    }
  }

  async similaritySearch(query: string, k: number = 4): Promise<Document[]> {
    if (!this.pinecone) {
      throw new Error("Vector store not initialized. Call initialize() first.");
    }

    const queryEmbedding = await this.getEmbedding(query);
    const index = this.pinecone.index(this.indexName);

    const results = await index.query({
      vector: queryEmbedding,
      topK: k,
      includeMetadata: true,
    });

    return results.matches.map(
      (match) =>
        new Document({
          pageContent: (match.metadata?.content as string) || "",
          metadata: {
            score: match.score,
            ...match.metadata,
          },
        })
    );
  }

  async deleteAll() {
    if (!this.pinecone) {
      throw new Error("Vector store not initialized. Call initialize() first.");
    }

    const index = this.pinecone.index(this.indexName);
    await index.deleteAll();
  }
}
