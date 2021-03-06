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

var MONGODB_URI = "mongodb://heroku_fz028395:9v57lg03s8la5keokv1pigh3in@ds113746.mlab.com:13746/heroku_fz028395"

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
  useMongoClient: true
});

// Set Handlebars, default layout, and view engine to look for .handlebars
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


// =========== The Routes ===========

// GET requests

app.get("/", function(req, res) {
  // A find query will be run as soon as the user lands on the homepage
  db.Article.find({})
    .then(function(data) {
      // All data found from the query will be put in an object value with
      // a key matching the db table, and then passed through Handlebars
      var targetObj = {
        articles: data
      }

      res.render("index", targetObj)
    })
	  .catch(function(err) {
      // If there's an error, show it to the client
      res.json("You have errors: ", err);
    })
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
// Shows results as a json object
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
// It will populate along with its associated comment.
// Shows results as a json object
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
    res.status(404).json("You have errors: ");
  });
});

// GET route to show all comments as a json object
app.get("/comments", function(req,res) {
  db.Comment.find({})
    .then(function(dbComment) {
      // if the find query is successful
      res.json(dbComment);
    })
    .catch(function(err) {
      // if an error occured, show it to the client
      res.status(404).json("You have errors: ");
    });
});

// GET route to show a specific comment by id.
// It will populate along with its associated User
// Shows results as a json object
app.get("/comments/:id", function(req, res) {
  db.Comment.findOne({ _id: req.params.id })
  // show the user associated with this comment
  .populate("userAssociation")
  .then(function(dbComment) {
    // if this findOne query is a success
    res.json(dbComment);
  })
  .catch(function(err) {
    // if an error occured, show it to the client
    res.status(404).json("You have errors: ");
  });
});

// GET route to show all users as a json object
app.get("/users", function(req,res) {
  db.User.find({})
    .then(function(dbUser) {
      // if the find query is successful
      res.json(dbUser);
    })
    .catch(function(err) {
      // if an error occured, show it to the client
      res.status(404).json("You have errors: ");
    });
});



// POST requests

// POST route for saving or updating comments associated
// with an article
app.post("/articles/:id", function(req, res) {
  db.Comment.create(req.body)
  .then(function(dbComment) {
    // If a comment was successfully created, find the Article
    // that matches the _id and send it the updated associated Comment.
    // The push-each-position 0 will push a new comment into index 0 of the comment array
    // in the Article model.
     return db.Article.findOneAndUpdate(
      { _id: req.params.id }, 
      { $push: { comment: 
        { $each: [ dbComment._id ], $position: 0 } } }, 
      { new: true });
  })
  .then(function(dbUser) {
    return db.Comment.findOneAndUpdate(
      { _id: req.params.id},
      { $push: { userAssociation: dbUser._id} },
      { new: true });
  })
  .then(function(dbArticle) {
    // If the Article was successfully updated, send it
    // back to the client
    res.json(dbArticle)
  })
  .catch(function(err) {
    // If there was an error, send it to the client
    res.json(err);
  })
});

// POST route to create a new user
app.post("/newUser", function(req, res) {
  db.User.create({
    username: req.body.username,
    email:    req.body.email
  }, 
  function(err, inserted) {
    if (err) {
      // Log the error if one is encountered during the query
      console.log("This here's an error: ",err);
    }
    else {
      // Otherwise, log the inserted data
      console.log(inserted);
      res.json(inserted);
    }
  });
});

// The listener. Starts the server. 
app.listen(PORT, function() {
  console.log(`Welcome to Port ${PORT}!`);
});