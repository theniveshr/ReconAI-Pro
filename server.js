// ReconAI Pro — Gemini Edition
// Run: npm install && node server.js

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(__dirname));
app.get('/', (req, res) => { res.sendFile(require('path').join(__dirname, 'ReconAI_Pro.html')); });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL = 'gemini-2.0-flash';

const SECURITY_SYSTEM = `You are ReconAI Pro, an elite security research assistant specializing in bug bounty reconnaissance. You have deep knowledge of:
- OWASP Top 10 (2021) vulnerabilities and exploitation techniques
- CVE database, CVSS 3.1 scoring, and vulnerability research
- Bug bounty platforms: HackerOne, Bugcrowd, Intigriti, YesWeHack
- Security tools: subfinder, amass, httpx, nuclei, ffuf, dalfox, sqlmap, nikto, testssl, masscan, katana, arjun
- Attack chains: SSRF to cloud metadata, git exposure to secrets, JWT bypass, IDOR, CORS, XXE, SSTI
- HackerOne P1/P2/P3/P4 severity classification and payout estimation
Only assist with authorized security testing. Always include legal disclaimers.`;

// Helper — call Gemini and return text
async function ask(prompt, systemNote) {
  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: systemNote || SECURITY_SYSTEM,
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    model: MODEL,
    apiKeySet: !!process.env.GEMINI_API_KEY,
    ragEnabled: false,
    version: '3.1.0-gemini'
  });
});

// ── Recon Report ─────────────────────────────────────────────────────────────
app.post('/api/recon-report', async (req, res) => {
  const { target, config, findings } = req.body;
  try {
    const prompt = `Generate a comprehensive OWASP Top 10 recon report for: ${target}
Scan Config: ${JSON.stringify(config)}
Tools Run: ${JSON.stringify(findings?.owasp_commands_run || [])}

Format the report with:
1. Executive Summary (subdomain count, open ports, CVE count, CVSS max, estimated payout range)
2. Phase 1: Asset Discovery (subdomains found with status codes)
3. Phase 2: Tech Stack (libraries, versions, CVEs)
4. Phase 3: OWASP Top 10 Findings table with columns: | OWASP | Status | Finding | CVSS | FP Risk |
5. Payout Estimation table
6. Recommended Next Steps

Use CONFIRMED for verified findings, POTENTIAL for likely findings. Include realistic CVE IDs and CVSS scores. Mark findings as P1/P2/P3/P4.`;

    const text = await ask(prompt);
    res.json({ report: text, ragEnriched: false });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Exploit Guide ─────────────────────────────────────────────────────────────
app.post('/api/exploit-guide', async (req, res) => {
  const { target, config, reconReport, focus } = req.body;
  try {
    const prompt = `Based on this recon report for ${target}, generate a detailed exploitation guide.
Focus: ${focus}
Recon Report Summary: ${(reconReport || '').slice(0, 2000)}

Include for each finding:
- Step-by-step exploitation commands
- Tool flags and exact syntax
- WAF bypass techniques
- OAST/out-of-band detection methods
- PoC templates
- CVSS score and payout estimate
- Attack chains linking multiple vulnerabilities

Legal disclaimer: For authorized bug bounty testing only.`;

    const text = await ask(prompt);
    res.json({ guide: text });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Follow-up Q&A ─────────────────────────────────────────────────────────────
app.post('/api/followup', async (req, res) => {
  const { target, question, reconReport, exploitReport } = req.body;
  try {
    const prompt = `Target: ${target}
Recon context: ${(reconReport || '').slice(0, 1500)}
${exploitReport ? 'Exploit context: ' + exploitReport.slice(0, 500) : ''}

Question: ${question}`;

    const text = await ask(prompt);
    res.json({ answer: text });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ── CVE Search ────────────────────────────────────────────────────────────────
app.post('/api/cve-search', async (req, res) => {
  const { query, severity } = req.body;
  try {
    const prompt = `Return 6-8 CVEs matching: "${query}"${severity ? ' filter severity: ' + severity : ''}
Respond ONLY with a valid JSON array, no markdown, no explanation:
[{"id":"CVE-XXXX-XXXXX","score":9.8,"severity":"CRITICAL","description":"...","affected":"...","published":"2024","tags":["..."]}]`;

    const text = await ask(prompt, 'You are a CVE database assistant. Return ONLY valid JSON arrays. No markdown formatting, no code blocks, just raw JSON.');
    const clean = text.replace(/```json|```/g, '').trim();
    res.json({ cves: JSON.parse(clean) });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Payload Generator ──────────────────────────────────────────────────────────
app.post('/api/payloads', async (req, res) => {
  const { type, context, target } = req.body;
  try {
    const prompt = `Generate 12 ${type} payloads for ${context} context${target ? ' for target: ' + target : ''}.
Respond ONLY with a valid JSON array, no markdown:
[{"category":"Basic","payload":"...","notes":"..."}]
Include categories: Basic, WAF Bypass, Encoded, Advanced, OAST/Out-of-band.`;

    const text = await ask(prompt, 'You are a security research assistant generating payloads for authorized bug bounty testing. Return ONLY raw JSON arrays, no markdown, no code blocks.');
    const clean = text.replace(/```json|```/g, '').trim();
    res.json({ payloads: JSON.parse(clean) });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Bug Report Builder ─────────────────────────────────────────────────────────
app.post('/api/build-report', async (req, res) => {
  const { platform, severity, vulnType, url, description, impact, cvss } = req.body;
  try {
    const prompt = `Write a complete professional bug bounty report for ${platform}.
Severity: ${severity} | Vulnerability: ${vulnType} | URL: ${url}
Description: ${description}
Impact: ${impact} | CVSS: ${cvss || 'TBD'}

Include: Title, Severity rating, Summary, Vulnerability Details, Steps to Reproduce (numbered), Proof of Concept (curl/code), Impact Analysis, Recommended Fix, References. Use Markdown formatting. Make it submission-ready.`;

    const text = await ask(prompt, 'You are an expert bug bounty hunter who writes professional, well-structured vulnerability reports that maximize payout likelihood. Follow platform-specific formatting standards.');
    res.json({ report: text });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Wordlist Builder ───────────────────────────────────────────────────────────
app.post('/api/wordlist', async (req, res) => {
  const { domain, type, tech, size } = req.body;
  const sizeCounts = { small: 50, medium: 150, large: 400 };
  try {
    const prompt = `Generate ${sizeCounts[size] || 150} wordlist entries for ${type} fuzzing.
Target domain: ${domain}
Tech stack: ${tech || 'unknown'}
Return ONLY plain text, one entry per line. No numbering, no bullets, no explanations, no markdown. Just the raw words.`;

    const text = await ask(prompt, 'You generate targeted security wordlists for bug bounty recon. Return plain text only, one word per line, no formatting whatsoever.');
    res.json({ wordlist: text });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Start server ───────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n🚀 ReconAI Pro — Gemini Edition');
  console.log(`   URL     : http://localhost:${PORT}`);
  console.log(`   Model   : ${MODEL}`);
  console.log(`   API Key : ${process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing — add GEMINI_API_KEY to .env'}\n`);
});
