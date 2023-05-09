require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

// Function to handle POST to /api/shorturl
app.post(
  "/api/shorturl",
  bodyParser.urlencoded({ extended: false }),
  (req, res) => {
    const url = req.body.url;

    // Check if url is valid
    if (!isValidURL(url)) {
      res.json({ error: "invalid url" });
    } else {
      // Check if url is already in database using then()
      urlExists(url).then((data) => {
        if (data === null) {
          addUrl(url).then((savedUrl) => {
            res.json({
              original_url: savedUrl.original_url,
              short_url: savedUrl.short_url,
            });
          });
        } else {
          getByOriginalUrl(url).then((shortUrl) => {
            res.json({ original_url: url, short_url: shortUrl });
          });
        }
      });
    }
  }
);

// Function to handle GET to /api/shorturl/:shortUrl
app.get("/api/shorturl/:shortUrl", (req, res) => {
  const shortUrl = req.params.shortUrl;
  getByShortUrl(shortUrl).then((url) => {
    if (url) {
      // If url exists, redirect to it
      res.redirect(url);
    } else {
      res.json({ error: "No short URL found for the given input" });
    }
  });
});

// Function to test if url is valid with this regex
function isValidURL(url) {
  const urlRegex =
    /^(http|https):\/\/(?:www\.)?[a-z0-9]+\.[a-z]+(\/[a-z0-9]+)*$/i;
  return urlRegex.test(url);
}

console.log(isValidURL("https://www.google.com"));

// Use of mongoose starts here
const mongoose = require("mongoose");
const { get } = require("http");

// Connect to database
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create schema, both being required
const urlSchema = new mongoose.Schema({
  original_url: { type: String, required: true, unique: true },
  short_url: { type: Number, required: true, unique: true },
});

// Create model
const Url = mongoose.model("Url", urlSchema);

// Function to get the next available short_url
async function getNextShortUrl() {
  try {
    console.log("GetNextShortUrl is called");
    const data = await Url.find({});
    return data.length + 1;
  } catch (err) {
    console.log(err);
  }
}

// Function to add a new url to the database
async function addUrl(url) {
  try {
    console.log("AddUrl: " + url);
    const shortUrl = await getNextShortUrl();
    const newUrl = new Url({ original_url: url, short_url: shortUrl });
    const savedUrl = await newUrl.save();
    console.log("Saved url: " + savedUrl);
    return savedUrl;
  } catch (err) {
    console.log(err);
  }
}

// Function to get a url from the database
async function getByOriginalUrl(url) {
  try {
    console.log("GetbyOriginalUrl: " + url);
    const foundUrl = await Url.findOne({ original_url: url });
    return foundUrl ? foundUrl.short_url : null;
  } catch (err) {
    console.log(err);
    return null;
  }
}

// Function to get a url from the database
async function getByShortUrl(shortUrl) {
  try {
    console.log("GetbyShortUrl: " + shortUrl);
    const foundLongUrl = await Url.findOne({ short_url: shortUrl });
    return foundLongUrl ? foundLongUrl.original_url : null;
  } catch (err) {
    console.log(err);
    return null;
  }
}

// Function to check if a url is already in the database
async function urlExists(url) {
  try {
    console.log("UrlExists: " + url);
    const data = await Url.findOne({ original_url: url });
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
}
