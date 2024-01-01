// Importing the Mongoose package
const mongoose = require('mongoose');

// Defining the Mongo URI for Database
// Now, Defining the Database of Fit & Fly

// For Online Mongo Atlas
// const mongoURI = "mongodb+srv://sanjay:sanjay1610@cluster0.y85t8b8.mongodb.net/fit&fly?retryWrites=true&w=majority";

// For Local MongoDB
const mongoURI = "mongodb://127.0.0.1:27017/fit&fly";

// Saves the data into iNotebook Database

// Checking whether the node js is connected to mongoose or not
const connectToMongo = async () => {
    try {
        const db = await mongoose.connect(mongoURI);
        console.log("Connection Successfull !");
        return db;
    } catch (error) {
        console.log("Connection Failed : ",error);
    }
}

// Exporting the connectToMongo function
module.exports = connectToMongo