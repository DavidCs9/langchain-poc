import { z } from "zod";

export const transferOperationSchema = z.object({
  type: z.enum(["inflow", "outflow"]),
  volume: z.number(), // in tons
  durationHours: z.number(),
  timestamp: z.string().datetime(), // ISO 8601 format
});

export const sensorStatusSchema = z.object({
  sensorId: z.string(),
  status: z.enum(["operational", "malfunction", "maintenance"]),
  lastCalibrationDate: z.string().datetime().optional(), // ISO 8601 format
});

export const siloDataSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  siloId: z.string(),
  currentVolumePercentage: z.number().min(0).max(100), // 0-100
  dailyVolumeChange: z.number(), // in tons, negative for decrease
  materialType: z.enum(["Fine Sand", "Coarse Sand", "Mixed Sand"]),
  transferOperations: z.array(transferOperationSchema),
  sensorStatus: z.array(sensorStatusSchema),
  temperature: z.number().optional(), // in Celsius
  humidity: z.number().optional(), // percentage
  notes: z.string().optional(),
});

// Infer types from schemas
export type TransferOperation = z.infer<typeof transferOperationSchema>;
export type SensorStatus = z.infer<typeof sensorStatusSchema>;
export type SiloData = z.infer<typeof siloDataSchema>;
export type SiloDataArray = SiloData[];
