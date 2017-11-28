// File for front end JS

// grabbing the articles from the db as a JSON
// and displaying them in a bootstrap card on
// index.handlebars
$.getJSON("/articles", function(data) {
	for (var i = 0; i < data.length; i++) {
		$(".article").append("<div class='card'>"
		+ "<div class='card-body'> <h4 class='card-title'>" + data[i].headline + "</h4>"
		+ "<p class='card-text'>" + data[i].summary + "</p>"
		+ "<a href='" + data[i].url +"' target='_blank' class='card-link'>Read the article</a>" 
    + "<a href='#' class='card-link' id='read-comment' data-id='" + data[i]._id + "'>Read Comments</a>"
		+ "<br><a href='#' class='card-link' id='comment-link' data-id='" + data[i]._id + "'>TELL EVERYBODY WHAT YOU THINK</a></div></div>");
	}

});

// When the user clicks the TELL EVERYBODY WHAT YOU THINK link
// the comment box will pop up
$(document).on("click","#comment-link", function() {
	// make sure the comment box starts off empty
	$(".comment").empty();

  // This handles if a user is signed in or not.
  // Users must be signed in to comment.
  var site = window.location.search;
  var userId;

  
  if (site.indexOf("?user_id=") === -1) {
    $(".comment").append("<h4>You must log in before you can comment!</h4>");
    $(".comment").append("<button class='create-user'>Create User</button>" +
      "<button class='login'>Log In</button>");
  }

  else {

  	var articleId = $(this).attr("data-id");

    $.ajax({
      method: "GET",
      url: "/articles/" + articleId
    })
      // With that done, add the note information to the page
      .done(function(data) {
        console.log(data);
        // The headline for the article
        $(".comment").append("<h2>" + data.headline + "</h2>");

        // An input for the user to add a title to their comment
        $(".comment").append("<form><div class='form-group'><label for='titleinput'>Add a Title to Your Comment: </label>"
        + "<input class='form-control' id='titleinput' type='text' placeholder='Add a title to your comment'></div>" 
  			// a textarea for the user to type in their comment 
  			+ "<div class='form-group'><label for='bodyinput'>Tell everybody what you think here: </label>"    
        + "<textarea class='form-control' id='bodyinput' rows='5' placeholder='Type your comment here'></textarea><div>"
        + "<button data-id='" + data._id + "' id='savecomment'>TELL EVERYBODY</button></form>");

      });
  }
});

// When a user clicks on the Create User button
$(document).on("click", ".create-user", function() {
  // hide the Create User Button
  $(".create-user").hide();

  // add new user form
  // Username input box
  $(".comment").append("<form><div class='form-group'><label for='username'>Username</label>"
  +"<input type='text' class='form-control' id='username' aria-describedby='usernameHelp' placeholder='Enter username'></div>"
  // Email input box
  +"<div class='form-group'><label for='user-email'>Email address</label>"
  +"<input type='email' class='form-control' id='user-email' aria-describedby='emailHelp' placeholder='Enter email'></div>"
  // Submit Button
  + "<button type='submit' class='submit'>Submit</button><form>");
});

// When a user clicks the submit button in the Create User form
$("form").on("submit", function(event) {
  event.preventDefault();

  $.ajax({
    method: "POST",
    url: "/newUser",
    data: {
      username: $("#username").val().trim(),
      email:    $("#user-email").val().trim()
    }
  })
  .done(function(data) {
    console.log(data);

    // Add the new User ObjectID to url
    window.location.href + "/" + data._id;

    // Empty the comment div
    $(".comment").empty()

    // Tell user sign up was succesful
    $(".comment").append("<p>Sign up succesful!!</p>");

    // Add in comment form
    $(".comment").append("<h2>" + data.headline + "</h2>");

    // An input for the user to add a title to their comment
    $(".comment").append("<form><div class='form-group'><label for='titleinput'>Add a Title to Your Comment: </label>"
    + "<input class='form-control' id='titleinput' type='text' placeholder='Add a title to your comment'></div>" 
    // a textarea for the user to type in their comment 
    + "<div class='form-group'><label for='bodyinput'>Tell everybody what you think here: </label>"    
    + "<textarea class='form-control' id='bodyinput' rows='5' placeholder='Type your comment here'></textarea><div>"
    + "<button data-id='" + data._id + "' id='savecomment'>TELL EVERYBODY</button></form>");


  })
})


// When the user clicks on the Read Comments link
// a box with stored comments will pop up
$(document).on("click", "#read-comment", function() {

  $(".read").empty();

  var articleId = $(this).attr("data-id");

  $.ajax({
    method: "GET",
    url: "/articles/" + articleId
  })
    .done(function(data) {
      console.log(data);

      $(".read").append("<h2>" + data.headline + "</h2>");

      if (data.comment.length > 0) {
        for (var i = 0; i < data.comment.length; i++) {
          $(".read").append("<div class='card'>"
          + "<div class='card-body'> <h4 class='card-title'>" + data.comment[i].commentTitle + "</h4>"
          + "<p class='card-text'>" + data.comment[i].commentBody + "</p>"
          + "<hr><p>" + data.comment[i].userAssociation + "</p></div></div>");
        }
      }
      else {
        $(".read").append("<p>No one has said anything about this article yet!</p>");
      }
    })
})


// When you click the savecomment button
$(document).on("click", "#savecomment", function() {
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