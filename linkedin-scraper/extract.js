const fs = require("fs");
const { JSDOM } = require("jsdom");

// Load HTML file (change path if needed)
const html = fs.readFileSync("a.html", "utf8");
const dom = new JSDOM(html);
const document = dom.window.document;

// Extract LinkedIn profile URLs, clean them, and keep unique ones
const profileLinks = Array.from(document.querySelectorAll('a[href*="linkedin.com/in/"]'))
  .map(a => a.href.trim().replace(/\/$/, "")) // remove trailing slash
  .filter((value, index, self) => self.indexOf(value) === index); // unique

// Save results to JSON file (overwrite if exists)
const outputPath = "profiles.json";
fs.writeFileSync(outputPath, JSON.stringify(profileLinks, null, 2));

console.log(`✅ Extracted ${profileLinks.length} unique profiles.`);
console.log(`📄 Saved to ${outputPath}`);
