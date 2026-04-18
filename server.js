const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/* 📂 list files */
app.get("/files", (req, res) => {
  fs.readdir("./", (err, files) => {
    if (err) return res.status(500).send("Error reading files");
    res.json(files);
  });
});

/* 📖 open file */
app.get("/file/:name", (req, res) => {
  fs.readFile(req.params.name, "utf8", (err, data) => {
    if (err) return res.status(500).send("Error opening file");
    res.send(data);
  });
});

/* 💾 save */
app.post("/save/:name", (req, res) => {
  fs.writeFile(req.params.name, req.body.content, (err) => {
    if (err) return res.status(500).send("Save failed");
    res.send("Saved");
  });
});

/* 🚀 push to GitHub (API method) */
app.post("/push", async (req, res) => {
  try {
    const fileName = req.body.file;
    const content = req.body.content;

    const token = process.env.GITHUB_TOKEN;
    const repo = "https://github.com/Titanxrobotics/TitanX-Robotics"; // 👈 CHANGE THIS

    const url = `https://api.github.com/repos/${repo}/contents/${fileName}`;

    const base64Content = Buffer.from(content).toString("base64");

    // 🔹 existing file থাকলে SHA নাও
    let sha;
    const getRes = await fetch(url, {
      headers: {
        Authorization: `token ${token}`
      }
    });

    if (getRes.status === 200) {
      const data = await getRes.json();
      sha = data.sha;
    }

    // 🔹 update/create file
    const putRes = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "Update from admin dashboard",
        content: base64Content,
        ...(sha && { sha })
      })
    });

    if (!putRes.ok) {
      const err = await putRes.text();
      return res.status(500).send("❌ Push failed: " + err);
    }

    res.send("✅ Pushed to GitHub");

  } catch (err) {
    console.error(err);
    res.status(500).send("❌ Push failed");
  }
});

app.listen(3000, () => console.log("🔥 Server running on 3000"));