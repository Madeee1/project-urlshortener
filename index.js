require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

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

    }
  });
});

// Function to POST a request to json/url.json
function postUrl(url, short_url) {
  
}

