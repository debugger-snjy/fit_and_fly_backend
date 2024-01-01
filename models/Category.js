const mongoose = require('mongoose');

// Defining the Schema for the Category
const CategorySchema = new mongoose.Schema({

    // We will give reference to the items model ==> It like a foreign key
    categoryName: {
        type: "String",
        required: true,
        unique: true,
    },
    categoryDate: {
        type: Date,
        default: () => new Date().toLocaleString(),
        required: true,
    },
    addedBy: {
        type: String,
        required: true,
    },
    categoryImageLocation: {
        type: String,
        required: true,
    },
    categoryAdderName: {
        type: String,
        required: true,
    }

});

// Exporting the model: 
// model takes a name and the schema

const Category = mongoose.model("category", CategorySchema);
// Category.createIndexes() // used to create indexes and don't save duplicates records
// To avoid creating 2 indexes, we will remove this and we will verfiy the duplicate Category in the code itself (auth.js)
module.exports = Category;