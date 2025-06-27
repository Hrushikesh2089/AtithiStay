// REQUIRING MODEL
const User = require("../models/user.js");
const Listing = require("../models/listing.js");
const Bookings = require("../models/booking.js");

// SIGNUP FORM CONTROLLER
module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs", { includeFilter: false });
};

// SIGNUP CONTROLLER
module.exports.signup = async(req, res) => {
    try {
        let {username, email, ownerContact, password} = req.body;
        const newUser = new User({username, email, ownerContact});
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if(err) {
                return next(err);
            }
            req.flash("success", "Welcome to AtithiStay", req.user.username);
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

// LOGIN FORM CONTROLLER
module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs", { includeFilter: false });
};

// LOGIN CONTROLLER
module.exports.login = async(req, res) => {
    req.flash("success","Welcome back to AtithiStay", req.user.username);
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

// LOGOUT CONTROLLER
module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if(err) {
            return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    });
};

// PROFILE CONTROLLER
module.exports.profile = async (req, res) => {
    const { currUser } = req.params;

    const profile = await User.findById(currUser).populate({
        path: 'bookings',
        populate: [
            { path: 'listing', model: 'Listing' },
            { path: 'user', model: 'User' }
        ]
    });

    const currentDate = new Date();
    const currentDateOnly = currentDate.toISOString().slice(0, 10);

    const allBookings = await Bookings.find({})
        .populate({
            path: 'listing',
            populate: {
                path: 'owner',
                model: 'User'
            }
        })
        .populate('user');

    const allListings = await Listing.find({})
        .populate("reviews")
        .populate("owner");

    const userListing = allListings
        .filter(listing => listing.owner?.username === profile.username)
        .map(listing => listing._id);

    const activeBookings = allBookings.filter(
        booking => new Date(booking.checkOutDate).toISOString().slice(0, 10) >= currentDateOnly
    );

    const upcommingGuest = allBookings
        .filter(booking =>
            booking.status === 0 && // accepted bookings
            new Date(booking.checkOutDate).toISOString().slice(0, 10) >= currentDateOnly
        )
        .sort((a, b) => new Date(a.checkInDate) - new Date(b.checkInDate));
        
    const myBookings = allBookings.filter(
        booking => booking.user?._id?.toString() === currUser
    ).length;

    const userListingCount = userListing.length;

    // Get IDs of listings owned by the user
    const userOwnedListings = allListings.filter(
        listing => listing.owner?._id?.toString() === currUser
    ).map(listing => listing._id.toString());

    // Filter bookings received on the user's listings
    const receivedBookings = allBookings.filter(
        booking => userOwnedListings.includes(booking.listing?._id?.toString())
    );

    const receivedBookingsCount = receivedBookings.length;

    res.render('users/profile.ejs', {
        profile,
        allListings,
        myBookings,
        activeBookings,
        upcommingGuest,
        currentDateOnly,
        userListingCount,
        receivedBookingsCount
    });
};

// EDIT PROFILE FORM CONTROLLER
module.exports.editProfile = async(req, res) => {
    let { currUser } = req.params;
    const profile = await User.findById(currUser);

    res.render('users/editProfile.ejs', { profile, includeFilter: false });
};

// EDIT PROFILE CONTROLLER
module.exports.updateProfile = async(req, res) => {

    let { id } = req.params;
    const updatedProfile = req.body.currUser;
    
    let newprofile = await User.findByIdAndUpdate(id, { ...updatedProfile });
    if (typeof req.file != "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        newprofile.image = { url, filename };
            
        await newprofile.save();
    }
    req.flash("success", "Profile Updated!");
    res.redirect(`/profile/${id}`);
};