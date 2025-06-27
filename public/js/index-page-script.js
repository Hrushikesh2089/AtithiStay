// THIS IS JAVASCRIPT FILE FOR CUSTOM FORM VALIDATION OF BOOTSTRAP

// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
    'use strict'
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')
  
    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
      form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }
  
        form.classList.add('was-validated')
      }, false)
    })
  })()


// ON INDEX PAGE SCROLL FILTERS TO LEFT SCRIPT
document.getElementById('scroll-left').addEventListener('click', function() {
  const scrollFilter = document.querySelector('.scroll-filters');
  scrollFilter.scrollBy({
      left: -500,
      behavior: 'smooth'
  });
});

// ON INDEX PAGE SCROLL FILTERS TO RIGHT SCRIPT
document.getElementById('scroll-right').addEventListener('click', function() {
    const scrollFilter = document.querySelector('.scroll-filters');
    scrollFilter.scrollBy({
        left: 500,
        behavior: 'smooth'
    });
});

// FILTER BAR TAX SWITCH OUTSIDE FILTERS SCRIPT
const taxSwitch = document.getElementById("flexSwitchCheckDefault");
if (taxSwitch) {
    taxSwitch.addEventListener("click", () => {
        const priceWithoutTax = document.getElementsByClassName("only-price-without-tax");
        const priceWithTax = document.getElementsByClassName("only-price-with-tax");

        for (let i = 0; i < priceWithoutTax.length; i++) {
            if (priceWithoutTax[i].style.display === "inline" || priceWithoutTax[i].style.display === "") {
                priceWithoutTax[i].style.display = "none";
                priceWithTax[i].style.display = "inline";
            } else {
                priceWithoutTax[i].style.display = "inline";
                priceWithTax[i].style.display = "none";
            }
        }
    });
}

// FILTER BAR TAX SWITCH INSIDE FILTERS SCRIPT
const taxSwitch2 = document.getElementById("flexSwitchCheckDefault2");

if (taxSwitch2) {
    taxSwitch2.addEventListener("click", () => {
        const priceWithoutTax = document.getElementsByClassName("only-price-without-tax");
        const priceWithTax = document.getElementsByClassName("only-price-with-tax");

        for (let i = 0; i < priceWithoutTax.length; i++) {
            if (priceWithoutTax[i].style.display === "inline" || priceWithoutTax[i].style.display === "") {
                priceWithoutTax[i].style.display = "none";
                priceWithTax[i].style.display = "inline";
            } else {
                priceWithoutTax[i].style.display = "inline";
                priceWithTax[i].style.display = "none";
            }
        }
    });
}

// CAROUSEL EFFECT OVER LISTING CARD
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll('.listing-carousel').forEach((carouselElement) => {
      const carouselInstance = new bootstrap.Carousel(carouselElement, {
          interval: 1000,
          pause: false,
          ride: false,
          wrap: true
      });

      carouselElement.addEventListener('mouseenter', () => {
          carouselInstance.next();   // move to next slide immediately
          carouselInstance.cycle();  // then start automatic cycling
      });

      carouselElement.addEventListener('mouseleave', () => {
          carouselInstance.pause();
      });
  });
});