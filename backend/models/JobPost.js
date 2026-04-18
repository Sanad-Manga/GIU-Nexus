const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        trime: true
    },

    company: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true
    },

    requirements: {
        type: [String],
        required: true
    },

    location: {
        type: String,
        required: true
    },

    type: {
        type: String,
        enum: ["full-time", "part-time", "internships"],
        required: true
    },

   



    createdBy :{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
        required: true
    },



});

module.exports = mongoose.model("JobPost", jobPostSchema);