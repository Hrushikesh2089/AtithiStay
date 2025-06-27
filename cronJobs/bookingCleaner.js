const Bookings = require('../models/booking');
const Listing = require('../models/listing');
const User = require('../models/user');

module.exports = async function deleteExpiredBookings() {
    const currentDateOnly = new Date().toISOString().slice(0, 10);

    const allBookings = await Bookings.find({})
        .populate('listing')
        .populate('user');

    for (let booking of allBookings) {
        if (Array.isArray(booking.dateRange)) {
            const updatedDateRange = booking.dateRange.filter(
                date => new Date(date).toISOString().slice(0, 10) >= currentDateOnly
            );
            if (updatedDateRange.length !== booking.dateRange.length) {
                booking.dateRange = updatedDateRange;
                await booking.save();
            }
        }

        if (booking.checkOutDate.getTime() <= Date.now()) {
            if (booking.status === 0) {
                const listing = await Listing.findById(booking.listing);
                if (listing) {
                    listing.bookingStatus = 0;
                    await listing.save();
                }
            }

            await Bookings.deleteOne({ _id: booking._id });
            await Listing.findByIdAndUpdate(booking.listing, {
                $pull: { allListingBookings: booking._id }
            });
            await User.findByIdAndUpdate(booking.user, {
                $pull: { bookings: booking._id }
            });
        }
    }

    const allListings = await Listing.find({});
    for (let listing of allListings) {
        if (Array.isArray(listing.bookedDates)) {
            const updatedBookedDates = listing.bookedDates.filter(
                date => new Date(date).toISOString().slice(0, 10) >= currentDateOnly
            );
            if (updatedBookedDates.length !== listing.bookedDates.length) {
                listing.bookedDates = updatedBookedDates;
                await listing.save();
            }
        }
    }

    console.log("✅ Cleanup job completed");
};
