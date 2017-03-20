var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');
var mongoose = require('mongoose');

var mongoURL = process.env.MONGOLAB_URI || "mongodb://localhost:27017/url-shortener";

// Connect to database
mongoose.connect(mongoURL);
mongoose.connection.on('error', function(err) {
    console.error('MongoDB connection error: ' + err);
    process.exit(-1);
  }
);

// Get the URL List model
var urlList = require('./schema.js');

var port = process.env.PORT;

app.listen(port, function(){
  console.log("Listening on port: " + port);
});

// Display the landing Page

app.get('/', function(req, res) {
  var fileName = path.join(__dirname, 'index.html');
  res.sendFile(fileName, function (err) {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
    else {
      console.log('Sent:', fileName);
    }
  });
});


// Lookup a shortened URL
app.get('/:id', function(req, res) {
  var id = parseInt(req.params.id,10);
  if(Number.isNaN(id)) {
    res.status(404).send("Invalid Short URL");
  } else {
    urlList.find({id: id}, function (err, docs) {
      if (err) res.status(404).send(err);
      if (docs && docs.length) {
        res.redirect(docs[0].url);
      } else {
        res.status(404).send("Invalid Short URL");
      }
    });
  }
});


// create a new shortened URL
app.get('/new/*?', function(req,res) {
  var validUrl = require('valid-url');
  var theUrl = req.params[0];

  // Validate the URL
  if(theUrl && validUrl.isUri(theUrl)) {
    // Search for URL first
    urlList.find({url: theUrl}, function (err, docs) {
      if(docs && docs.length) {
        res.status(201).json({
          "original_url": theUrl,
          "short_url": "http://bledahrd-fcc-url-shortener.herokuapp.com/" + docs[0].id
        });
      }
    });

    // If it's not found, create a new one
    urlList.create({url: theUrl}, function (err, myUrl) {
      if (err) {
        return handleError(res, err);
      }
      return res.status(201).json({
        "original_url": theUrl,
        "short_url": "http://bledhard-fcc-url-shortener.herokuapp.com/" + myUrl.id
      });
    });
  } else {
    res.status(400).json({
      error: "URL Invalid"
    });
  }

});

// Error Handler
function handleError(res, err) {
  return res.status(500).send(err);
}