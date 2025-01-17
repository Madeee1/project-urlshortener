require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const dns = require("dns");

// Basic Configuration
const port = process.env.PORT || 3000;

// Use a bodyparser middleware
app.use(bodyParser.urlencoded({ extended: false }));

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
app.post("/api/shorturl", (req, res) => {
  const url = req.body.url;

  isValidURL(url)
    .then((isValidBool) => {
      if (!isValidBool) {
        console.log("URL SENT & INVALID: " + url);
        res.json({ error: "invalid url" });
      } else {
        // Check if url is already in database using then()
        urlExists(url).then((data) => {
          console.log("URL EXISTS: " + data);
          if (data === null) {
            console.log("URL EXISTS, LINE 43, ADDURL IS CALLED FOR: " + url);
            addUrl(url).then((savedUrl) => {
              res.json({
                original_url: savedUrl.original_url,
                short_url: savedUrl.short_url,
              });
            });
          } else {
            console.log(
              "URL DOES NOT EXIST IN MONGO, LINE 1, GETBYORIGINALURL CALLED FOR: " +
                url
            );
            getByOriginalUrl(url).then((shortUrl) => {
              res.json({ original_url: url, short_url: shortUrl });
            });
          }
        });
      }
    })
    .catch((err) => {
      console.log("URL SENT & INVALID: " + url);
      res.json({ error: "invalid url" });
    });
});

// Function to handle GET to /api/shorturl/:shortUrl
app.get("/api/shorturl/:shortUrl", (req, res) => {
  const shortUrl = req.params.shortUrl;
  console.log(
    "API/SHORTURL/:SHORTURL IS CALLED WITH, getbyshorturl called: " + shortUrl
  );
  getByShortUrl(shortUrl).then((url) => {
    if (url) {
      console.log(
        "URL IS FOUND BY SHORT NUMBER, LINE 66, REDIRECTING TO: " + url
      );
      // If url exists, redirect to it
      res.redirect(url);
    } else {
      res.json({ error: "No short URL found for the given input" });
    }
  });
});

// Function to test if url is valid with this regex
async function isValidURL(url) {
  const { hostname } = new URL(url);
  return new Promise((resolve, reject) => {
    dns.lookup(hostname, (err) => {
      if (err) {
        reject(false);
      } else {
        resolve(true);
      }
    });
  });
}

isValidURL("ftp:/john-doe.invalidTLD")
  .then((isValid) => {
    console.log("NIH HASILNYA NIH" + isValid);
  })
  .catch((err) => {
    console.log("ERROR KAH" + err);
  });

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
    const data = await Url.find({});
    return data.length + 1;
  } catch (err) {
    console.log(err);
  }
}

// Function to add a new url to the database
async function addUrl(url) {
  try {
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
    const data = await Url.findOne({ original_url: url });
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
}
