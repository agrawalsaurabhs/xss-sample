const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs-extra");
const path = require("path");
const xss = require("xss");

const app = express();
const PORT = 3000;

// Configure XSS filter with custom options
const xssOptions = {
  whiteList: {
    p: ["class", "id"],
    br: [],
    strong: ["class", "id"],
    em: ["class", "id"],
    u: ["class", "id"],
    h1: ["class", "id"],
    h2: ["class", "id"],
    h3: ["class", "id"],
    h4: ["class", "id"],
    h5: ["class", "id"],
    h6: ["class", "id"],
    ul: ["class", "id"],
    ol: ["class", "id"],
    li: ["class", "id"],
    a: ["href", "title", "class", "id"],
    div: ["class", "id"],
    span: ["class", "id"],
  },
  stripIgnoreTag: true, // Remove tags not in whitelist
  stripIgnoreTagBody: ["script"], // Remove script tag content
};

const xssFilter = new xss.FilterXSS(xssOptions);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, "data");
fs.ensureDirSync(dataDir);

/**
 * POST endpoint to accept HTML content and store it in a file
 * This endpoint HANDLES XSS vulnerability by sanitizing the HTML input
 */
app.post("/api/store-html", async (req, res) => {
  try {
    const { html, filename } = req.body;

    if (!html) {
      return res.status(400).json({
        error: "HTML content is required",
        success: false,
      });
    }

    if (!filename) {
      return res.status(400).json({
        error: "Filename is required",
        success: false,
      });
    }

    // Sanitize the HTML to prevent XSS attacks using js-xss library
    const sanitizedHtml = xssFilter.process(html);

    // Generate safe filename
    const safeFilename = filename.replace(/[^a-zA-Z0-9-_]/g, "_");
    const filepath = path.join(dataDir, `${safeFilename}.html`);

    // Create a complete HTML document
    const htmlDocument = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${safeFilename}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .content {
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .alert {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
    </style>
</head>
<body>
    <div class="alert">
        ✓ This content has been sanitized to prevent XSS attacks
    </div>
    <div class="content">
${sanitizedHtml}
    </div>
</body>
</html>`;

    // Write to file
    await fs.writeFile(filepath, htmlDocument, "utf8");

    res.json({
      success: true,
      message: "HTML content stored successfully",
      filename: `${safeFilename}.html`,
      filepath: filepath,
      originalLength: html.length,
      sanitizedLength: sanitizedHtml.length,
      bytesRemoved: html.length - sanitizedHtml.length,
    });
  } catch (error) {
    console.error("Error storing HTML:", error);
    res.status(500).json({
      error: "Failed to store HTML content",
      success: false,
      details: error.message,
    });
  }
});

/**
 * GET endpoint to retrieve stored HTML files
 */
app.get("/api/files", async (req, res) => {
  try {
    const files = await fs.readdir(dataDir);
    const htmlFiles = files.filter((file) => file.endsWith(".html"));

    res.json({
      success: true,
      files: htmlFiles,
      count: htmlFiles.length,
    });
  } catch (error) {
    console.error("Error reading files:", error);
    res.status(500).json({
      error: "Failed to read files",
      success: false,
    });
  }
});

/**
 * GET endpoint to view a specific stored file
 */
app.get("/api/view/:filename", async (req, res) => {
  try {
    const filename = req.params.filename;
    const safeFilename = filename.replace(/[^a-zA-Z0-9-_.]/g, "_");
    const filepath = path.join(dataDir, safeFilename);

    if (!(await fs.pathExists(filepath))) {
      return res.status(404).json({
        error: "File not found",
        success: false,
      });
    }

    const content = await fs.readFile(filepath, "utf8");
    res.send(content);
  } catch (error) {
    console.error("Error reading file:", error);
    res.status(500).json({
      error: "Failed to read file",
      success: false,
    });
  }
});

/**
 * DELETE endpoint to remove a stored file
 */
app.delete("/api/delete/:filename", async (req, res) => {
  try {
    const filename = req.params.filename;
    const safeFilename = filename.replace(/[^a-zA-Z0-9-_.]/g, "_");
    const filepath = path.join(dataDir, safeFilename);

    if (!(await fs.pathExists(filepath))) {
      return res.status(404).json({
        error: "File not found",
        success: false,
      });
    }

    await fs.remove(filepath);
    res.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({
      error: "Failed to delete file",
      success: false,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Data directory: ${dataDir}`);
  console.log("\nAvailable endpoints:");
  console.log(
    "  POST   /api/store-html  - Store HTML content (with XSS protection)"
  );
  console.log("  GET    /api/files       - List all stored files");
  console.log("  GET    /api/view/:filename - View a stored file");
  console.log("  DELETE /api/delete/:filename - Delete a stored file");
});
