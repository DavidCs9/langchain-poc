import express from "express";
import cors from "cors";
import { config } from "dotenv";
import { analyzeSiloData, loadSampleData } from "./index";
import { siloDataSchema } from "./types/siloData";
import { HTMLReportGenerator } from "./htmlGenerator";
import z from "zod";
import path from "path";

// Load environment variables
config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use("/public", express.static(path.join(process.cwd(), "public")));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Load sample data endpoint
app.get("/api/sample-data", async (req, res) => {
  try {
    const sampleData = await loadSampleData();
    res.json({ siloData: sampleData });
  } catch (error) {
    console.error("Error loading sample data:", error);
    res.status(500).json({
      error: "Failed to load sample data",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Analyze silo data endpoint
app.post("/api/analyze", async (req, res) => {
  try {
    // If data is provided in the request body, use it
    // Otherwise, load sample data
    const data = z.array(siloDataSchema).parse(req.body.siloData);

    const insights = await analyzeSiloData(data);
    res.json(insights);
  } catch (error) {
    console.error("Error in analyze endpoint:", error);
    res.status(500).json({
      error: "Failed to analyze silo data",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Generate HTML report endpoint
app.post("/api/generate-report", async (req, res) => {
  try {
    // If data is provided in the request body, use it. Otherwise, load sample data
    let data;
    if (req.body.siloData && Array.isArray(req.body.siloData)) {
      data = z.array(siloDataSchema).parse(req.body.siloData);
    } else {
      data = await loadSampleData();
    }

    // Analyze the data to get insights
    const insights = await analyzeSiloData(data);

    // Generate HTML report
    const html = await HTMLReportGenerator.generateReport(insights);

    // Create a unique filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `silo-report-${timestamp}.html`;

    // Save the HTML file
    await HTMLReportGenerator.saveReportToFile(html, filename);

    // Return the URL to access the report
    const reportUrl = `http://localhost:${port}/public/reports/${filename}`;

    res.json({
      success: true,
      insights,
      reportUrl,
      filename,
    });
  } catch (error) {
    console.error("Error in generate-report endpoint:", error);
    res.status(500).json({
      error: "Failed to generate HTML report",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
