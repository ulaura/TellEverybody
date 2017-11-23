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
mongoose.connect(" ", {
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

// GET route to perform a scrape
app.get("/scrape", function(req, res) {
  // Make a request for the news section of ycombinator
  request("https://www.npr.org/sections/national/", function(error, response, html) {
    // Load the html body from request into cheerio
    var $ = cheerio.load(html);
    // For each element with a ".item-info" class
    $(".item-info").each(function(i, element) {
      // Save the headline, summary, and url of each link enclosed in the current element
      var headline = $(element).children("h2").text();
      var summary  = $(element).children("p").text();
      var url      = $(element).children("h2").children("a").attr("href");

      // If the found element has a headline, summary, and url
      if (headline && summary && url) {
        // Insert the data in the Article model
        db.Article.create({
          headline:  headline,
          summary:   summary,
          url:       url
        },
        function(err, inserted) {
          if (err) {
            // Log the error if one is encountered during the query
            console.log("This here's an error: ",err);
          }
          else {
            // Otherwise, log the inserted data
            console.log(inserted);
          }
        });
      }  
    });
  });

  // Send a "Scrape Complete" message to the browser
  res.send("Scrape Complete");
});

// GET route for grabbing all the Articles in the db
app.get("/articles", function(req,res) {
  db.Article.find({})
    .then(function(dbArticle) {
      // if the find query is successful
      res.json(dbArticle);
    })
    .catch(function(err) {
      // if an error occured, show it to the client
      res.json("You have errors: ", err);
    });
});

// GET route for getting a specific article by id.
// It will populate along with its associated note
app.get("/articles/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
  // show all comments associated with this article
  .populate("comment")
  .then(function(dbArticle) {
    // if this findOne query is a success
    res.json(dbArticle);
  })
  .catch(function(err) {
    // if an error occured, show it to the client
    res.json("You have errors: ", err);
  });
});

// The listener. Starts the server. 
app.listen(PORT, function() {
  console.log(`App listening on PORT: ${PORT}!`);
});