const fs = require("fs");
const { JSDOM } = require("jsdom");

/**
 * Scrape LinkedIn profiles from raw HTML
 */
function scrapeLinkedInProfiles(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const anchors = Array.from(
    document.querySelectorAll(
      "a[href*='linkedin.com/in/']:not([aria-hidden='true'])"
    )
  );

  const profiles = anchors
    .map(a => {
      let name = a.textContent.trim();

      if (!name) {
        const parentP = a.closest("p");
        if (parentP) {
          name = parentP.textContent.trim();
        }
      }

      return {
        name,
        url: a.href.trim().replace(/\/$/, "")
      };
    })
    .filter(p => p.name && p.url)
    .filter(
      (value, index, self) =>
        index === self.findIndex(v => v.url === value.url)
    );

  return profiles;
}

/**
 * Export to JSON
 */
function exportToJson(data, outputPath) {
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`📄 JSON saved to ${outputPath}`);
}

/**
 * Convert JSON array to CSV string
 */
function jsonToCsv(jsonArray) {
  if (!jsonArray || !jsonArray.length) return "";

  const headers = Object.keys(jsonArray[0]);

  const rows = jsonArray.map(row =>
    headers
      .map(field =>
        `"${(row[field] ?? "").toString().replace(/"/g, '""')}"`
      )
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

/**
 * Export to CSV
 */
function exportToCsv(data, outputPath) {
  const csv = jsonToCsv(data);
  fs.writeFileSync(outputPath, csv);
  console.log(`📄 CSV saved to ${outputPath}`);
}

/**
 * Main processor
 * format: "json" | "csv" | "both"
 */
function processHtmlFile(inputFile, outputBaseName, format = "json") {
  const html = fs.readFileSync(inputFile, "utf8");
  const profiles = scrapeLinkedInProfiles(html);

  const basePath = `results/${outputBaseName}`;

  if (format === "json" || format === "both") {
    exportToJson(profiles, `${basePath}.json`);
  }

  if (format === "csv" || format === "both") {
    exportToCsv(profiles, `${basePath}.csv`);
  }

  console.log(`✅ Extracted ${profiles.length} unique profiles`);
  console.log("--------------------------------------------------");
}


//--------------------------------------------------------------------
processHtmlFile("pending_requests.html", "pending_requests", "both");
processHtmlFile("connected_people.html", "connected_people", "both");