let filterPopup = document.getElementById("filter-popup");

function toggleFilterPopup() {
    if (filterPopup.classList.contains("open-filter-popup")) {
        closeFilterPopup();
    } else {
        openFilterPopup();
    }
}

function openFilterPopup() {
    filterPopup.classList.add("open-filter-popup");
    document.addEventListener('click', closeFilterPopupOutsideClick);
}

function closeFilterPopup() {
    filterPopup.classList.remove("open-filter-popup");
    document.removeEventListener('click', closeFilterPopupOutsideClick);
}

function closeFilterPopupOutsideClick(e) {
    if (!filterPopup.contains(e.target) && !e.target.closest(".filter-btn")) {
        closeFilterPopup();
    }
}




let langPopup = document.getElementById("lang-popup");

function toggleLangPopup() {
    if (langPopup.classList.contains("open-lang-popup")) {
        closeLangPopup();
    } else {
        openLangPopup();
    }
}

function openLangPopup() {
    langPopup.classList.add("open-lang-popup");
    document.addEventListener('click', closeLangPopupOutsideClick);
}

function closeLangPopup() {
    langPopup.classList.remove("open-lang-popup");
    document.removeEventListener('click', closeLangPopupOutsideClick);
}

function closeLangPopupOutsideClick(e) {
    if (!langPopup.contains(e.target) && !e.target.closest(".toogleLangPopup")) {
        closeLangPopup();
    }
}






document.addEventListener("DOMContentLoaded", function() {
// Wait for the Google Translate dropdown to load
setTimeout(function() {
const dropdown = document.querySelector("#google_element select");
const optionsContainer = document.getElementById("options-container");
const suggOptionContainer = document.getElementById("sugg-option-container");

if (dropdown) {

    // Create a custom English button
    const englishButton = document.createElement("button");
    englishButton.textContent = "English";
    englishButton.value = "en";
    englishButton.classList.add('notranslate', 'btn', 'each-lang-btn');
    englishButton.onclick = function() {
      // Find the "Show Original" button and click it
      const showOriginalButton = document.querySelector('.goog-te-banner-frame')?.contentDocument?.querySelector('.goog-te-menu2-item div');
      if (showOriginalButton) {
        showOriginalButton.click();
      } else {
        // Fallback to change the dropdown value to English
        dropdown.value = "en";
        dropdown.dispatchEvent(new Event('change'));
      }
    };
    suggOptionContainer.appendChild(englishButton);


  for (let i = 1; i < dropdown.options.length; i++) {
    const option = dropdown.options[i];
    const button = document.createElement("button");
    button.textContent = option.text;
    // console.log(button.textContent)
    button.value = option.value;
    button.classList.add('notranslate', 'btn', 'each-lang-btn');
    button.onclick = function() {
      dropdown.value = button.value;
      dropdown.dispatchEvent(new Event('change'));
    };
    optionsContainer.appendChild(button);
    if(button.textContent == 'Hindi') {
      suggOptionContainer.appendChild(button);
    }
    if(button.textContent == 'Marathi') {
      suggOptionContainer.appendChild(button);
    }
  }
}
}, 1000); // Adjust the timeout as necessary
});



// Get the elements
const minRange = document.getElementById('min-range');
const minNumber = document.getElementById('min-number');
const maxRange = document.getElementById('max-range');
const maxNumber = document.getElementById('max-number');

// Synchronize the min range and number input
minRange.addEventListener('input', function() {
    minNumber.value = minRange.value;
});

minNumber.addEventListener('input', function() {
    minRange.value = minNumber.value;
});

// Synchronize the max range and number input
maxRange.addEventListener('input', function() {
    maxNumber.value = maxRange.value;
});

maxNumber.addEventListener('input', function() {
    maxRange.value = maxNumber.value;
});