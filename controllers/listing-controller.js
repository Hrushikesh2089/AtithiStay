// REQUIRING MODELS
const Listing = require("../models/listing.js");
const User = require("../models/user.js");
const Booking = require("../models/booking");

// REQUIRING LIBRARIES
const axios = require('axios');
const Review = require("../models/review.js");
const mapToken = process.env.MAP_TOKEN;
const Fuse = require('fuse.js');

// INDEX ROUTE GET REQUEST CONTROLLER
module.exports.index = async (req, res) => {
    const category = req.params.category; 
    const minPriceRange = parseInt(req.query['min-price']) || 840;
    const maxPriceRange = parseInt(req.query['max-price']) || 12000;
    const searchListingName = req.query['searchListingName']?.trim();

    let query = {
        price: { $gte: minPriceRange, $lte: maxPriceRange }
    };
    if (category) {
        query.category = category;
    }

    // Fetch listings from database
    let allListings = await Listing.find(query)
        .populate("reviews")
        .populate("owner");


    let filteredListings = allListings;

    if (searchListingName) {
        const fuse = new Fuse(allListings, {
            keys: ['title', 'address', 'country'],
            threshold: 0.4,
            ignoreLocation: true
        });

        const results = fuse.search(searchListingName);
        filteredListings = results.map(result => result.item);
    }

    res.render("listings/index.ejs", {
        allListings: filteredListings, 
        category, 
        minPriceRange, 
        maxPriceRange, 
        searchListingName, 
        includeFilter: true 
    });
};

// TRENDING FILTER ROUTE CONTROLLER
module.exports.trendingFilter = async(req, res) => {
    const category = "Trending";
    const minPriceRange = parseInt(req.query['min-price']) || 840;
    const maxPriceRange = parseInt(req.query['max-price']) || 12000;

    let allListings = await Listing.find({})
        .populate("reviews")
        .populate("owner");    

    let trendingListings = [];
    
    for (let listing of allListings) {
        const ratings = listing.reviews.map(r => r.rating);
        const sum = ratings.reduce((a, b) => a + b, 0);
        const average = (ratings.length > 0) ? (sum / ratings.length).toFixed(2) : 0;
        if(sum >= 15 && average >= 4.00 && average <= 5.00) {
            trendingListings.push(listing);
        }
    }
    
    res.render("listings/index.ejs", { allListings: trendingListings, category, minPriceRange, maxPriceRange });
}

// NEW LISTING FORM CONTROLLER
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs",{ includeFilter: false });
};

// CREATE NEW LISTING CONTROLLER
module.exports.createNewListing = async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    if (req.files["listing[image]"]) {
        newListing.image = req.files["listing[image]"].map(file => ({
            url: file.path,
            filename: file.filename
        }));
    }

    newListing.bookingStatus = 0;

    const place = req.body.listing.address;
    try {
        const geocodeResponse = await axios.get(`https://api.maptiler.com/geocoding/${place}.json?key=${mapToken}`);
        if (geocodeResponse.data.features.length > 0) {
            const [longitude, latitude] = geocodeResponse.data.features[0].center;
            newListing.location = {
                type: "Point",
                coordinates: [longitude, latitude]
            };
        } else {
            req.flash("error", "Location not found. Please try again.");
            return res.redirect("/listings/new");
        }
    } catch (error) {
        console.error('Error geocoding location:', error);
        req.flash("error", "Error geocoding location. Please try again.");
        return res.redirect("/listings/new");
    }

    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

// SHOW LISTING ROUTE CONTROLLER
module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            }
        })
        .populate("owner");
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }

    let avgReviewArr = [] 
    
    for(review of listing.reviews) {
        avgReviewArr.push(review.rating);
    }
   
    let sum = avgReviewArr.reduce((a, b) => a + b, 0);
    let average = (avgReviewArr.length > 0) ? (sum / avgReviewArr.length).toFixed(2) : 0;    

    const allListings = await Listing.find({}).populate("reviews").populate("owner");
    const userListing = [];
    for (let eachListing of allListings) {
        if (eachListing.owner.username === listing.owner.username) {
            userListing.push(listing._id);
        }
    }

    const longitude = listing.location.coordinates[0];
    const latitude = listing.location.coordinates[1];
    const price = JSON.stringify(listing.price);
    const blockedDates = listing.bookedDates.map(date => new Date(date).toISOString().split('T')[0]);

    res.render("listings/show.ejs", { listing, longitude, latitude, average, sum, blockedDates, userListing, includeFilter: false, price });
};

// RESERVE LISTING PAGE CONTROLLER
module.exports.reserveListingPage = async (req, res) => {
    const { listing_id, currUser_id } = req.params;
    const { checkInDate, checkOutDate,total_Nights, adults, childrens, final_Service_Fee, final_Gst_Amount, final_Payment_Amount } = req.body;

    const listing = await Listing.findById(listing_id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            }
        })
        .populate("owner");
    const blockedDates = listing.bookedDates.map(date => new Date(date).toISOString().split('T')[0]);

    let avgReviewArr = [] 
    
    for(review of listing.reviews) {
        avgReviewArr.push(review.rating);
    }

    const startDate = new Date(checkInDate);
    const endDate = new Date(checkOutDate);

    const dateRange = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        dateRange.push(new Date(d).toISOString().split("T")[0]);
    }

    const bookedDateStrings = listing.bookedDates.map(d =>
        new Date(d).toISOString().split("T")[0]
    );

    const isAvailable = dateRange.every(date =>
        !bookedDateStrings.includes(date)
    );

    if (!isAvailable) {
        req.flash("error", "Some or all of the selected dates are already booked.");
        return res.redirect(`/listings/${listing_id}`);
    }
   
    let sum = avgReviewArr.reduce((a, b) => a + b, 0);
    let average = (avgReviewArr.length > 0) ? (sum / avgReviewArr.length).toFixed(2) : 0;    

    res.render("listings/reservePage.ejs", {listing_id, listing, blockedDates, average, currUser_id, checkInDate, checkOutDate, total_Nights, adults, childrens, final_Service_Fee, final_Gst_Amount, final_Payment_Amount});
}

