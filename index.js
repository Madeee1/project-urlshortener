require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const fs = require('fs');
const dns = require('dns');

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

// APP STARTS FROM HERE
// Handle a POST request to /api/shorturl
app.post('/api/shorturl', (req, res) => {
  // Get url from request body
  const url = req.body.url;

  // Check if url is valid
  dns.lookup(url, (err, urlAddress) => {
    if (err) {
      res.json({error: 'invalid url'});
    }
    else {
      // Get short url form of the given url
      const short_url = getUrl(url);
      res.json({original_url: url, short_url: short_url});
    }
  });
});

// Function to get a url from json/url.json, and if it doesn't exist, create a new one and return that
function getUrl(url) {
  fs.readFile('./json/url.json', 'utf8', (err, data) => {
    if (err) {console.log(err);}
    
    else {
      // Search for the url in the json/url.json file
      const urlDataArray = JSON.parse(data);
      const urlObject = urlDataArray.find((urlObject) => urlObject.original_url === url);
      
      // If the url exists, return its short url form
      if (urlObject) {
        return urlObject.short_url;
      }
      // If it doesnt exist, create a new one and return it
      else {
        const short_url = getLastShortUrl() + 1;
        postUrl(url, short_url);
        return short_url;
      }
    }
  });
}

// Function to write a POST request to json/url.json
function postUrl(url, short_url) {
  fs.readFile('./json/url.json', 'utf8', (err, data) => {
    if (err) {console.log(err);}
    
    else {
      const urlData = JSON.parse(data);
      urlData.push({url: url, short_url: short_url});
      
      fs.writeFile('./json/url.json', JSON.stringify(urlData), (err) => {
        if (err) {
          console.log(err);
        }
        else {
          console.log('Data written to file');
        }
      });
    }
  });
}

// Function get the last short_url in the json/url.json file
function getLastShortUrl() {
  fs.readFile('./json/url.json', 'utf8', (err, data) => {
    if (err) {console.log(err);}
    
    else {
      const urlData = JSON.parse(data);
      const lastShortUrl = urlData[urlData.length - 1].short_url;
      return lastShortUrl;
    }
  });
}
