// REQUIRING
const express = require("express");
const router = express.Router( {mergeParams:true} );
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listing-controller.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });


// INDEX ROUTES
router.get("/", wrapAsync(listingController.index));
router.get("/filter/price", wrapAsync(listingController.index));
router.get("/filter/searchListingName", wrapAsync(listingController.index));
router.get("/filter/:category", wrapAsync(listingController.index));

// TRENDING FILTER ROUTE
router.get("/Trending", wrapAsync(listingController.trendingFilter));

// CREATE NEW LISTING FORM ROUTE
router.get("/new", isLoggedIn, listingController.renderNewForm);   // Here we are getting error becaues in show route we used path /listings/:id and in new route we used /listings/new so here "new" is recoginized as an id

// CREATE NEW LISTING ROUTE
router.post("/", isLoggedIn, upload.fields([{ name: "listing[image]", maxCount: 3 }]), validateListing, wrapAsync(listingController.createNewListing));

// SHOW LISTING ROUTE 
router.get("/:id", isLoggedIn, wrapAsync(listingController.showListing));

// RESERVE LISTING PAGE
router.post("/reservepage/:listing_id", isLoggedIn, wrapAsync(listingController.reserveListingPage));

// RESERVE LISTING
router.post("/reserve/:listing_id/:currUser_id", isLoggedIn, upload.single("paymentScreenshot"), wrapAsync(listingController.reserveListing));

// EDIT LISTING ROUTE
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

// UPDATE LISTING ROUTE
router.put("/:id", isLoggedIn, isOwner, upload.fields([{ name: "listing[image]", maxCount: 3 }]), validateListing, wrapAsync(listingController.updateListing));

// DELETE LISTING ROUTE
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));


module.exports = router;
// HERE ROUTER.ROUTE IS NOT IMPLEMENTED