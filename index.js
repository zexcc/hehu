const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs-extra");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
app.use(cors());

const UPLOAD_DIR = path.join(__dirname, "uploads");
fs.ensureDirSync(UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const id = uuidv4();
    cb(null, id + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
});

app.post("/upload", upload.single("file"), (req, res) => {
  res.json({
    message: "Uploaded",
    downloadUrl: `/file/${req.file.filename}`,
  });
});

app.get("/file/:name", async (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.name);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  res.download(filePath, async () => {
    await fs.remove(filePath); // delete after download
  });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html.txt");
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
