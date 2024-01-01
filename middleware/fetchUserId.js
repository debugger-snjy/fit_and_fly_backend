const jwt = require("jsonwebtoken");

// Importing the dotenv for JWT_SECRET_KEY access
const dotenv = require('dotenv');

// Getting the Environment Variables from the env file
dotenv.config();

// Function to fetch user id from the token which is present in headers
const fetchUser = (req, res, next) => {

    // Get the User from the JWT Token and add id to the req object
    const token = req.header("auth-token")

    // If Token is not available in header,
    if (!token) {
        res.status(404).json({ error: "Token Not Found Acces Denied! Please authenticate using a valid token" });
    }

    // If we got the token :
    // Then we check for whether the token is correct or not
    try {

        const data = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = data.user;

        next();
        // From the POV of auth.js,
        // next() => is the function we have written in the Handler/ after the middleware(fetchUser)        

    } catch (error) {
        res.status(404).json({ error: "Wrong Token Acces Denied! Please authenticate using a valid token" });
    }

}

module.exports = fetchUser;