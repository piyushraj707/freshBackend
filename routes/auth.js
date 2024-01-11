import express from "express"
import User from "../models/user.js"
import jwt from "jsonwebtoken"
import CryptoJS from "crypto-js";
import {config} from 'dotenv'; config();
import authenticateToken from "../middlewares/authenticateToken.js";

const router = express.Router();

function salting(pass, salt = null) {
	if (salt == null) salt = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
	let hashedPass = pass;
	for (let i = 0; i<5; i++) {
		hashedPass = CryptoJS.SHA256(hashedPass + salt).toString(CryptoJS.enc.Hex);
	}
	return {password: hashedPass, salt: salt};
}

function checkPass(userInputPass, savedPass, salt) {
	return salting(userInputPass, salt).password === savedPass;
}

router.get("/verify", authenticateToken, (req, res) => {
	console.log("verification request received");
	res.json(req.userInfo)
	res.status(200)
})

router.post("/signup", (req, res) => {
	console.log("post request at /signup (707)");
	User.findOne({username: req.body.username})
		.then((userFound) => {
			if (userFound) {
				res.status(409).send("Username already taken (707)."); //conflict status code
			}
			else {
				console.log("Here is the data received: ", req.body)
				const user = new User({
					username: req.body.username,
					name: req.body.name,
					email: req.body.email,
					...salting(req.body.password)
				})
				user.save()
					.then(()=> {
						const sessionToken = jwt.sign({username: req.body.username, name: req.body.name, email: req.body.email}, process.env.ACCESS_TOKEN_SECRET)
						res
							.status(200)
							.json({sessionToken: sessionToken, msg: "User registered successfully (707)."})
					})
					.catch((err)=> {
						res.status(500).send("Something went wrong (707"); //Internal server error
						console.log(err);
					})
			}
		})
})

router.post("/login", (req, res) => {
	console.log("post request at /login")
	console.log("Data received: ", req.body);
	User.findOne({username: req.body.username})
		.then((userFound) => {
			if (!userFound)
				res.status(404).send("User not found. Please register (707).");
			else if (checkPass(req.body.password, userFound.password, userFound.salt)) {//password matches
				User.findOne({username: req.body.username})
				.then(user => {
					const sessionToken = jwt.sign({username: user.username, name: user.name, email: user.email}, process.env.ACCESS_TOKEN_SECRET)
					res
						.status(200)
						.json({sessionToken: sessionToken, msg: "login credentials correct (707)."})
				})

			}
			else //wrong password
				res.status(401).send("Wrong password/username combination.");
		})
		.catch((err) => {
			console.log("Something went wrong (707");
			console.log(err)
			res.status(500)
		}) 
})

export default router