// RESERVE LISTING ON RESERVE PAGE CONTROLLER
module.exports.reserveListing = async (req, res) => {
    const { listing_id, currUser_id } = req.params;
    const { checkInDate, checkOutDate, total_Nights, adults, childrens, final_Service_Fee, final_Gst_Amount, final_Payment_Amount } = req.body;

    const url = req.file?.path;
    const filename = req.file?.filename;

    if (!url || !filename) {
        req.flash("error", "Payment screenshot is required.");
        return res.redirect("back");
    }

    const guests = parseInt(adults, 10) + parseInt(childrens, 10);

    try {
        const listing = await Listing.findById(listing_id).populate("owner");

        if (!listing) {
            req.flash("error", "Listing not found.");
            return res.redirect("/listings");
        }

        const startDate = new Date(checkInDate);
        const endDate = new Date(checkOutDate);

        const dateRange = [];
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            dateRange.push(new Date(d).toISOString().split("T")[0]);
        }

        const bookedDateStrings = listing.bookedDates.map(d =>
            new Date(d).toISOString().split("T")[0]
        );

        const isAvailable = dateRange.every(date =>
            !bookedDateStrings.includes(date)
        );

        if (!isAvailable) {
            req.flash("error", "Some or all of the selected dates are already booked.");
            return res.redirect(`/listings/${listing_id}`);
        }

        listing.bookedDates.push(...dateRange);
        listing.bookedDates = [...new Set(listing.bookedDates)];
        await listing.save();

        const booking = new Booking({
            listing: listing_id,
            user: currUser_id,
            checkInDate: startDate,
            checkOutDate: endDate,
            totalNights: total_Nights,
            guests: {
                adults: parseInt(adults, 10),
                childrens: parseInt(childrens, 10)
            },
            status: 2, // Pending
            paymentAmount: {
                finalServiceFee: final_Service_Fee,
                finalGstAmount: final_Gst_Amount,
                finalPaymentAmount: final_Payment_Amount,
            },
            paymentScreenshot: [{ url, filename }]
        });

        await booking.save();
        listing.owner.bookings.push(booking);
        await listing.owner.save();

        req.flash("success", "Booking request is sent to the owner and dates are reserved, once owner accepts the booking you are ready to go! Please check booking status in your profile.");

        res.redirect(`/listings/${listing_id}`);
    } catch (error) {
        console.error("Error reserving listing:", error);
        req.flash("error", "An error occurred while reserving the listing.");
        res.redirect(`/listings/${listing_id}`);
    }
};

// EDIT LISTING GET REQUEST CONTROLLER
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist!"); 
        return res.redirect("/listings");
    }

    let neworiginalImageUrl = [];

    if (listing.image[0]) {
        neworiginalImageUrl.push(listing.image[0].url.replace("/upload", "/upload/h_200,w_250"));
    }
    if (listing.image[1]) {
        neworiginalImageUrl.push(listing.image[1].url.replace("/upload", "/upload/h_200,w_250"));
    }
    if (listing.image[2]) {
        neworiginalImageUrl.push(listing.image[2].url.replace("/upload", "/upload/h_200,w_250"));
    }

    res.render("listings/edit.ejs", { listing, neworiginalImageUrl, includeFilter: false });
};

// UPDATE LISTING PUT REQUEST CONTROLLER
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    const updatedListing = req.body.listing;

    const place = req.body.listing.address;
    try {
        const geocodeResponse = await axios.get(`https://api.maptiler.com/geocoding/${place}.json?key=${mapToken}`);
        if (geocodeResponse.data.features.length > 0) {
            const [longitude, latitude] = geocodeResponse.data.features[0].center;
            updatedListing.location = {
                type: "Point",
                coordinates: [longitude, latitude]
            };
        } else {
            req.flash("error", "Location not found. Please try again.");
            return res.redirect("/listings/new");
        }
    } catch (error) {
        console.error('Error geocoding location:', error);
        req.flash("error", "Error geocoding location. Please try again.");
        return res.redirect("/listings/new");
    }

    let listing = await Listing.findByIdAndUpdate(id, { ...updatedListing });

    if (req.files["listing[image]"]) {
        listing.image = req.files["listing[image]"].map(file => ({
            url: file.path,
            filename: file.filename
        }));
        await listing.save();
    }

    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listings/${id}`);
};

// DELETE LISTING DELETE REQUEST CONTROLLER
module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;

    try {
        const listing = await Listing.findById(id).populate("reviews");

        if (!listing) {
            req.flash("error", "Listing not found.");
            return res.redirect("/listings");
        }

        if (listing.allListingBookings.length > 0) {
            for (let bookingId of listing.allListingBookings) {
                const booking = await Booking.findByIdAndDelete(bookingId);

                if (booking && booking.user) {
                    await User.findByIdAndUpdate(booking.user, { $pull: { bookings: booking._id } });
                }
            }
        }

        if (listing.reviews.length > 0) {
            for (let reviewId of listing.reviews) {
                await Review.findByIdAndDelete(reviewId);
            }
        }

        await listing.deleteOne();

        req.flash("success", "Listing and associated data deleted successfully!");
        res.redirect("/listings");

    } catch (error) {
        console.error("Error deleting listing:", error);
        req.flash("error", "An error occurred while deleting the listing.");
        res.redirect("/listings");
    }
};