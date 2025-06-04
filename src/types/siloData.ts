export interface TransferOperation {
  type: "inflow" | "outflow";
  volume: number; // in tons
  durationHours: number;
  timestamp: string; // ISO 8601 format
}

export interface SensorStatus {
  sensorId: string;
  status: "operational" | "malfunction" | "maintenance";
  lastCalibrationDate?: string; // ISO 8601 format
}

export interface SiloData {
  date: string; // YYYY-MM-DD
  siloId: string;
  currentVolumePercentage: number; // 0-100
  dailyVolumeChange: number; // in tons, negative for decrease
  materialType: "Fine Sand" | "Coarse Sand" | "Mixed Sand";
  transferOperations: TransferOperation[];
  sensorStatus: SensorStatus[];
  temperature?: number; // in Celsius
  humidity?: number; // percentage
  notes?: string;
}

export type SiloDataArray = SiloData[];
