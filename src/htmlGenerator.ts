import { Insight } from "./parsers/insightParser";
import fs from "fs/promises";
import path from "path";

export class HTMLReportGenerator {
  static async generateReport(insights: Insight): Promise<string> {
    const timestamp = new Date().toLocaleString();

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Silo Operations Analysis Report</title>
    <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          background: white;
          border-radius: 15px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .header {
          background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }

        .header h1 {
          font-size: 2.5em;
          margin-bottom: 10px;
          font-weight: 300;
        }

        .content {
          padding: 40px 30px;
        }

        .section {
          margin-bottom: 40px;
        }

        .section-title {
          font-size: 1.8em;
          margin-bottom: 20px;
          color: #2c3e50;
          border-bottom: 3px solid #3498db;
          padding-bottom: 10px;
        }

        .summary-box {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          padding: 25px;
          border-radius: 10px;
          border-left: 5px solid #3498db;
          font-size: 1.1em;
          line-height: 1.7;
        }

        .card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 20px;
        }

        .anomaly-card {
          background: white;
          border-radius: 10px;
          padding: 25px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.08);
          border-left: 5px solid;
          transition: transform 0.3s ease;
        }

        .anomaly-card:hover {
          transform: translateY(-5px);
        }

        .anomaly-card.high { border-left-color: #e74c3c; }
        .anomaly-card.medium { border-left-color: #f39c12; }
        .anomaly-card.low { border-left-color: #f1c40f; }

        .severity-badge {
          display: inline-block;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.8em;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 15px;
        }

        .severity-high { background: #e74c3c; color: white; }
        .severity-medium { background: #f39c12; color: white; }
        .severity-low { background: #f1c40f; color: #333; }

        .trend-card {
          background: white;
          border-radius: 10px;
          padding: 25px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.08);
          border-left: 5px solid;
        }

        .trend-card.positive { border-left-color: #27ae60; }
        .trend-card.negative { border-left-color: #e74c3c; }
        .trend-card.neutral { border-left-color: #95a5a6; }

        .recommendations-list {
          list-style: none;
        }

        .recommendations-list li {
          background: white;
          margin-bottom: 15px;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.05);
          border-left: 4px solid #3498db;
        }

        .timestamp {
          text-align: center;
          color: #7f8c8d;
          font-size: 0.9em;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ecf0f1;
        }

        .no-data {
          text-align: center;
          color: #7f8c8d;
          font-style: italic;
          padding: 40px;
          background: #f8f9fa;
          border-radius: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏗️ Silo Operations Analysis</h1>
            <div>Comprehensive Operational Insights & Recommendations</div>
        </div>
        
        <div class="content">
            <!-- Summary Section -->
            <div class="section">
                <h2 class="section-title">📊 Executive Summary</h2>
                <div class="summary-box">
                    ${insights.summary}
                </div>
            </div>

            <!-- Anomalies Section -->
            <div class="section">
                <h2 class="section-title">⚠️ Detected Anomalies</h2>
                ${this.generateAnomaliesSection(insights.anomalies)}
            </div>

            <!-- Trends Section -->
            <div class="section">
                <h2 class="section-title">📈 Operational Trends</h2>
                ${this.generateTrendsSection(insights.trends)}
            </div>

            <!-- Recommendations Section -->
            <div class="section">
                <h2 class="section-title">💡 Recommendations</h2>
                ${this.generateRecommendationsSection(insights.recommendations)}
            </div>

            <div class="timestamp">
                Report generated on ${timestamp}
            </div>
        </div>
    </div>
</body>
</html>
    `;

    return html;
  }

  private static generateAnomaliesSection(
    anomalies: Insight["anomalies"]
  ): string {
    if (anomalies.length === 0) {
      return '<div class="no-data">No anomalies detected. Operations appear normal.</div>';
    }

    return `
      <div class="card-grid">
        ${anomalies
          .map(
            (anomaly) => `
          <div class="anomaly-card ${anomaly.severity}">
            <div class="severity-badge severity-${anomaly.severity}">
              ${anomaly.severity} severity
            </div>
            <div style="font-size: 1.2em; font-weight: 600; color: #2c3e50; margin-bottom: 10px;">
              ${this.getAnomalyIcon(anomaly.type)} ${this.capitalizeFirst(
              anomaly.type
            )} Anomaly
            </div>
            <div style="color: #555; margin-bottom: 15px;">
              ${anomaly.description}
            </div>
            <div style="background: #ecf0f1; padding: 15px; border-radius: 8px; border-left: 3px solid #3498db; font-style: italic;">
              <strong>Recommendation:</strong> ${anomaly.recommendation}
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  }

  private static generateTrendsSection(trends: Insight["trends"]): string {
    if (trends.length === 0) {
      return '<div class="no-data">No significant trends identified in the current data period.</div>';
    }

    return `
      <div class="card-grid">
        ${trends
          .map(
            (trend) => `
          <div class="trend-card ${trend.impact}">
            <div style="display: inline-block; padding: 5px 12px; border-radius: 20px; font-size: 0.8em; font-weight: bold; text-transform: uppercase; margin-bottom: 15px; background: ${this.getImpactColor(
              trend.impact
            )}; color: white;">
              ${trend.impact} impact
            </div>
            <div style="font-size: 1.3em; font-weight: 600; color: #2c3e50; margin-bottom: 10px;">
              ${this.getTrendIcon(trend.impact)} ${trend.metric}
            </div>
            <div style="color: #555;">
              ${trend.description}
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  }

  private static generateRecommendationsSection(
    recommendations: string[]
  ): string {
    if (recommendations.length === 0) {
      return '<div class="no-data">No specific recommendations at this time.</div>';
    }

    return `
      <ul class="recommendations-list">
        ${recommendations
          .map(
            (rec) => `
          <li>💡 ${rec}</li>
        `
          )
          .join("")}
      </ul>
    `;
  }

  private static getAnomalyIcon(type: string): string {
    const icons = {
      volume: "📊",
      sensor: "🔧",
      operation: "⚙️",
    };
    return icons[type as keyof typeof icons] || "❗";
  }

  private static getTrendIcon(impact: string): string {
    const icons = {
      positive: "📈",
      negative: "📉",
      neutral: "➡️",
    };
    return icons[impact as keyof typeof icons] || "📊";
  }

  private static getImpactColor(impact: string): string {
    const colors = {
      positive: "#27ae60",
      negative: "#e74c3c",
      neutral: "#95a5a6",
    };
    return colors[impact as keyof typeof colors] || "#95a5a6";
  }

  private static capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  static async saveReportToFile(
    html: string,
    filename: string
  ): Promise<string> {
    const reportsDir = path.join(process.cwd(), "public", "reports");

    // Ensure the reports directory exists
    await fs.mkdir(reportsDir, { recursive: true });

    const filePath = path.join(reportsDir, filename);
    await fs.writeFile(filePath, html, "utf-8");

    return filePath;
  }
}
