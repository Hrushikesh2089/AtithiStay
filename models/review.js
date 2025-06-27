// THIS IS MODEL FOR REVIEWS WHICH IS CONNECTED TO LISTINGS SCHEMA WITH 1*N RELATION

// REQUIRING MONGOOSE
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// REVIEW SCHEMA
const reviewSchema = new Schema({
    comment: String,
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
    ratingAvg: {
        type: Number,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
},{ timestamps: true });

// EXPORTING REVIEW MODEL
module.exports = mongoose.model("Review", reviewSchema);