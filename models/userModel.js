// setting up the model for users

var mongoose = require("mongoose");

// saving reference to the Schema constructor
var Schema = mongoose.Schema;

// username
// email 
// userCreated
var UserSchema = new Schema ({
	username: {
		type: String,
		trim: true,
		unique: true,
		required: "A username is required."
	},
	email: {
		type: String,
		unique: true,
		required: "An email is required.",
		match: [/.+\@.+\..+/, "Please enter a valid e-mail address"]
	},
	userCreated: {
		type: Date,
		default: Date.now
	}
});



// Creating the model from the schema above
var User = mongoose.model("User", UserSchema);


// export the model
module.exports = User;