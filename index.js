require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const csv = require("csv-parser");
const fs = require("fs");

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
    }
  }
);

// Function to test if url is valid with this regex
function isValidURL(url) {
  const urlRegex = new RegExp("^(https?://)?[a-zA-Z0-9]+.[a-zA-Z]{2,}(/S*)?$");
  return urlRegex.test(url);
}

const path = require("path");

let currentDataArray = [];
const csvFilePath = path.join(__dirname, "url.csv");

// Get data from the csv file to a js array
function getCsvData() {
  // make the array empty
  currentDataArray = [];

  // read the csv file using a static path
  fs.createReadStream(csvFilePath, { encoding: 'utf-8' })
  .pipe(csv())
  .on('data', (data) => {
    currentDataArray.push(data);
  })
  .on('end', () => {
    console.log("CSV file successfully processed");
  });
}

console.log(currentDataArray[1]);
