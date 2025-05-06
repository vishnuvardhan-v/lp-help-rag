const { JSDOM } = require("jsdom");

function extractTextFromHTML(htmlContent) {
  const dom = new JSDOM(htmlContent);
  const document = dom.window.document;
  return document.body.textContent.trim();
}

function chunkText(text, maxWords = 250) {
  const words = text.split(/\s+/);
  const chunks = [];

  for (let i = 0; i < words.length; i += maxWords) {
    const chunk = words.slice(i, i + maxWords).join(" ");
    chunks.push(chunk);
  }

  return chunks;
}
module.exports = { extractTextFromHTML, chunkText };
