const fs = require("fs");
const { JSDOM } = require("jsdom");

function get_json(input_fileName, output_file_name) {
  // Load HTML file
  const html = fs.readFileSync(input_fileName, "utf8");
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Select all LinkedIn profile anchors
  const anchors = Array.from(document.querySelectorAll("a[href*='linkedin.com/in/']"));

  const profiles = anchors.map(a => {
    // Try to get the text directly from the anchor
    let name = a.textContent.trim();

    // If the anchor is just an image (empty text), look inside the parent <p>
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
  // Filter out empty names & duplicates by URL
  .filter(p => p.name && p.url)
  .filter((value, index, self) =>
    index === self.findIndex(v => v.url === value.url)
  );

  // Save results to JSON file
  const outputPath = "results/" + output_file_name;
  fs.writeFileSync(outputPath, JSON.stringify(profiles, null, 2));

  console.log(`✅ Extracted ${profiles.length} unique profiles with names.`);
  console.log(`📄 Saved to ${outputPath}`);
  console.log("--------------------------------------------------");
}

// Use the same function for both
get_json("pending_requests.html", "pending_requests.json");
get_json("connected_people.html", "connected_people.json");
