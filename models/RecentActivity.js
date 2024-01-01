const mongoose = require('mongoose');

// Defining the Schema for the User
const RecentActivitySchema = new mongoose.Schema({
    // Adding user in it for making it more specific
    // And using this we will only fetch notes of tha user only not any other user
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    recentData: [{
        type: Object,
    }],
});

// Exporting the model: 
// model takes a name and the schema
const RecentActivity = mongoose.model("recentAccessed", RecentActivitySchema);
module.exports = RecentActivity