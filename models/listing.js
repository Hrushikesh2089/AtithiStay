// THIS IS MONGOOSE MODEL WHICH IS USED TO DESCRIBE THE TYPE OF DATA IN LISTING FOR DATABASE

// REQUIRING MONGOOSE
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// REQUIRING REVIEW MODEL
const Review = require("./review.js");
const Booking = require("./booking.js");

// LISTING SCHEMA
const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description:{
        type: String,
    },
    image: [
        {
            url: String,
            filename: String,
        }
    ],
    maxguests: {
        type: Number,
    },
    category: {
        type: String,
        enum: ["Rooms", "Iconic_cities", "Mountains", "Amazing_pools", "Castels", "Camping", "Farms", "Arctic", "Amazing_views", "Treehouse", "Cabins", "Mansions"],
    },
    amenities:{
        type: String,
    },
    destination: {
        type: String,
    },
    address: {
        type: String,
    },
    country: {
        type: String,
    },
    price: {
        type: Number,
    },
    ownerUPIID: {
        type: String,
    },
    ownerBusinessName: {
        type: String,
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    location: {
        type: {
            type: String, // "type" is a string that should always be "Point"
            enum: ['Point'], // 'Point' is the only value allowed
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    bookedDates: [Date],
});

// POST MONGOOSE MIDDLEWARE TO DELETE REVIEWS ONCE LISTING IS DELETED
listingSchema.post("findOneAndDelete", async(listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

// CREATING MODEL
const Listing = mongoose.model("Listing", listingSchema);

// EXPORTING MODEL
module.exports = Listing;