import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");

function analyzeDataset() {
  if (!fs.existsSync(dataDir)) {
    console.error("Data directory does not exist:", dataDir);
    return;
  }

  const items = fs.readdirSync(dataDir);
  const folderCounts: Record<string, number> = {};
  const folderSamples: Record<string, any> = {};

  for (const item of items) {
    const itemPath = path.join(dataDir, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory()) {
      const files = fs.readdirSync(itemPath);
      folderCounts[item] = files.length;

      if (files.length > 0) {
        const sampleFile = files[0];
        const samplePath = path.join(itemPath, sampleFile);
        try {
          const content = fs.readFileSync(samplePath, "utf-8");
          const parsed = JSON.parse(content);
          folderSamples[item] = {
            sampleFileName: sampleFile,
            keys: Array.isArray(parsed)
              ? "Array of items (length: " + parsed.length + ")"
              : typeof parsed === "object" && parsed !== null
              ? Object.keys(parsed)
              : typeof parsed,
          };
        } catch (error) {
          folderSamples[item] = { error: "Failed to parse JSON" };
        }
      }
    }
  }

  console.log("=== Dataset Directory Summary ===");
  for (const [folder, count] of Object.entries(folderCounts)) {
    console.log(`${folder}: ${count} files`);
  }

  console.log("\n=== Dataset Folder Samples ===");
  console.log(JSON.stringify(folderSamples, null, 2));
}

analyzeDataset();
