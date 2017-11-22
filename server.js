// Bringing in dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var request = require("request");


// listening to either port 3000 when running localhost
// or the port assigned when app is deployed online
var PORT = process.env.PORT || 3000;

// Requiring all models
var db = require("./models");

// Initialize Express
var app = express();

// =========== Configuring middleware ===========
// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve stactic files such as images, CSS files, and front end JS
app.use(express.static("public"));

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
// REMEMBER TO DELETE PASSWORD WHENEVER UPDATING SERVER.JS!!!
mongoose.Promise = Promise;
mongoose.connect(, {
  useMongoClient: true
});

// Set Handlebars, default layout, and view engine to look for .handlebars
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


// =========== The Routes ===========

// GET requests
app.get("/", function(req, res) {
	res.render("index");
});

// The app will scrape as soon as a user lands on the site
app.get("/scrape", function(req, res) {
  // Make a request for the news section of ycombinator
  request("https://www.nationalgeographic.com/latest-stories/", function(error, response, html) {
    // Load the html body from request into cheerio
    var $ = cheerio.load(html);
    // For each element with a "title" class
    $("div").each(function(i, element) {
      // Save the text and href of each link enclosed in the current element
      var headline = $(element).children("span").text();
      var summary  = $(element).children("div span").text();
      var url      = $(element).children("a").attr("href");

      var resultObj = {
        headline: headline,
        summary: summary,
        url: url
      }

      // Insert the data in the scrapedData db
      db.Article.create(resultObj,
        function(err, inserted) {
          if (err) {
            // Log the error if one is encountered during the query
            console.log(err);
          }
          else {
            // Otherwise, log the inserted data
            console.log(inserted);
          }
        });
      });
    });


  // Send a "Scrape Complete" message to the browser
  res.send("Scrape Complete");
});



// The listener. Starts the server. 
app.listen(PORT, function() {
  console.log(`App listening on PORT: ${PORT}!`);
});