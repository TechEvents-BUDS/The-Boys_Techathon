const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors")

dotenv.config();

const app = express();
app.use(cors())
const PORT = 5000;

// Gemini API key
const apiKey = process.env.GEMINI_KEY;

// Set up file storage
const upload = multer({
    dest: 'uploads/', // Destination folder for uploaded files
});

app.get("/test", (req, res) => {
    res.send("Test")
})

async function geminiRes(columns) {
    const { GoogleGenerativeAI } = require("@google/generative-ai");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Don't write code. Only give JSON data return. You are a data science expert. You will be given a list of column names and are required to identify the most suitable charts for insights. Return an array of JSON objects, each containing two fields: 'columns', listing the relevant column names for visualization, and 'chart', specifying the appropriate chart type (e.g., 'bar', 'line', 'scatter'). Ensure your suggestions are concise and relevant to common data visualization practices. Columns: ${columns}`;

    const result = await model.generateContent(prompt);
    return result;
}

function extractJsonObjects(input) {
    console.log(input)
    // Ensure input is in the correct format
    let inputString;

    if (typeof input === 'string') {
        inputString = input; // Input is already a string
    } else if (typeof input === 'object' && input.text) {
        inputString = input.text; // Extract the text property from the object
    } else {
        console.error("Invalid input: Expected a string or an object with a text property.");
        return null;
    }

    // Extract the JSON string enclosed in triple backticks and parse it
    const jsonRegex = /```json\n([\s\S]*?)\n```/;
    const match = inputString.match(jsonRegex);

    if (match && match[1]) {
        try {
            // Parse the JSON string to an object
            const jsonObjects = JSON.parse(match[1]);
            return jsonObjects;
        } catch (error) {
            console.error("Failed to parse JSON:", error);
            return null;
        }
    } else {
        console.error("No JSON found in the input string.");
        return null;
    }
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
                const result = await geminiRes(columnNames.join(", "));
                const data = extractJsonObjects(result.response.candidates[0].content.parts[0].text);

                console.log(data);

                // Send the result back to the client
                res.json({ visualizationSuggestions: data });
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
