import jwt from "jsonwebtoken"

//This function verifies the authorization token coming to express 
function authenticateToken(req, res, next) {
	const authHeader = req.headers.authorization;
	const token = authHeader && authHeader.split(' ')[1]
  	if (!token) return res.sendStatus(401)
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, userInfo) => {
		if (err) res.sendStatus(403)
		req.userInfo = userInfo;
	})
	next();
}

export default authenticateToken;