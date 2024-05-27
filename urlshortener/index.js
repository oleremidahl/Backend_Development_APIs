require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
let bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Basic Configuration
const port = process.env.PORT || 3000;


app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

  let urlDatabase = {}; // A simple in-memory database

  app.post('/api/shorturl', function(req, res) {
    const originalUrl = req.body.url;
    
    // Check if the URL is valid
    const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
    if (!urlRegex.test(originalUrl)) {
      return res.json({ error: 'invalid url' });
    }
  
    // Generate a short URL
    const shortUrl = Object.keys(urlDatabase).length + 1;
  
    // Store the original URL in the database
    urlDatabase[shortUrl] = originalUrl;
  
    // Return the original and short URLs
    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
  
  app.get('/api/shorturl/:shortUrl', function(req, res) {
    const shortUrl = req.params.shortUrl;
  
    // Check if the short URL exists in the database
    if (!urlDatabase[shortUrl]) {
      return res.status(404).json({ error: 'Short URL not found' });
    }
  
    // Redirect to the original URL
    res.redirect(urlDatabase[shortUrl]);
  });

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
