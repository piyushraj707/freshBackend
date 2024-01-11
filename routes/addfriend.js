import express from "express"
import authenticateToken from "../middlewares/authenticateToken.js";
import user from "../models/user.js";
import myFriends from "../models/friends.js";

const router = express.Router();

router.get("/", authenticateToken, (req, res) => {
	console.log('friend API fired 1.')
})

async function addNewFriend(username, newFriend) {
	try {
		const updatedFriendList = await myFriends.findOneAndUpdate(
			{username: username},
			{$addToSet: {friends: newFriend}},
			{new: true, upsert: true}
		)
		console.log("New friend list: ");
		console.log(updatedFriendList)
	}
	catch (err) {
		console.log('Something went wrong')
		console.log(err)
	}
}

router.get("/myfriends", authenticateToken, async (req, res) => {
	try {
		const result = await myFriends.findOne({username: req.userInfo.username});
		if (result) {
			const arr = result.friends;
			const promises = arr.map(async (friend) => {
				const friendInfo = await user.findOne({username: friend});
				return {
					username: friend,
					name: friendInfo.name
				};
			})
			const finalArray = await Promise.all(promises);
			res.status(200).send(finalArray)
		}
		else res.status(404)
	}
	catch {
		res.status(401)
		console.log("There was an error")
	}
})

router.get("/:friend", authenticateToken, (req, res) => {
	const friend = req.params.friend;
	// console.log(friend)
	const me = req.userInfo.username
	user.findOne({username: friend})
		.then((friendInfo) => {
			if (!friendInfo) {
				res.status(404).send(new Error("No user with this username found."))
			}
			else {
				if (friend !== me) {
					addNewFriend(me, friend);	
					res.status(200).json({
						name: friendInfo.name,
						username: friendInfo.username
					})
				}
				else res.status(400).send("Cannot talk to yourself.")
			}
		})
		.catch((err) => {
			res.status(401).send("Friend not found")
		})
})

export default router;