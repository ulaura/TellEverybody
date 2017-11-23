// File for front end JS

// grabbing the articles from the db as a JSON
// and displaying them in a div container on
// index.handlebars
$.getJSON("/articles", function(data) {
	for (var i = 0; i < data.length; i++) {
		$(".article").append("<p data-id='" + data[i]._id + "'>" + data[i].headline + "<br />" + data[i].summary + "<br />" + data[i].url"</p>");
	}
});