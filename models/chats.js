import mongoose from "mongoose";

const chatsSchema = new mongoose.Schema({
	participants: {
		type: [String],
		require: true,
	},
	messages: {
		type: [{
			author: String,
			timestamp: Date,
			text: String
		}]
	}
});

const chatsDB = mongoose.model("chats", chatsSchema);
export default chatsDB;