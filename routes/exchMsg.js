import express from "express"
import authenticateToken from "../middlewares/authenticateToken.js"
import chatsDB from "../models/chats.js"

const router = express.Router();

router.get("/:friend", authenticateToken, async (req, res) => {
	//get all chats between user and "/:friend"
	try {
		const friend = req.params.friend;
		const me = req.userInfo.username;
		const result = await chatsDB.findOne({participants: [me, friend].sort()});
		if (!result) res.status(404).send("Chats not found.")
		res.status(200).send(result.messages);
	}
	catch {
		res.status(401);
	}
})

router.post("/", authenticateToken, async(req, res) => {
	//send a msg to req.body.friend
	try {
		const dataToSave = {
			author: req.userInfo.username,
			timestamp: new Date(),
			text: req.body.text
		}
		const participants =  [req.userInfo.username, req.body.friend].sort();
		const doesExist = await chatsDB.countDocuments({participants: participants});
		if (doesExist) { //If there already exists a chat-history
			await chatsDB.findOneAndUpdate(
				{participants: participants},
				{$push: {messages: dataToSave}},
				{new: false, upsert: false}
			)
		}
		else {
			console.log("does not exist") //talking to the friend for the first time
			const newEntry = new chatsDB({
				participants: participants,
				messages: [dataToSave]
			})
			newEntry.save()
				.then(() => {
					console.log("Message sent")
				})
				.catch((err) => {
					console.log('error occured while creating a new chat thread. Here is the error: ')
					console.log("newEntry", newEntry);
					console.log("error: ", err)
				})
			}
		res.status(200).send("Message sent");
	}
	catch {
		console.log("There was an error saving the msg");
	}
})

export default router;