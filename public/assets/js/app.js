// File for front end JS

// grabbing the articles from the db as a JSON
// and displaying them in a div container on
// index.handlebars
$.getJSON("/articles", function(data) {
	for (var i = 0; i < data.length; i++) {
		$(".article").append("<p data-id='" + data[i]._id + "'>" + data[i].headline + "<br />" + data[i].summary + "<br />" + data[i].url + "</p>");
	}
});


// When the user clicks any p tag
$(document).on("click","p", function() {
	// make sure the comment box starts off empty
	$(".comment").empty();

	var articleId = $(this).attr("data-id");

  $.ajax({
    method: "GET",
    url: "/articles/" + articleId
  })
    // With that done, add the note information to the page
    .done(function(data) {
      console.log(data);
      // The title of the article
      $(".comment").append("<h2>" + data.headline + "</h2>");
      // An input to enter a new title
      $(".comment").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $(".comment").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $(".comment").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.comment.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.comment.body);
      }
    });
});
