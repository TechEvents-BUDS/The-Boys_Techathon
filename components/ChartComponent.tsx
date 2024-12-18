import React from "react";
import {
  Bar,
  Line,
  Pie,
  Doughnut,
  Radar,
  PolarArea,
} from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";

// Register chart components globally
ChartJS.register(...registerables);

interface ChartProps {
  labels: string[]; // Column names or labels
  data: number[]; // Data for the chart
  chartType: "bar" | "line" | "pie" | "doughnut" | "radar" | "polarArea";
  title?: string; // Optional chart title
}

const ChartComponent: React.FC<ChartProps> = ({
  labels,
  data,
  chartType,
  title,
}) => {
  // Chart Data Configuration
  const chartData = {
    labels: labels,
    datasets: [
      {
        label: title || "Chart",
        data: data,
        backgroundColor: [
          "rgba(75, 192, 192, 0.2)",
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(255, 159, 64, 0.2)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart Type Mapping
  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return <Bar data={chartData} />;
      case "line":
        return <Line data={chartData} />;
      case "pie":
        return <Pie data={chartData} />;
      case "doughnut":
        return <Doughnut data={chartData} />;
      case "radar":
        return <Radar data={chartData} />;
      case "polarArea":
        return <PolarArea data={chartData} />;
      default:
        return <p>Invalid chart type</p>;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">{title || "Chart"}</h2>
      {renderChart()}
    </div>
  );
};

export default ChartComponent;
