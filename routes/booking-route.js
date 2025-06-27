// REQUIRING
const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const bookingController = require("../controllers/booking-controller.js");
const {isLoggedIn} = require("../middleware.js");

// GENERATE BILL ROUTE
router.get("/download_bill/:currUser/:mybookingId", isLoggedIn, wrapAsync(bookingController.generateBill));

// ACCEPT BOOKING ROUTES
router.post("/accept/:user_id/:listing_id/:owner_id/:booking_id",isLoggedIn, wrapAsync(bookingController.acceptBooking));

// DECLINE BOOKING ROUTES
router.post("/decline/:user_id/:listing_id/:owner_id/:booking_id",isLoggedIn, wrapAsync(bookingController.declineBooking));

module.exports = router;