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
      // Filling operations
      new Document({
        pageContent: `The sand silo #1 was filled to 85% capacity on March 15th, 2024. 
        The filling operation took 2 hours and 15 minutes. 
        Temperature during filling was maintained at 25°C.`,
        metadata: {
          siloId: "SILO-001",
          date: "2024-03-15",
          operationType: "filling",
        },
      }),
      new Document({
        pageContent: `Silo #2 was filled to 92% capacity on March 18th, 2024.
        The operation took 3 hours due to slower feed rate.
        Temperature reached 28°C during peak filling.`,
        metadata: {
          siloId: "SILO-002",
          date: "2024-03-18",
          operationType: "filling",
        },
      }),
      new Document({
        pageContent: `The sand silo #1 was filled to 85% capacity on March 20th, 2024. 
        The filling operation took 2 hours and 15 minutes. 
        Temperature during filling was maintained at 25°C.`,
        metadata: {
          siloId: "SILO-001",
          date: "2024-03-20",
          operationType: "filling",
        },
      }),

      // Pressure and safety incidents
      new Document({
        pageContent: `Silo #2 experienced a minor pressure fluctuation during the 
        morning shift on March 16th. The pressure stabilized after 30 minutes. 
        No material loss was reported.`,
        metadata: {
          siloId: "SILO-002",
          date: "2024-03-16",
          operationType: "incident",
        },
      }),
      new Document({
        pageContent: `Critical pressure alarm triggered in Silo #4 at 02:15 AM on March 19th.
        Emergency response team activated. Pressure normalized after 45 minutes.
        Root cause: Blocked vent filter. Filter replaced and system restored.`,
        metadata: {
          siloId: "SILO-004",
          date: "2024-03-19",
          operationType: "incident",
        },
      }),

      // Maintenance operations
      new Document({
        pageContent: `Regular maintenance was performed on silo #3 on March 17th. 
        The inspection revealed normal wear and tear. 
        All safety systems were functioning properly.`,
        metadata: {
          siloId: "SILO-003",
          date: "2024-03-17",
          operationType: "maintenance",
        },
      }),
      new Document({
        pageContent: `Annual overhaul of Silo #1 completed on March 22nd.
        Replaced worn conveyor belts, serviced pressure relief valves.
        Calibrated all sensors and updated control software.
        Total downtime: 48 hours.`,
        metadata: {
          siloId: "SILO-001",
          date: "2024-03-22",
          operationType: "maintenance",
        },
      }),

      // Emptying operations
      new Document({
        pageContent: `Silo #3 emptied to 15% capacity on March 21st.
        Operation completed in 4 hours with no issues.
        Final material quality check passed all specifications.`,
        metadata: {
          siloId: "SILO-003",
          date: "2024-03-21",
          operationType: "emptying",
        },
      }),
      new Document({
        pageContent: `Emergency emptying of Silo #2 initiated on March 23rd due to
        suspected material contamination. Operation completed in 6 hours.
        Material quarantined for analysis.`,
        metadata: {
          siloId: "SILO-002",
          date: "2024-03-23",
          operationType: "emptying",
        },
      }),

      // Safety inspections
      new Document({
        pageContent: `Quarterly safety inspection of Silo #4 conducted on March 24th.
        All safety systems operational. Fire suppression system tested.
        Emergency lighting and alarms verified. No issues found.`,
        metadata: {
          siloId: "SILO-004",
          date: "2024-03-24",
          operationType: "inspection",
        },
      }),
      new Document({
        pageContent: `Routine safety check of Silo #1 on March 25th revealed
        minor corrosion on access ladder. Repairs scheduled for next week.
        All other safety systems functioning normally.`,
        metadata: {
          siloId: "SILO-001",
          date: "2024-03-25",
          operationType: "inspection",
        },
      }),

      // Environmental monitoring
      new Document({
        pageContent: `Environmental monitoring of Silo #3 area on March 26th.
        Dust levels within acceptable range. Noise levels normal.
        No environmental concerns detected.`,
        metadata: {
          siloId: "SILO-003",
          date: "2024-03-26",
          operationType: "monitoring",
        },
      }),
      new Document({
        pageContent: `Weekly air quality test around Silo #2 perimeter.
        Particulate matter levels: 0.5 mg/m³ (below threshold).
        Ventilation system operating efficiently.`,
        metadata: {
          siloId: "SILO-002",
          date: "2024-03-27",
          operationType: "monitoring",
        },
      }),

      // Equipment calibration
      new Document({
        pageContent: `Calibration of Silo #4 level sensors completed on March 28th.
        All sensors within ±0.5% accuracy. Pressure transducers verified.
        Temperature probes recalibrated.`,
        metadata: {
          siloId: "SILO-004",
          date: "2024-03-28",
          operationType: "calibration",
        },
      }),
      new Document({
        pageContent: `Routine calibration of Silo #1 weight sensors.
        Zero point adjusted. Load cell verification passed.
        New calibration certificates issued.`,
        metadata: {
          siloId: "SILO-001",
          date: "2024-03-29",
          operationType: "calibration",
        },
      }),

      // Material quality checks
      new Document({
        pageContent: `Quality inspection of material in Silo #3 on March 30th.
        Moisture content: 0.8% (within spec). Particle size distribution normal.
        No contamination detected.`,
        metadata: {
          siloId: "SILO-003",
          date: "2024-03-30",
          operationType: "quality",
        },
      }),
      new Document({
        pageContent: `Batch quality check of Silo #2 contents.
        Chemical composition within specifications.
        Density measurements consistent with standard.`,
        metadata: {
          siloId: "SILO-002",
          date: "2024-03-31",
          operationType: "quality",
        },
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
      // Basic operational queries
      "What happened with silo pressure?",
      "Tell me about silo maintenance",
      "When was silo #1 filled?",

      // Specific measurement queries
      "What were the temperature readings during silo operations?",
      "Show me capacity levels for silo #1",
      "What were the dust levels around the silos?",

      // Incident and safety queries
      "Were there any critical incidents in the silos?",
      "What safety inspections were performed?",
      "Tell me about any pressure alarms",

      // Maintenance and calibration queries
      "What maintenance work was done on silo #1?",
      "When were the sensors last calibrated?",
      "Show me calibration results for level sensors",

      // Quality and environmental queries
      "What quality checks were performed?",
      "Tell me about material contamination",
      "What were the environmental monitoring results?",

      // Time-based queries
      "What operations happened on March 22nd?",
      "Show me all silo activities from March 15th to March 20th",
      "What was the last maintenance performed?",

      // Specific silo queries
      "What happened with silo #4?",
      "Show me all operations for silo #2",
      "What incidents occurred in silo #3?",

      // Complex queries
      "What maintenance was done after pressure incidents?",
      "Show me quality checks after filling operations",
      "What safety measures were taken during emptying operations?",

      // Measurement threshold queries
      "Were there any operations with temperature above 25°C?",
      "Show me operations with capacity above 90%",
      "What were the dust levels below threshold?",

      // Emergency and critical operations
      "Were there any emergency operations?",
      "What critical alarms were triggered?",
      "Show me emergency emptying operations",
    ];

    console.log("\nTesting similarity search...");
    for (const query of testQueries) {
      console.log(`\nQuery: "${query}"`);
      const results = await vectorStore.similaritySearch(query, 2); // Increased to 2 results for better coverage
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
