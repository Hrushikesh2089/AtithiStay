// REQUIRING
const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/user-controller.js");
const {isLoggedIn} = require("../middleware.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });


// SIGNUP FORM ROUTE
router.get("/signup", userController.renderSignupForm);

// SIGNUP ROUTE
router.post("/signup", wrapAsync(userController.signup));

// LOGIN FORM ROUTE
router.get("/login", userController.renderLoginForm);

// LOGIN ROUTE
router.post(
    "/login",
    saveRedirectUrl, 
    passport.authenticate('local', { failureRedirect: '/login', failureFlash: true, }),
    userController.login
);

// LOGOUT ROUTE
router.get("/logout", userController.logout);

// PROFILE ROUTE
router.get("/profile/:currUser",isLoggedIn, wrapAsync(userController.profile));

// EDIT PROFILE FORM ROUTE
router.get("/profile/edit/:currUser",isLoggedIn, wrapAsync(userController.editProfile));

// EDIT PROFILE ROUTE
router.put("/profile/:id",isLoggedIn, upload.single("currUser[image]"), wrapAsync(userController.updateProfile));


module.exports = router;
// HERE ROUTER.ROUTE IS NOT IMPLEMENTED