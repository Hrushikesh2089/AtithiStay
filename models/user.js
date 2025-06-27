// REQUIRING MONGOOSE
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// REQUIRING PASSPORT-LOCAL-MONGOOSE
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    // Here we did not have to define username and passowrd under schema because passport-local-mongoose by default creates it
    email: {
        type: String,
        required: true,
    },
    image: {
        url: String,
        filename: String,
    },
    ownerContact: {
        type: Number,
    },
    ownerBio: {
        type: String,
    },
    bookings: [
        {
            type: Schema.Types.ObjectId,
            ref: "Booking"
        }
    ]
});

// User plugin's are used to directly use hashing, salting, username and passowrd in to code and we didn't have to build this from scratch
userSchema.plugin(passportLocalMongoose);

// EXPORTING USER MODEL
module.exports = mongoose.model("User", userSchema);