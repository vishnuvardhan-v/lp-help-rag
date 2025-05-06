require("@tensorflow/tfjs");
const fs = require("fs");
const path = require("path");
const use = require("@tensorflow-models/universal-sentence-encoder");
const { extractTextFromHTML, chunkText } = require("./utils/htmlToText");
const { ChromaClient } = require("chromadb");

let model;
let collection;
async function loadModel() {
  if (!model) {
    model = await use.load();
    console.log("USE model loaded");
  }
}

async function embedTexts(texts) {
  await loadModel();
  const embeddings = await model.embed(texts);
  return embeddings;
}

async function main() {
  const docsDir = path.join(__dirname, "data", "docs");

  const htmlFiles = fs
    .readdirSync(docsDir)
    .filter((file) => file.endsWith(".html"));

  const documents = [];

  for (const file of htmlFiles) {
    const filePath = path.join(docsDir, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const fullText = extractTextFromHTML(content);
    const chunks = chunkText(fullText);

    for (let i = 0; i < chunks.length; i++) {
      documents.push({
        id: `${file}#chunk-${i}`,
        text: chunks[i],
        metadata: {
          file,
          chunkIndex: i,
          path: `/docs/${file}`,
        },
      });
    }
  }
  const texts = documents.map((doc) => doc.text);
  const embeddings = await embedTexts(texts);

  const client = new ChromaClient({ apiUrl: "http://localhost:8000" });
  collection = await client.getOrCreateCollection({
    name: "documentation",
  });

  // Batch add
  const ids = documents.map((doc) => doc.id);
  const embeddingsArray = embeddings.arraySync();
  const metadatas = documents.map((doc) => doc.metadata);
  console.log(texts);
  await collection.add({
    ids,
    embeddings: embeddingsArray,
    metadatas,
    documents: texts,
  });

  console.log("All documents indexed.");
}

//main();
async function search(query) {
  //const customerQuery = "How do I reset my password?";
}
main().catch(console.error);
//search("how to create a network site?");
module.exports = { embedTexts, loadModel, main, search };
