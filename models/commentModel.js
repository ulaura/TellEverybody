// setting up the model for user comments

var mongoose = require("mongoose");

// saving reference to the Schema constructor
var Schema = mongoose.Schema;

// comment title
// comment body
// article association - references articleModel
// user who wrote it - references userModel
var CommentSchema = new Schema ({
	commentTitle: {
		type: String,
		required: true
	},
	commentBody: {
		type: String,
		required: true
	},
	userAssociation: {
		type: Schema.Types.ObjectId,
		ref: "User"
	}
});



// Creating the model from the schema above
var Comment = mongoose.model("Comment", CommentSchema);


// export the model
module.exports = Comment;