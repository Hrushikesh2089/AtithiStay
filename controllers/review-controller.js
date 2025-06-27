// REQUIRING LISTING MODEL
const Listing = require("../models/listing.js");

// REQUIRING REVIEWS MODEL
const Review = require("../models/review.js");


// CREATE REVIEW POST REQUEST ROUTE CONTROLLER
module.exports.createReview = async(req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success", "New Review Created!"); // Flash message
    res.redirect(`/listings/${listing._id}`);
};

// DELETE REVIEW DELETE REQUEST ROUTE CONTROLLER
module.exports.destroyReview = async (req,res) => {
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review Deleted!"); // Flash message
    res.redirect(`/listings/${id}`);
};