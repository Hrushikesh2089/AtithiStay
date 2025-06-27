// REQUIRING MONGOOSE
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// BOOKING SCHEMA
const bookingSchema = new Schema({
    listing: {
        type: Schema.Types.ObjectId,
        ref: "Listing",
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    checkInDate: {
        type: Date,
        required: true
    },
    checkOutDate: {
        type: Date,
        required: true
    },
    totalNights: {
        type: Number,
        required: true,
    },
    guests: {
        adults: {
            type: Number,
            required: true
        },
        childrens: {
            type: Number,
            required: true
        }
    },
    paymentAmount: {
        finalServiceFee: {
            type: Number,
            required: true
        },
        finalGstAmount: {
            type: Number,
            required: true
        },
        finalPaymentAmount: {
            type: Number,
            required: true
        },        
    },
    paymentScreenshot: [
        {
            url: String,
            filename: String,
        }
    ],
    status: {
        type: Number
    }
}, { timestamps: true });


const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;