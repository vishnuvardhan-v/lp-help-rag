const express = require("express");
const cors = require("cors");
const path = require("path");
const { ChromaClient } = require("chromadb");
const { embedTexts } = require("../index");
const app = express();
app.use(cors());
app.use(express.json());
async function summarizeText(text) {
  const { pipeline } = await import("@xenova/transformers");

  //const modelPath = path.resolve(__dirname, "models/bart-large-cnn");
  //console.log("Loading summarization model from:", modelPath);
  //const summarizer = await pipeline("summarization", `file://${modelPath}`);
  //const summarizer = await pipeline("summarization", "Xenova/bge-large-en");
  const summarizer = await pipeline(
    "summarization",
    "Xenova/distilbart-cnn-12-6"
  );
  const summary = await summarizer(text, {
    max_length: 130,
    min_length: 30,
    do_sample: false,
  });
  return summary[0].summary_text;
}

app.post("/search", async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).send({ error: "Query is required" });
  }

  // Simulate a customer query
  const queryEmbedding = await embedTexts([query]);
  const queryVector = queryEmbedding[0];
  console.log("Query vector:", queryVector);
  const client = new ChromaClient({ apiUrl: "http://localhost:8000" });
  const collection = await client.getCollection({
    name: "documentation",
  });
  const result = await collection.query({
    queryEmbeddings: [queryVector],
    nResults: 1,
  });
  console.log("Query result:", result);
  let match;
  if (result.ids?.length > 0) {
    // match = result.documents?.[0]?.[0];
    match = await summarizeText(
      `Summarize the following for a user-friendly help doc:\n\n${result.documents?.[0]?.[0]}`
    );
    console.log("Redirect user to:", result.ids?.[0]?.[0]);
  } else {
    console.log("No relevant document found, fallback to manual help.");
  }
  console.log("result", result.ids?.[0]?.[0]);
  res.send({
    summary: match,
    url:
      `https://lp.cambiumnetworks.com/doc/${result.ids?.[0]?.[0]}` ??
      "No match found.",
  });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
