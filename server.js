const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const axios = require("axios");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = 3000;

// Gemini API key
const apiKey = process.env.GEMINI_KEY;

// Set up file storage
const upload = multer({
    dest: 'uploads/', // Destination folder for uploaded files
});

async function geminiRes(columsn) {
    const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = "Dont write code. Only give json data return. You are a data science expert. You will be given a list of column names and are required to identify the most suitable charts for insights. Return an array of JSON objects, each containing two fields: 'columns', listing the relevant column names for visualization, and 'chart', specifying the appropriate chart type (e.g., 'bar', 'line', 'scatter'). Ensure your suggestions are concise and relevant to common data visualization practices.";

const result = await model.generateContent(prompt);
return result
}

// Route to upload CSV file and get column names
app.post('/upload', upload.single('file'), (req, res) => {
    console.log("Received a request to /upload");

    if (!req.file) {
        console.error("No file uploaded");
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = path.join(__dirname, req.file.path);
    console.log("File uploaded successfully:", filePath);

    let columnNames = [];

    // Read the CSV file to extract columns
    fs.createReadStream(filePath)
        .pipe(csv())
        .on('headers', async (headers) => {
            console.log("Headers found:", headers);
            columnNames = headers; // Extract column names

            try {
                // Pass the column names to Gemini
                const prompt = `Here are the column names: ${columnNames.join(", ")}. Suggest visualizations for them.`;
                const result = await geminiRes(columnNames.join(", "));
                console.log(result.response.candidates[0].content.parts
                )

                // Send the result back to the client
                res.json({ visualizationSuggestions: JSON.parse(result.response.candidates[0]) });
            } catch (error) {
                console.error("Error processing Gemini response:", error.message);
                res.status(500).json({ error: 'Error processing Gemini response', details: error.message });
            } finally {
                // Delete the uploaded file after processing
                fs.unlinkSync(filePath);
            }
        })
        .on('error', (err) => {
            console.error("Error reading the CSV file:", err.message);
            fs.unlinkSync(filePath); // Delete the uploaded file on error
            res.status(500).json({ error: 'Error reading the CSV file', details: err.message });
        });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
