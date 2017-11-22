// This file will handle all the routes for the app

// Bringing in all dependencies needed
var express = require("express");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var request = require("request");

// Requiring all models
var db = require("../models");

var app = express();

// GET requests
app.get("/", function(req, res) {
	res.render("index");
});


// The app will scrape as soon as a user lands on the site
app.get("/scrape", function(req, res) {
	// requesting the latest storeis from nationalgeographic.com
	request("https://www.nationalgeographic.com/latest-stories/"), function(error, response, html) {
		// loading html body from request into cheerio
		var $ = cheerio.load(html);

		// For each div element with class "multi-layout-promos__promo-text"...
		$("div.multi-layout-promos__promo-text").each(function(i, element) {

			// Adding headline, summary, and url, and then
			// saving them as properties in the result object
			var headline = $(element).children("h3 a span").text();
			var summary  = $(element).children("div.multi-layout-promos__promo-dek span").text();
			var url 		 = $(element).children("a").attr("href");

			// creating a new Article with the result object
			db.Article
				.insert({
					headline: headline,
					summary: summary,
					url: url
				},
				function(err, dbArticle) {
					// If scrape is successful...
					console.log("Scrape complete");
				})
				.catch(function(err) {
					// If an error occured, show it to the client
					res.json(err);
				});
		});
	};
});





// Exporting the routes for use on server.js
module.exports = app;