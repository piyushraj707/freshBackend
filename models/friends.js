import mongoose from "mongoose";

const friendSchema = new mongoose.Schema({
	username: {
		type: String,
		require: true
	},
	friends: {
		type: [String],
	}
});

const myFriends = mongoose.model("friends", friendSchema);
export default myFriends;
