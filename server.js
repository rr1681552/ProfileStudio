
const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = 3000;

const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "profiles.json");
const PUBLIC_DIR = path.join(__dirname, "public");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, "[]", "utf8");
}

app.use(express.json({ limit: "1mb" }));
app.use(express.static(PUBLIC_DIR));

function readProfiles() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch (error) {
    return [];
  }
}

function saveProfiles(profiles) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(profiles, null, 2), "utf8");
}

function cleanText(value, maxLength = 500) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function safeUrl(value) {
  const url = cleanText(value, 500);
  if (!url) return "";

  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return parsed.href;
    }
  } catch (error) {}

  return "";
}

app.get("/api/profiles", (req, res) => {
  res.json(readProfiles());
});

app.get("/api/profiles/:id", (req, res) => {
  const profile = readProfiles().find(
    (item) => item.id === req.params.id
  );

  if (!profile) {
    return res.status(404).json({ message: "Profile not found." });
  }

  res.json(profile);
});

app.post("/api/profiles", (req, res) => {
  const body = req.body || {};
  const name = cleanText(body.name, 80);

  if (!name) {
    return res.status(400).json({
      message: "Please enter your name."
    });
  }

  const skills = Array.isArray(body.skills)
    ? body.skills
        .filter((skill) => typeof skill === "string")
        .map((skill) => cleanText(skill, 40))
        .filter(Boolean)
        .slice(0, 20)
    : [];

  const profile = {
    id: crypto.randomUUID(),
    name,
    role: cleanText(body.role, 100),
    bio: cleanText(body.bio, 500),
    skills,
    avatar: safeUrl(body.avatar),
    github: safeUrl(body.github),
    linkedin: safeUrl(body.linkedin),
    website: safeUrl(body.website),
    createdAt: new Date().toISOString()
  };

  const profiles = readProfiles();
  profiles.unshift(profile);
  saveProfiles(profiles);

  res.status(201).json({
    message: "Profile saved successfully!",
    profile
  });
});

app.delete("/api/profiles/:id", (req, res) => {
  const profiles = readProfiles();
  const updatedProfiles = profiles.filter(
    (item) => item.id !== req.params.id
  );

  if (updatedProfiles.length === profiles.length) {
    return res.status(404).json({
      message: "Profile not found."
    });
  }

  saveProfiles(updatedProfiles);

  res.json({ message: "Profile deleted successfully." });
});
app.get("/{*path}", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return next();
  }

  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

app.use((req, res) => {
  res.status(404).json({ message: "Resource not found." });
});

app.listen(PORT, () => {
  console.log(`Profile Studio running at http://localhost:${PORT}`);
});
