import express from "express";
import cors from "cors";
import { config } from "dotenv";
import { analyzeSiloData } from "./index";
import { siloDataSchema } from "./types/siloData";
import z from "zod";

// Load environment variables
config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
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

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
