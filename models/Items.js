const mongoose = require('mongoose');

// Defining the Schema for the Items
const ItemsSchema = new mongoose.Schema({

    itemName: {
        type: String,
        required: true,
    },
    itemDate: {
        type: Date,
        default: () => new Date().toLocaleString(),
        required: true,
    },
    itemPrice: {
        type: Number,
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
        unique: true,
    },
    itemAddedBy: {
        type: "String",
        required: true,
    },
    itemLastUpdateBy: {
        type: "String",
        required: true,
        default: "None"
    },
    itemViews: {
        type: Number,
        required: true,
        default: 0,
    },
    itemCartCount: {
        type: Number,
        required: true,
        default: 0,
    },
    itemWishlistCount: {
        type: Number,
        required: true,
        default: 0,
    },
    itemOrderedCount: {
        type: Number,
        required: true,
        default: 0,
    },

});

// Exporting the model: 
// model takes a name and the schema

const Items = mongoose.model("items", ItemsSchema);
// Items.createIndexes() // used to create indexes and don't save duplicates records
// To avoid creating 2 indexes, we will remove this and we will verfiy the duplicate Items in the code itself (auth.js)
module.exports = Items;