import fs from "fs";
import path from "path";
import sharp from "sharp";

const projectsRoot = path.resolve("projects");
const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp"]);

async function processImage(filePath) {
  const dir = path.dirname(filePath);
  const base = path.basename(filePath, path.extname(filePath));
  const thumbsDir = path.join(dir, "thumbs");
  const mediumDir = path.join(dir, "medium");

  fs.mkdirSync(thumbsDir, { recursive: true });
  fs.mkdirSync(mediumDir, { recursive: true });

  const thumbOut = path.join(thumbsDir, base + ".webp");
  const mediumOut = path.join(mediumDir, base + ".webp");

  if (!fs.existsSync(thumbOut)) {
    await sharp(filePath)
      .rotate()
      .resize({ width: 480, withoutEnlargement: true })
      .webp({ quality: 72 })
      .toFile(thumbOut);
  }

  if (!fs.existsSync(mediumOut)) {
    await sharp(filePath)
      .rotate()
      .resize({ width: 1280, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(mediumOut);
  }

  // Run: npx sharp-cli resize 480 -i input -o thumbs/name.webp -f webp -q 72
}

async function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "thumbs" || entry.name === "medium") {
        continue;
      }
      await walk(fullPath);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (!IMAGE_EXT.has(ext)) {
      continue;
    }

    await processImage(fullPath);
    console.log("Processed:", fullPath);
  }
}

await walk(projectsRoot);
console.log("Done.");
