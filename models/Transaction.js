const mongoose = require('mongoose');

// Defining the Schema for the Transaction
const TransactionSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "customer"
    },
    transactionorderID: {
        type: String,
        required: "true",
    },
    transactionFrom: {
        type: String,
        required: "true",
    },
    transactionPrice: {
        type: Number,
        required: "true",
    },
    transactionId: {
        type: String,
        required: "true",
        unique: true,
    },
    transactionDate: {
        type: Date,
        default: () => new Date().toLocaleString(),
        required: true,
    },
    transactionCancelled: {
        type: Boolean,
        default: false
    },
    transactionCancelMsg: {
        type: String,
        default: "I'd like to cancel my order.",
    }

});

// Exporting the model: 
// model takes a name and the schema
const Transaction = mongoose.model("transaction", TransactionSchema);
// Transaction.createIndexes() // used to create indexes and don't save duplicates records
// To avoid creating 2 indexes, we will remove this and we will verfiy the duplicate Transaction in the code itself (auth.js)
module.exports = Transaction;