const express = require("express");
const fs = require("fs");
const cors = require("cors");
const simpleGit = require("simple-git");

const app = express();
const git = simpleGit();

app.use(cors());
app.use(express.json());

/* 📂 list files */
app.get("/files", (req, res) => {
  fs.readdir("./", (err, files) => {
    res.json(files);
  });
});

/* 📖 open file */
app.get("/file/:name", (req, res) => {
  fs.readFile(req.params.name, "utf8", (err, data) => {
    res.send(data);
  });
});

/* 💾 save */
app.post("/save/:name", (req, res) => {
  fs.writeFile(req.params.name, req.body.content, () => {
    res.send("Saved");
  });
});

/* 🚀 git push */
app.post("/push", async (req, res) => {

  try {
    await git.add(".");
    await git.commit("Update from Admin Panel");
    await git.push();

    res.send("Pushed!");
  } catch (err) {
    res.send("Error: " + err);
  }

});

app.listen(3000, () => console.log("🔥 Server running on 3000"));