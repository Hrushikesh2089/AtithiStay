// REQUITING ENV FILE
if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

// REQUIRING EXPRESS
const express = require("express");
const app = express();

// REQUIRING PATHS OF EJS TEMPLATES
const path = require("path");

// REQUIRING STATIC FILES LIKE CSS
app.use(express.static(path.join(__dirname, "/public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// GETTING REQUEST PARAMATERS (req.params)
app.use(express.urlencoded({ extended: true }));

// OVERRIDING THE REQUESTS
const methodOverride = require("method-override");
app.use(methodOverride("_method"));

// REQUIRING MONGOOSE
const mongoose = require("mongoose");
// const MONGO_URL = "mongodb://127.0.0.1:27017/AtithiStay";
const dbUrl = process.env.ATLASDB_URL;

main()
.then((res) => {
    console.log("connected to DB AtithiStay");
})
.catch((err) => {
    console.log(err);
});
async function main() {
    await mongoose.connect(dbUrl);
}

// REQUIRING EJS-MATE
const ejsMate = require("ejs-mate");
app.engine('ejs', ejsMate);

// REQUIRING EXPRESSERROR.JS
const ExpressError = require("./utils/ExpressError.js");

// REQUIRING LISTING ROUTES
const listingRouter = require("./routes/listing-route.js");

// REQUIRING REVIEW ROUTES
const reviewRouter = require("./routes/review-route.js");

// REQUIRING BOOKING ROUTES
const bookingRouter = require("./routes/booking-route.js");

// REQUIRING EXPRESS-SESSIONS
const session = require("express-session");

// REQUIRING CONNECT-MONGO
const MongoStore = require("connect-mongo");

// REQUIRING CONNECT-FLASH
const flash = require("connect-flash");

// REQUIRING PASSPORT
const passport = require("passport");

// REQUIRING PASSPORT-LOCAL
const LocalStrategy = require("passport-local");

// REQUIRING USER MODEL
const User = require("./models/user.js");

// REQUIRING USER ROUTES
const userRouter = require("./routes/user-route.js");

// REQUIRING FUSE
require('fuse.js');

// REQUIRING CRON
// require('./cronJobs/bookingCleaner');

// TAKING THIS SESSION TO ONLINE DATABASE
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

// USING EXPRESS-SESSIONS
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // Standard expiry time in miliseconds for a week
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true, // To prevent cross scripting attack
    },
};

app.use(session(sessionOptions));

// USING PASSPORT
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// USING CONNECT-FLASH
app.use(flash());   
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});


// USING ALL LISTING ROUTES
app.use("/listings", listingRouter);

// USING ALL REVIEW ROUTES
app.use("/listings/:id/reviews", reviewRouter);

// USING ALL USER ROUTES
app.use("/", userRouter);

// USING BOOKING ROUTES
app.use("/profile", bookingRouter);

// Redirect root to /listings
app.get("/", (req, res) => {
    res.redirect("/listings");
});

// EASYCRON FOR EXPIRED BOOKING CLEANING
const deleteExpiredBookings = require("./cronJobs/bookingCleaner");

app.get("/run-expired-cleanup", async (req, res) => {
    if (req.query.token !== process.env.CRON_SECRET) {
        return res.status(401).send("Unauthorized");
    }

    try {
        await deleteExpiredBookings();
        res.send("✅ Expired bookings cleaned");
    } catch (err) {
        console.error("Cleanup error:", err);
        res.status(500).send("❌ Cleanup failed");
    }
});


// FOR ALL NON-EXISTING ROUTES
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

// MIDDLEWARE TO HANDEL THE CLIENT SIDE ERROR
app.use((err, req, res, next) => {
    let {statusCode=500, message="Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs", {message});
});


// LISTENING TO SERVER
app.listen(8080, () => {
    console.log("server is listening to port 8080");
});