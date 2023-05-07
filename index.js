require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

// Function to handle POST to /api/shorturl
app.post('/api/shorturl', bodyParser.urlencoded({ extended: false }), (req, res) => {
  const url = req.body.url;
  
  // Check if url is valid
  if (!isValidURL(url)) {
    res.json({ error: 'invalid url' });
  }
  else {
    
  }
});

// Function to test if url is valid with this regex 
function isValidURL(url) {
  const urlRegex = new RegExp('^(https?:\/\/)?[a-zA-Z0-9]+\.[a-zA-Z]{2,}(\/\S*)?$');
  return urlRegex.test(url);
}

// Use of mongoose starts here
const mongoose = require('mongoose');

// Connect to database
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Create schema, both being required
const urlSchema = new mongoose.Schema({
  original_url: { type: String, required: true, unique: true },
  short_url: { type: Number, required: true, unique: true }
});

// Create model
const Url = mongoose.model('Url', urlSchema);

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
async function getUrl(shortUrl) {
  try {
    const url = await Url.findOne({ short_url: shortUrl });
    return url ? url.original_url : null;
  } catch (err) {
    console.log(err);
    return null;
  }
}  

// Function to check if a url is already in the database
async function urlExists(url) {
  try {
    const data = await Url.find({ original_url: url });
    return data.length > 0;
  } catch (err) {
    console.log(err);
  }
}