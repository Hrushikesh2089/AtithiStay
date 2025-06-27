// THIS IS JOI SCHEMA WHICH IS USED FOR SERVER SIDE VALIDATION OR TO VALIDATE DATA PASSED THROUGH POSTMAN OR HOPPSCOTCH
const Joi = require("joi");

// JOI SCHEMA FOR NEW LISTING FORM
module.exports.listingSchema = Joi.object({
    listing:Joi.object({
        title:Joi.string().required(),
        description: Joi.string().required(),
        image: Joi.string().allow("", null),
        maxguests: Joi.number().required().min(1),
        category: Joi.string().required(),
        amenities: Joi.string().required(),
        destination: Joi.string().required(),
        address: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        ownerUPIID: Joi.string().required(),
        ownerBusinessName: Joi.string().required(),
    }).required(),
});

// JOI SCHEMA FOR NEW REVIEW FORM
module.exports.reviewSchema = Joi.object({
    review:Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required()
    }).required()
});

// JOI SHCEMA FOR USER FORMS
module.exports.userSchema = Joi.object({
    user: Joi.object({
        username: Joi.string().alphanum().min(3).max(20).required(), // added by passport-local-mongoose
        email: Joi.string().email().required(),
        password: Joi.string().min(6), // required for registration, not always during update
        image: Joi.object({
            url: Joi.string().uri().allow("", null),
            filename: Joi.string().allow("", null)
        }).optional(),
        ownerContact: Joi.number().min(1000000000).max(9999999999).required(), // assuming 10-digit number
        ownerBio: Joi.string().max(500).allow("", null).optional(),
        bookings: Joi.array().items(Joi.string().hex().length(24)).optional()
    }).required()
});

// JOI SCHEMA FOR NEW BOOKING FORM
module.exports.bookingSchema = Joi.object({
    booking: Joi.object({
        listing: Joi.string().hex().length(24).required(),
        user: Joi.string().hex().length(24).required(),
        checkInDate: Joi.date().required(),
        checkOutDate: Joi.date().greater(Joi.ref('checkInDate')).required(),
        totalNights: Joi.number().min(1).required(),
        guests: Joi.object({
            adults: Joi.number().min(1).required(),
            childrens: Joi.number().min(0).required()
        }).required(),
        paymentAmount: Joi.object({
            finalServiceFee: Joi.number().min(0).required(),
            finalGstAmount: Joi.number().min(0).required(),
            finalPaymentAmount: Joi.number().min(0).required()
        }).required(),
        paymentScreenshot: Joi.array().items(
            Joi.object({
                url: Joi.string().uri().allow("", null),
                filename: Joi.string().allow("", null)
            })
        ).optional(),
        status: Joi.number().valid(0, 1, 2).optional() // Assuming 0 = pending, 1 = accepted, 2 = declined
    }).required()
});