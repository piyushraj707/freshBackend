import express from "express"
import {Server} from 'socket.io'

const io = Server(3002);
const router = express.Router()

router.get("/idk", (req, res) => {
	console.log('get request received at /msg/idk');
})

io.on('connection', socket => {
	console.log("A new client just joined");
	console.log(socket.id)
})

export default router