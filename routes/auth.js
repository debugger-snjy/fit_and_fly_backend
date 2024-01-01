// This file is used for Authentication Purpose when user login in the app

// Importing the express Package
const express = require('express');

// Create a router of the express
const router = express.Router()

// Importing the Admin schema from Admin Mongoose Model
const Admin = require("../models/Admin");

// Importing the Customer schema from Customer Mongoose Model
const Customers = require("../models/Customer");

// Importing the Faculty schema from Faculty Mongoose Model
const Employees = require("../models/Employee");

// Importing the express-validator
const { body, validationResult } = require('express-validator');

// Importing dotenv for accessing the Environment Variables
const dotenv = require('dotenv');

// Loads .env file contents into process.env by default
// dotenv.config(); ----> This will not work if Both Backend and Frontend are in same folder
// Because, it will search for the .env file outside the folder i.e, root (Here, inotebook)
// So, to specify from where to load the .env file, we will define the path in the config
dotenv.config({ path: "../Backend/.env" });
// The default path is "/.env"

// Importing the Middleware File :
const fetchUser = require("../middleware/fetchUserId")

// Creating JWT_SECRET :
// const JWT_SECRET = "Sanjayisagoodcoderok";
// This should be hidden and not be disclosed
// Putting it in .env.local
const JWT_SECRET = process.env.JWT_SECRET_KEY;
console.log(process.env.JWT_SECRET_KEY);

// Importing jsonwebtoken
const jwt = require("jsonwebtoken");

// Route 1 : Creating user with POST Request. No Login Required
// Also, we have to change the get request to post request
// We will add the validations after the endpoint in the post method
// Here, no login required
router.post('/createuser', [
    body("email", "Your Email is Empty").notEmpty(),
    body("password", "Your Password is Empty").notEmpty(),
    body("name", "Your Name is Empty").notEmpty(),
    body("phone", "Your Phone is Empty").notEmpty(),
    body("address", "Your Address is Empty").notEmpty(),
    body("gender", "Your Gender is Empty").notEmpty(),
    body("role", "Your Role is Empty").notEmpty(),

    body("email", "Enter a valid Email").isEmail(),
    body("password", "Enter a valid Password").isLength({ min: 5, max: 20 }),
    body("phone", "Your Phone is Empty").isNumeric(),
    body("account_balance", "Your Account Balance is Empty").isNumeric()

], async (req, res) => {

    console.log("Here, you will get authenticate here")

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "";

    // Getting the Results after validations
    const errors = validationResult(req);

    // If we have errors, sending bad request with errors
    if (!errors.isEmpty()) {

        // Setting up the parameters
        status = "failed";
        msg = "Sign Up failed"

        // sending the errors that are present
        return res.status(400).json({ errors: errors.array(), status: status, msg: msg });
    }

    // Here, We have to change the code as we have to verify the duplicate email in the database
    // Check whether the user with this email exists or not
    try {
        // we have to add await as it is a promise and we have to wait till it gets resolves
        let user = await Customers.findOne({ email: req.body.email })
        if (user) {

            // Setting up the parameters
            status = "failed";
            msg = "Account already exists with this Email ID"

            return res.status(400).json({ status, msg: msg })
        }
        // After Validating :
        // Creating the User if not exists and it will be saved in the Database
        // TODO : we don't save password in simple text form
        // Here we are saving password in hash form :

        // generating salt :
        // const salt = await bcrypt.genSalt(10);
        // Generating a secure password & using await as it will return a promise and we have to wait until we get the results
        // const securePass = await bcrypt.hash(req.body.password, salt);

        // Getting the Data of the user
        let userData = await Customers.create({
            email: req.body.email,
            password: req.body.password,
            name: req.body.name,
            phone: req.body.phone,
            address: req.body.address,
            gender: req.body.gender,
            role: req.body.role,
        })

        // We have successfully create a user, we don't return the details
        // We will return some token which will be helpful in login verification
        // Tokens are of 2 Types : Session Tokens and Json Web Token(JWT)
        // We are using JWT authentication
        // For that, we have a package in nodejs, which is "jsonwebtoken"
        // Visit "jwt.io" for the example of JWT
        // JWT contains 3 parts : 
        //      1. Header
        //      2. Payload
        //      3. Signature

        // As we have got the userData, we will only save id of the user in the form of JSON
        // and then it will be passed to the jwt and get signed!
        const userID_Data = {
            user: {
                id: userData._id,
                role: userData.role,
            }
        }

        // Signing the json web token
        const authToken = jwt.sign(userID_Data, JWT_SECRET);

        // Verifying the JWT Token but it will be needed in another endpoint like login endpoint
        // console.log(jwt.verify(authToken,JWT_SECRET))

        // Setting up the parameters
        status = "success";
        msg = "Sign Up Successfully"

        // return res.json(userData)
        return res.json({ authToken, status: status, msg: msg, userData: userData })
        // {authToken} is same as {"authToken" : authToken}

        // removing the then and catch as we have remove the promise
        // Also, Earlier when any error occurs, we only send message "Account already exists with this Email ID."
        // There may be other errors as well
        // But now solving this error

        // .then(userData => res.json(userData))
        // .catch(err => {
        //     console.log(err);
        //     res.json({error : "Account already exists with this Email ID.", description : err.message})
        // })
    } catch (error) {

        // Setting up the parameters
        status = "failed";
        msg = "Sign Up failed"

        console.log("Error Occured !")
        console.error("Error : ", error.message)
        return res.status(500).json({ error: "Internal Server Error !", description: error.message, status, msg: msg })
    }

})

