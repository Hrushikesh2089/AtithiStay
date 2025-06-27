maptilersdk.config.apiKey = mapToken;
const map = new maptilersdk.Map({
    container: 'map', // container's id or the HTML element to render the map
    style: "hybrid",
    center: [longitude, latitude], // starting position [lng, lat]
    zoom: 9, // starting zoom
});

const geolocateControl = new maptilersdk.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: true,
    showUserHeading: true
});

// Add the control to the map
map.addControl(geolocateControl);

// Variables to store user and listing locations
let userLocation = { latitude: null, longitude: null };
const listingLocation = { latitude: latitude, longitude: longitude }; // Example coordinates for the listing


// Function to perform reverse geocoding and fetch human-readable location
function reverseGeocode(latitude, longitude) {
    const reverseGeocodeUrl = `https://api.maptiler.com/geocoding/${longitude},${latitude}.json?key=${mapToken}`;

    fetch(reverseGeocodeUrl)
        .then(response => response.json())
        .then(data => {
            if (data && data.features && data.features.length > 0) {
                const location = data.features[0].place_name;
                console.log(`User's Location: ${location}`);
                
                // Display the human-readable location on the webpage
                const locationText = document.getElementById('locationText');
                locationText.innerText = location;
            } else {
                console.log('No location found for the provided coordinates.');
            }
        })
        .catch(error => console.error('Error performing reverse geocoding:', error));
}


// Handle the geolocate event to get the user's coordinates
geolocateControl.on('geolocate', function(event) {
    userLocation.latitude = event.coords.latitude;
    userLocation.longitude = event.coords.longitude;
    console.log(`User Latitude: ${userLocation.latitude}, User Longitude: ${userLocation.longitude}`);

    // Perform reverse geocoding
    reverseGeocode(userLocation.latitude, userLocation.longitude);
});

// Trigger geolocation when the button is clicked
document.getElementById('locateMeButton').addEventListener('click', function() {
    geolocateControl.trigger();

    if (userLocation.latitude !== null && userLocation.longitude !== null) {
        reverseGeocode(userLocation.latitude, userLocation.longitude);
    } else {
        console.log('User location is not available.');
    }

});

// Trigger location to listing and display distance when the button is clicked
document.getElementById('locateListingButton').addEventListener('click', function() {
    const listingZoomLevel = 11; // Adjust the zoom level for the listing

    // Smoothly transition to the listing location
    map.flyTo({
        center: [longitude, latitude],
        zoom: listingZoomLevel,
        speed: 3, // Adjust the speed of the animation
        curve: 1, // Adjust the curvature of the animation
        easing: function (t) {
            return t;
        }
    });

    console.log(`Flying to listing: Latitude: ${listing.latitude}, Longitude: ${listing.longitude}`);
});

document.getElementById('distanceButton').addEventListener('click', function() {
    // Function to calculate the distance between two coordinates using Haversine formula
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in kilometers
    }

    // Calculate and display the distance to the listing location
    if (userLocation.latitude !== null && userLocation.longitude !== null) {
        const distance = calculateDistance(userLocation.latitude, userLocation.longitude, listingLocation.latitude, listingLocation.longitude);
        const distanceText = document.getElementById('distanceText');
        
        // Update the distance text
        distanceText.innerText = `${distance.toFixed(0)} km`;
    } else {
        console.log('User location is not available.');
    }
});




const customMarker = document.createElement('div');
customMarker.className = 'custom-marker'; // Add a class for styling if needed
customMarker.innerHTML = '<i class="fa-solid fa-house"></i>'; // Use a Font Awesome icon class

// Optional: Style the custom marker
customMarker.style.fontSize = '18px'; // Adjust the size of the icon
customMarker.style.color = 'white'; // Change the color of the icon
customMarker.style.width = '40px'; // Set the width of the custom marker
customMarker.style.height = '40px'; // Set the height of the custom marker
customMarker.style.backgroundColor = '#fe424d';
customMarker.style.borderRadius = '50%'
customMarker.style.display = 'flex';
customMarker.style.alignItems = 'center';
customMarker.style.justifyContent = 'center';

const marker = new maptilersdk.Marker(
    {
        element: customMarker,
        offset: [0, -33]
    }
)
    .setLngLat([longitude, latitude])
    .addTo(map);


// Create a popup
const popup = new maptilersdk.Popup(
    { offset: 25 },
)
    .setHTML(`<h3>${popup_title}, ${popup_location}</h3><p>Exact Location will be provided after booking</p>`);

// Attach the popup to the marker
marker.setPopup(popup);
