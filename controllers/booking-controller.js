// REQUIRING MODELS
const User = require("../models/user.js");
const Listing = require("../models/listing.js");
const Bookings = require("../models/booking.js");

// REQUIRING LIBRARIES
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const path = require('path');

// GERERATE BILL ROUTE CONTROLLER
module.exports.generateBill = async (req, res) => {
    const mybookingId = req.params.mybookingId;

    try {
        const mybooking = await Bookings.findById(mybookingId)
            .populate({
                path: 'listing',
                populate: {
                    path: 'owner',
                    model: 'User'
                }
            })
            .populate('user');

        if (!mybooking) {
            req.flash("error", "Booking not found!");
            return res.redirect("back");
        }

        const filePath = path.join(__dirname, '../views/users/invoice.ejs');

        ejs.renderFile(filePath, { mybooking }, async (err, html) => {
            if (err) {
                console.error("Render error:", err);
                req.flash("error", "Failed to render invoice template.");
                return res.redirect("back");
            }

            try {
                const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
                const page = await browser.newPage();

                await page.setContent(html, { waitUntil: 'networkidle0' });
                const pdfBuffer = await page.pdf({ format: 'A4' });

                await browser.close();

                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename=booking_${mybookingId}.pdf`);
                return res.end(pdfBuffer);

            } catch (pdfError) {
                console.error("PDF generation error:", pdfError);
                req.flash("error", "Error generating PDF.");
                return res.redirect("back");
            }
        });
    } catch (dbError) {
        console.error("Database error:", dbError);
        req.flash("error", "Internal Server Error.");
        return res.redirect("back");
    }
};


// ACCEPT BOOKING ROUTE CONTROLLER
module.exports.acceptBooking = async (req, res) => {
    const { user_id, listing_id, owner_id, booking_id } = req.params;

    try {
        const booking = await Bookings.findOne({ _id: booking_id, user: user_id, listing: listing_id });
        if (!booking) {
            req.flash("error", "Booking not found!");
            return res.redirect(`/profile/${owner_id}`);
        }

        booking.status = 0; // Accepted
        await booking.save();

        req.flash("success", "Booking accepted!");
    } catch (error) {
        console.error("Error accepting booking:", error);
        req.flash("error", "An error occurred while accepting the booking.");
    }

    res.redirect(`/profile/${owner_id}`);
};

// DECLINE BOOKING ROUTE CONTROLLER
module.exports.declineBooking = async (req, res) => {
    const { user_id, listing_id, owner_id, booking_id } = req.params;

    try {
        const booking = await Bookings.findOne({ _id: booking_id, user: user_id, listing: listing_id });
        if (!booking) {
            req.flash("error", "Booking not found!");
            return res.redirect(`/profile/${owner_id}`);
        }

        const startDate = new Date(booking.checkInDate);
        const endDate = new Date(booking.checkOutDate);
        const dateRange = [];
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            dateRange.push(new Date(d).toISOString().split("T")[0]);
        }

        await Listing.updateOne(
            { _id: listing_id },
            { $pull: { bookedDates: { $in: dateRange } } }
        );

        booking.status = 1; // Declined
        await booking.save();

        req.flash("error", "Booking declined and dates unblocked!");
    } catch (error) {
        console.error("Error declining booking:", error);
        req.flash("error", "An error occurred while declining the booking.");
    }

    res.redirect(`/profile/${owner_id}`);
};