// Route 2 : Authenticate a user using POST Request. No Login Required
// We are using POST as we are dealing with the passwords
router.post('/login', [
    // exists() ==> Used to check that the field shoul not be undefined
    body("email", "Email is Empty").exists(),
    body("password", "Password is Empty").exists(),
    body("role", "Your Role is Empty").exists(),

    body("email", "Enter a valid Email").isEmail(),
    body("password", "Enter a valid Password").isLength({ min: 5, max: 20 })
], async (req, res) => {

    console.log("Here, you will have to login here !")

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "";

    // Getting the Results after validations
    const errors = validationResult(req);

    // If we have errors, sending bad request with errors
    if (!errors.isEmpty()) {

        // Setting up the parameters
        status = "failed";
        msg = "Login Failed"

        // sending the errors that are present
        return res.status(400).json({ status: status, msg: msg, errors: errors.array() });
    }

    // Getting the Email and password :
    const { email, password, role } = req.body;

    // If no errors are present
    try {

        let userWithEmail;

        // Getting the user type or role :
        if (role === "customer") {
            // Fetching the records with the email
            userWithEmail = await Customers.findOne({ email });
        }
        else if (role === "employee") {
            // Fetching the records with the email
            userWithEmail = await Employees.findOne({ email });
        }
        else if (role === "admin") {
            // Fetching the records with the email
            userWithEmail = await Admin.findOne({ email });
        }
        else {
            console.log("Invalid User Role !!")

            msg = "Role Doesn't Exists"
            return res.status(404).json({ status: status, msg: msg, error: "Please enter the correct role !" })
        }

        console.log("Record Found !")

        // If no record found in the database
        if (!userWithEmail) {

            // Setting up the parameters
            status = "failed";
            msg = "Account Doesn't Exists"

            console.log("No Email Found !");
            return res.status(404).json({ status: status, msg: msg, error: "Please try to login with correct credentials !" })
        }

        console.log(userWithEmail)

        // If the code is here that means, user with the given email exists
        // and now we have to compare the passwords to give user a login
        const comparePassword = (password === userWithEmail.password)

        // if password doesn't matches
        if (!comparePassword) {

            // Setting up the parameters
            status = "failed";
            msg = "Incorrect Password"

            console.log("No Password Found !");
            return res.status(404).json({ status: status, msg: msg, error: "Please try to login with correct credentials !" })
        }

        else {
            // if password is also same, then returning the authtoken
            const userID_Data = {
                user: {
                    id: userWithEmail.id,
                    role: role,
                }
            }

            console.log("Hello 1")

            // Signing the json web token
            const authToken = jwt.sign(userID_Data, JWT_SECRET);

            console.log("Hello 2")

            // return res.json(userData)
            // Setting up the parameters
            status = "success";
            msg = "Login Successful"
            return res.json({ status: status, msg: msg, authToken })
        }

    } catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        // Setting up the parameters
        status = "failed";
        msg = "Login Failed"
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }

});

// Route 3 : Get Details of Loggedin User using POST Request. Login Required
// For that one, thing is neccessary that the user should be logined in
// For that, we need the AuthToken to verfiy


// Adding the middleware
router.post('/getuser', fetchUser, async (req, res) => {

    // To Start the code, first of all we have to check whether the user is logged in or not
    // After it is logged in, we will pass the authToken in the header and from the token we will get the id
    // If we write code here, then every time when we used the authentication, we have to paste code everytime
    // So, to make it easier we will use the middleware and that can be used anywhere

    // Making a Variable to track the success or not
    let status = "failed";
    let msg = "";

    try {

        // Getting the Id and Role of the user to find ot from the database
        let userId = req.user.id;
        let userRole = req.user.role;

        console.log("Your Role : : : : ", userRole);

        // Getting the User details from the id
        // To get all the data of the user from the id, we use the select() function 
        // If we don't want any field, we can write "-fieldname".
        // For not getting password, select("-password")
        let user;

        // Getting the user type or role :
        // Fetching the records from the ID that we got from the fetchUser Function ( MiddleWare )
        if (userRole === "customer") {
            user = await Customers.findById(userId).select("-password");
        }
        else if (userRole === "employee") {
            user = await Employees.findById(userId).select("-password");
        }
        else if (userRole === "admin") {
            user = await Admin.findById(userId).select("-password");
        }
        else {
            console.log("Invalid User Role !!")

            msg = "Role Doesn't Exists"
            return res.status(404).json({ status: status, msg: msg, error: "Invalid Role !" })
        }


        // Setting up the parameters
        status = "success";
        msg = "User Fetch Successful"
        return res.json({ status: status, msg: msg, user });
    }
    catch (error) {
        console.log("Error Occured !")
        console.error("Error : ", error.message)
        // Setting up the parameters
        status = "failed";
        msg = "User Fetch Failed"
        return res.status(500).json({ status: status, msg: msg, error: "Internal Server Error !", description: error.message })
    }

});

module.exports = router