const fs = require('fs');
const pdf = require('pdf-parse');
const Tesseract = require('tesseract.js');
const path = require('path');

// --- NLP description generator (simple, offline) ---
function generateDescription(text) {
  const clean = (text || '').replace(/\s+/g, ' ').trim();
  const lower = clean.toLowerCase();

  // Document type heuristics
  let type = 'General Text Document';
  if (/invoice|amount due|bill to|total due|tax/i.test(clean)) type = 'Invoice / Billing Document';
  else if (/\b(dear|sincerely|regards|yours)\b/i.test(clean) && /\b(sincerely|regards|yours)\b/i.test(clean)) type = 'Formal Letter';
  else if (/\b(resume|curriculum vitae|objective|experience|education|skills)\b/i.test(lower)) type = 'Resume / CV';
  else if (/\b(meeting|minutes|attendees|agenda)\b/i.test(lower)) type = 'Meeting Notes';
  else if (/\b(report|analysis|summary|conclusion)\b/i.test(lower)) type = 'Report / Analysis Document';
  else if (/\b(university|student|syllabus|assignment)\b/i.test(lower)) type = 'Educational Document';
  else if (/\b(policy|terms|agreement|contract)\b/i.test(lower)) type = 'Legal / Contract';
  else if (/\b(recipe|ingredients|servings)\b/i.test(lower)) type = 'Recipe';

  // Very small summary: pick first 2-3 sentences (if present)
  const sentences = clean.split(/[.?!]\s+/).filter(s => s.trim().length > 10);
  let summary = '';
  if (sentences.length === 0) summary = clean.slice(0, 200) + (clean.length > 200 ? '...' : '');
  else summary = sentences.slice(0, 2).join('. ') + (sentences.length > 2 ? '...' : '');

  // Keywords: simple frequency of words longer than 4 chars
  const words = clean.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter(w => w.length > 4);
  const freq = {};
  words.forEach(w => freq[w] = (freq[w] || 0) + 1);
  const keywords = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,6).map(e=>e[0]);

  // Short confidence estimate based on length
  const confidence = Math.min(0.99, Math.max(0.2, Math.log10(Math.max(10, clean.length))/4));

  return { type, summary, keywords, confidence: Number(confidence.toFixed(2)) };
}

// --- existing extraction functions ---
async function extractTextFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdf(dataBuffer);
  return data.text || '';
}

async function extractTextFromImage(filePath) {
  const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
    logger: m => console.log('Tesseract:', m)
  });
  return text || '';
}

function generateBasicSuggestions(text) {
  const suggestions = [];
  const len = (text || '').trim().length;
  if (len < 100) suggestions.push('Post is short — consider adding more context or examples to increase engagement.');
  if (!/\?/m.test(text)) suggestions.push('Ask a question at the end to invite comments.');
  if (!/\b(https?:\/\/|#)\b/.test(text)) suggestions.push('Consider adding a link or relevant hashtag to increase discoverability.');
  if (len > 400) suggestions.push('Break long text into shorter paragraphs or use bullets for readability.');
  return suggestions;
}

async function extractTextFromFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  let text = '';
  if (ext === '.pdf') {
    text = await extractTextFromPDF(filePath);
  } else {
    text = await extractTextFromImage(filePath);
  }
  const suggestions = generateBasicSuggestions(text);
  const description = generateDescription(text);
  return { text: text.trim(), suggestions, description };
}

module.exports = { extractTextFromFile };
