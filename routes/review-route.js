// REQUIRING EXPRESS
const express = require("express");
const router = express.Router( { mergeParams: true} );   // HERE WE ADD MERGE PARAMS BECAUSE THE ID WHICH COMES INTO REQ BODY REMAINS ONLY IN APP.JS, IT IS NOT DIVERTED TO THIS FILE SO WE NEED TO MERGE IT
const wrapAsync = require("../utils/wrapAsync.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");
const reviewController = require("../controllers/review-controller.js");


// REVIEWS ROUTE
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

// DELETE REVIEW ROUTE
router.delete("/:reviewId",isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;
// HERE ROUTER.ROUTE IS NOT IMPLEMENTED