'use client';
import axios from 'axios';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import ChartComponent from "../../../components/ChartComponent";

interface CsvRow {
  [key: string]: string; // CSV rows with dynamic column names
}

interface ChartSuggestion {
  columns: string[];
  chart: "bar" | "line" | "pie" | "doughnut" | "radar" | "polarArea";
  data: number[]; // Numerical data for the chart
}

export default function Home() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [view, setView] = useState('eda');
  const [file, setFile] = useState<File | null>(null);
  const [edaResults, setEdaResults] = useState<ChartSuggestion[]>([]);
  const [csvData, setCsvData] = useState<CsvRow[]>([]); // Store parsed CSV data

  const onDrop = (acceptedFiles: File[]) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;
  
    const uploadedFile: File = acceptedFiles[0];
    setFile(uploadedFile);
  
    const formData = new FormData();
    formData.append("file", uploadedFile);
  
    // Parse the CSV file locally
    Papa.parse<CsvRow>(uploadedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        console.log("Parsed CSV:", result.data);
        setCsvData(result.data); // Store the parsed CSV data
  
        // Send file to the backend to get chart types and columns
        axios
          .post("http://localhost:5000/upload", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then((response) => {
            console.log("Response:", response.data);
  
            // Create suggestions based on the backend response
            const suggestions: ChartSuggestion[] = response.data.visualizationSuggestions.map(
              (suggestion: { columns: string[]; chart: string }) => {
                const columnData = suggestion.columns.map((column) =>
                  result.data.map((row) => Number(row[column]) || 0) // Extract data for each column
                );
  
                return {
                  columns: suggestion.columns,
                  chart: suggestion.chart as ChartSuggestion["chart"],
                  data: columnData.flat(), // Flatten the array if multiple columns
                };
              }
            );
  
            setEdaResults(suggestions);
            setUploadProgress(100); // Complete
          })
          .catch((error) => {
            console.error("Error uploading file:", error.message);
            setUploadProgress(0); // Reset progress on failure
          });
      },
      error: (error) => {
        console.error("Error parsing CSV:", error.message);
        setUploadProgress(0);
      },
    });
  };
  
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className="flex flex-col items-center p-8">
      <header className="text-3xl font-bold text-center mb-6">
        Hackathon EDA & Prediction Tool
      </header>

      <section
        className="border-dashed border-2 border-gray-300 p-6 w-full max-w-lg rounded-lg text-center"
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        {!file ? (
          <p>Drag & Drop your CSV file here, or click to upload.</p>
        ) : (
          <p>File uploaded: {file.name}</p>
        )}
      </section>

      {uploadProgress > 0 && (
        <div className="w-full max-w-lg mt-4">
          <progress className="w-full" value={uploadProgress} max="100"></progress>
        </div>
      )}

      {edaResults.length > 0 && (
        <div className="mt-6">
          <button
            className={`px-4 py-2 rounded-lg mx-2 ${
              view === 'eda' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setView('eda')}
          >
            EDA Results
          </button>
        </div>
      )}

      {view === 'eda' && edaResults.length > 0 && <EdaDisplay data={edaResults} />}
    </div>
  );
}

function EdaDisplay({ data }: { data: ChartSuggestion[] }) {
  return (
    <div className="w-full max-w-4xl mt-6 bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Exploratory Data Analysis</h2>
      {data.map((chart, index) => (
        <div key={index} className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Chart {index + 1}</h3>
          <ChartComponent
            key={index}
            labels={chart.columns} // Labels extracted from the backend response
            data={chart.data}      // Data dynamically extracted from CSV
            chartType={chart.chart} // Chart type from backend response
          />
        </div>
      ))}
    </div>
  );
}




