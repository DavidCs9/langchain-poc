import { Document } from "langchain/document";
import { VectorStore } from "./rag/vectorStore";
import dotenv from "dotenv";

dotenv.config();

async function testRAG() {
  try {
    console.log("Initializing vector store...");
    const vectorStore = new VectorStore();
    await vectorStore.initialize();
    console.log("Vector store initialized successfully");

    // Sample documents about silo operations
    const documents = [
      new Document({
        pageContent: `The sand silo #1 was filled to 85% capacity on March 15th, 2024. 
        The filling operation took 2 hours and 15 minutes. 
        Temperature during filling was maintained at 25°C.`,
        metadata: { siloId: "SILO-001", date: "2024-03-15" },
      }),
      new Document({
        pageContent: `Silo #2 experienced a minor pressure fluctuation during the 
        morning shift on March 16th. The pressure stabilized after 30 minutes. 
        No material loss was reported.`,
        metadata: { siloId: "SILO-002", date: "2024-03-16" },
      }),
      new Document({
        pageContent: `Regular maintenance was performed on silo #3 on March 17th. 
        The inspection revealed normal wear and tear. 
        All safety systems were functioning properly.`,
        metadata: { siloId: "SILO-003", date: "2024-03-17" },
      }),
    ];

    console.log("\nAdding documents to vector store...");
    await vectorStore.addDocuments(documents);
    console.log("Documents added successfully");

    // Add a small delay to allow index to be ready
    console.log("Waiting for index to be ready...");
    await new Promise((resolve) => setTimeout(resolve, 8000));

    // Test queries
    const testQueries = [
      "What happened with silo pressure?",
      "Tell me about silo maintenance",
      "When was silo #1 filled?",
    ];

    console.log("\nTesting similarity search...");
    for (const query of testQueries) {
      console.log(`\nQuery: "${query}"`);
      const results = await vectorStore.similaritySearch(query, 1); // Reduced to 1 result for clearer output
      console.log("Results:");
      if (results.length === 0) {
        console.log("No results found");
      } else {
        results.forEach((doc, i) => {
          console.log(`\n${i + 1}. Score: ${doc.metadata.score}`);
          console.log(`Content: ${doc.pageContent}`);
          console.log(`Metadata:`, doc.metadata);
        });
      }
    }

    // Direct test: use exact document text as query
    const exactText = documents[0].pageContent;
    console.log("\nDirect test: Query with exact document text");
    const directResults = await vectorStore.similaritySearch(exactText, 1);
    if (directResults.length === 0) {
      console.log("No results found for exact text query");
    } else {
      directResults.forEach((doc, i) => {
        console.log(`\n${i + 1}. Score: ${doc.metadata.score}`);
        console.log(`Content: ${doc.pageContent}`);
        console.log(`Metadata:`, doc.metadata);
      });
    }

    // Clean up
    console.log("\nCleaning up vector store...");
    await vectorStore.deleteAll();
    console.log("Vector store cleaned up successfully");
  } catch (error) {
    console.error("Error during RAG test:", error);
  }
}

// Run the test
testRAG();
