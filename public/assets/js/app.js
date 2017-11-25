// File for front end JS

// grabbing the articles from the db as a JSON
// and displaying them in a bootstrap card on
// index.handlebars
$.getJSON("/articles", function(data) {
	for (var i = 0; i < data.length; i++) {
		$(".article").append("<div class='card'>"
		+ "<div class='card-body'> <h4 class='card-title'>" + data[i].headline + "</h4>"
		+ "<p class='card-text'>" + data[i].summary + "</p>"
		+ "<a href='" + data[i].url +"' class='card-link'>Read the article</a>" 
		+ "<a href='#' class='card-link' id='comment-link' data-id='" + data[i]._id + "'>TELL EVERYBODY WHAT YOU THINK</a></div></div>");
	}

});


// When the user clicks the TELL EVERYBODY WHAT YOU THINK link
$(document).on("click","#comment-link", function() {
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
      if (data.comment) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.comment.commentTitle);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.comment.commentBody);
      }
    });
});

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var articleId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + articleId,
    data: {
      // Value taken from title input
      commentTitle: $("#titleinput").val(),
      // Value taken from note textarea
      commentBody: $("#bodyinput").val()
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $(".comment").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});