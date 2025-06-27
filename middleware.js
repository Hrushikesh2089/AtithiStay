// REQUIRING LISTING MODEL
const Listing = require("./models/listing");

// REQUIRING REVIEW MODEL
const Review = require("./models/review");

// REQUIRING EXPRESSERROR.JS
const ExpressError = require("./utils/ExpressError.js");

// REQUIRING JOI SCHEMA.JS WITH LISTING AND REVIEW SCHEMA
const { listingSchema, reviewSchema } = require("./schema.js");


// MIDDLEWARE TO CHECK USER ISLOGGEDIN OR NOT
module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {   // To check wether the user is logged in or not
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in!");
        return res.redirect("/login");
    }
    next();
};

// MIDDLEWARE TO STORE ORIGINAL URL
module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

// MIDDLEWARE TO CHECK OWNER OF LISTING
module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    try {
        const listing = await Listing.findById(id).populate('owner');

        if (!listing) {
            req.flash("error", "Listing not found.");
            return res.redirect("/listings");
        }

        if (!listing.owner || !listing.owner._id.equals(res.locals.currUser._id)) {
            req.flash("error", "You do not have permission to do that.");
            return res.redirect("/listings");
        }

        next();
    } catch (error) {
        console.error("Error in isOwner middleware:", error);
        req.flash("error", "An error occurred. Please try again.");
        res.redirect("/listings");
    }
};

// MIDDLEWARE TO HANDEL THE SERVER SIDE ERROR FOR LISTING
module.exports.validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// MIDDLEWARE TO HANDEL THE SERVER SIDE ERROR FOR REVIEWS
module.exports.validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

// MIDDLEWARE TO CHECK THE AUTHOR OF REVIEW
module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);
    if (!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You are not the Author of this Review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

// MIDDLEWARE TO HANDEL THE SERVER SIDE ERROR FOR REVIEWS
module.exports.validateUser = (req, res, next) => {
    let {error} = userSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};