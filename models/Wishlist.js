const mongoose = require('mongoose');

// Defining the Schema for the Wishlist
const WishlistSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "customer"
    },

    // We will give reference to the items model ==> It like a foreign key
    wishlistItem: {
        type: "String",
        required: true
    },

    itemName: {
        type: String,
        required: true,
    },
    itemDate: {
        type: String,
        required: true,
    },
    itemPrice: {
        type: String,
        required: true,
    },
    itemType: {
        type: String,
        required: true,
    },
    itemCategory: {
        type: String,
        required: true,
    },
    itemImages: {
        type: String,
        required: true,
    },
    itemCode: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: () => new Date().toLocaleString(),
        required: true,
    }
});

// Exporting the model: 
// model takes a name and the schema

const Wishlist = mongoose.model("wishlist", WishlistSchema);
// Wishlist.createIndexes() // used to create indexes and don't save duplicates records
// To avoid creating 2 indexes, we will remove this and we will verfiy the duplicate Wishlist in the code itself (auth.js)
module.exports = Wishlist;