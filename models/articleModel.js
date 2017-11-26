// setting up the model for articles

var mongoose = require("mongoose");

// saving reference to the Schema constructor
var Schema = mongoose.Schema;

// headline
// summary
// url
// associated user comments - references commentModel
var ArticleSchema = new Schema ({
	headline: {
		type: String,
		required: true
	},
	summary: {
		type: String,
		required: true
	},
	url: {
		type: String,
		required: true
	},
	comment: [{
		type: Schema.Types.ObjectId,
		ref: "Comment"
	}],
});



// Creating the model from the schema above
var Article = mongoose.model("Article", ArticleSchema);


// export the model
module.exports = Article;