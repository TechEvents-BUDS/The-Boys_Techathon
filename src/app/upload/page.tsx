'use client'



import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import axios from 'axios';
import ChartComponent from "../../../components/ChartComponent";

interface EdaData {
  [key: string]: string | number; // EDA results are key-value pairs
}

interface PredictionData {
  [key: string]: any; // Predictions can be of any structure
}


export default function Home() {



  const [uploadProgress, setUploadProgress] = useState(0);
  const [edaResults, setEdaResults] = useState(null);
  const [predictionResults, setPredictionResults] = useState(null);
  const [view, setView] = useState('eda'); // 'eda' or 'prediction'
  const [file, setFile] = useState<File | null>(null);
  const onDrop = (acceptedFiles: File[]) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;

    const uploadedFile: File = acceptedFiles[0]; // Explicitly typed as File
    setFile(uploadedFile);

    // Parse and send to backend
    Papa.parse(uploadedFile, {
      complete: async (result: any) => { // Type 'result' explicitly
        setUploadProgress(50); // Simulated progress
        const response = await axios.post('/api/process-file', { data: result.data });
        setEdaResults(response.data.eda);
        setPredictionResults(response.data.predictions);
        setUploadProgress(100); // Complete
      },
    });
  };

  const labels = ["January", "February", "March", "April", "May"];
  const data = [12, 19, 3, 5, 2];

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
          <p>File uploaded: {file.name}</p> // No error since file is typed
        )}
      </section>

      {uploadProgress > 0 && (
        <div className="w-full max-w-lg mt-4">
          <progress className="w-full" value={uploadProgress} max="100"></progress>
        </div>

      )}

      {edaResults && (
        <div className="mt-6">
          <button
            className={`px-4 py-2 rounded-lg mx-2 ${view === 'eda' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setView('eda')}
          >
            EDA Results
          </button>
          <button
            className={`px-4 py-2 rounded-lg mx-2 ${view === 'prediction' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setView('prediction')}
          >
            Predictions
          </button>
        </div>
      )}
       <ChartComponent
        labels={labels}
        data={data}
        chartType="bar"
        title="Monthly Sales"
      />

      {view === 'eda' && edaResults && <EdaDisplay data={edaResults} />}
      {view === 'prediction' && predictionResults && <PredictionDisplay data={predictionResults} />}
    </div>

  );
}

function EdaDisplay({ data }: { data: EdaData }) {
  return (
    <div className="w-full max-w-4xl mt-6 bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Exploratory Data Analysis</h2>
      <table className="table-auto w-full">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(data).map((key) => (
            <tr key={key}>
              <td className="border px-4 py-2">{key}</td>
              <td className="border px-4 py-2">{data[key]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PredictionDisplay({ data }: { data: PredictionData }) {
  return (
    <div className="w-full max-w-4xl mt-6 bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Predictions</h2>
      <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

