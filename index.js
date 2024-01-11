import {config} from 'dotenv'; config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
const SOCKET_PORT = 3001;
const PORT = 3002;
import {createServer} from 'http'

const app = express();
// app.use(cors({origin: "http://localhost:3000"})) //allow communication between frontend and backend
app.use(cors());

//middleware for JSON
app.use(express.json())
// app.use(express.urlencoded({extended: false}))

//connecting to MongoDB using Mongoose
const DBPass = process.env.DB_PASS;
const mongoDBurl = "mongodb+srv://encrypto_2:"+DBPass+"@cluster0.o3s7dmp.mongodb.net/Authentication?retryWrites=true&w=majority"
mongoose
	.connect(mongoDBurl)
	.then(()=>{
		console.log("MongoDB connection established.");
	})
	.catch(()=> {
		console.log("Cannot connect to the database");
	})

app.get("/", (req, res) => {
	res.send("<h1>Hello World. This is a backend server</h1>")
})

app.listen(PORT, () => {
	console.log('The server is running on', PORT);
})


//Connecting to different routes

//1. Connecting to authorization route
import authRouter from "./routes/auth.js";
app.use("/", authRouter)

//2. Connecting to messaging route via socket.io
import configureSocket from './chatting.js'
const socketServer = createServer(app);
const io = configureSocket(socketServer);
socketServer.listen(SOCKET_PORT, () => {
	console.log("Socket server is running on PORT: ", SOCKET_PORT)
})

//3. Connecting to addFriend router:
import addFriend from './routes/addfriend.js'
app.use("/addfriend", addFriend);

// 4. Router to exchange messages
import exchMsg from './routes/exchMsg.js'
app.use('/exchMsg', exchMsg); 