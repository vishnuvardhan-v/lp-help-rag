const tokenizer = require("sbd");
const { JSDOM } = require("jsdom");

function extractTextFromHTML(htmlContent) {
  const dom = new JSDOM(htmlContent);
  const document = dom.window.document;
  return document.body.textContent.trim();
}

function semanticChunkWithOverlap(text, chunkSize = 100, overlapSize = 20) {
  const sentences = tokenizer.sentences(text, {
    newline_boundaries: true,
    sanitize: true,
  });

  const chunks = [];
  let currentChunk = [];
  let currentTokenCount = 0;

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const tokenCount = sentence.split(/\s+/).length;

    if (currentTokenCount + tokenCount > chunkSize && currentChunk.length > 0) {
      // Save chunk
      chunks.push(currentChunk.join(" "));

      // Start new chunk with overlap
      const overlapTokens = currentChunk
        .join(" ")
        .split(/\s+/)
        .slice(-overlapSize)
        .join(" ");
      currentChunk = [overlapTokens];
      currentTokenCount = overlapTokens.split(/\s+/).length;
    }

    currentChunk.push(sentence);
    currentTokenCount += tokenCount;
  }

  // Push final chunk
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(" "));
  }

  return chunks;
}
module.exports = { extractTextFromHTML, semanticChunkWithOverlap };
