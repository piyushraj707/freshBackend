import {Server} from 'socket.io';
import jwt from 'jsonwebtoken'
import chatsDB from './models/chats.js'
let socketIdToUserId = new Map();
let userIdToSocketId = new Map();

const configureSocket = (server) => {
	const io = new Server(server, {
		cors: {
			origin: '*'
		}
	});

	io.use((socket, next) => { //This is middleware for the socket connection
		const token = socket.handshake.auth.sessionToken
		if (!token) next(new Error('Please provide a token'));
		jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, userInfo) => {
			if (err) new(new Error("Invalid token"));
			socket.username = userInfo.username;
		})
		next();
	})

	io.on('connection', (socket) => {
		console.log('User', socket.username, 'connected with id:', socket.id);
		socketIdToUserId.set(socket.id, socket.username);
		userIdToSocketId.set(socket.username, socket.id);
		socket.on('disconnect', () => {
			socketIdToUserId.delete(socket.id)
			userIdToSocketId.delete(socket.username)
			console.log("User", socket.username, 'with ID:', socket.id, 'disconnected');
		})

		socket.on('send-msg', async (req) => {
			try {
				const dataToSave = {
					author: socket.username,
					timestamp: new Date(),
					text: req.text
				}
				const participants = [socket.username, req.friend].sort();
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
							console.log("Message Sent")
						})
						.catch(err => {
							console.log('error occured while creating a new chat thread. Here is the error: ')
							console.log("newEntry", newEntry);
							console.log("error: ", err)
						})
				}
				//If the msg successfully gets saved to the database, send the msg to the friend as well via socket
				if (userIdToSocketId.has(req.friend)) {//if the user is online
					socket.to(userIdToSocketId.get(req.friend)).emit('receive-msg', dataToSave)
				}
			}
			catch {
				console.log("There was an error saving the msg");
			}
		})

	})
}

export default configureSocket;