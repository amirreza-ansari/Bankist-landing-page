// Enable strict mode for safer JavaScript (catches common errors)
'use strict';

// ---------------------- VARIABLE DECLARATIONS ----------------------
// Select the button that scrolls to section 1
const btnScrollTo = document.querySelector('.btn--scroll-to');
// Select the first section to scroll to
const section1 = document.querySelector('#section--1');
// Select modal window elements for pop-up functionality
const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.btn--close-modal');
const btnsOpenModal = document.querySelectorAll('.btn--show-modal');
// Select tab component elements
const tabsContainer = document.querySelector('.operations__tab-container');
const operationsBtn = document.querySelectorAll('.operations__tab');
const operationsContent = document.querySelectorAll('.operations__content');
// Select the navigation bar
const navBar = document.querySelector('.nav');

///////////////////////////////////////
// ----------- MODAL WINDOW LOGIC -----------
// Function to open the modal (removes 'hidden' class)
const openModal = function () {
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

// Function to close the modal (adds 'hidden' class)
const closeModal = function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

// Add click event listeners to all modal open buttons
btnsOpenModal.forEach(btn => btn.addEventListener('click', openModal));

// Add click event listeners to close modal and overlay
btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

// Listen for 'Escape' key to close modal if open
// (checks if modal is not hidden before closing)
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

// ---------------------- SMOOTH SCROLLING ----------------------
// Scroll smoothly to section 1 when button is clicked
btnScrollTo.addEventListener('click', function (e) {
  section1.scrollIntoView({ behavior: 'smooth' });
});

// ---------------------- NAVIGATION SCROLLING ----------------------
// Use event delegation for navigation links (efficient)
document.querySelector('.nav__links').addEventListener('click', function (e) {
  e.preventDefault(); // Prevent default anchor behavior

  // Check if a nav link was clicked
  if (e.target.classList.contains('nav__link')) {
    const id = e.target.getAttribute('href'); // Get target section id
    document.querySelector(id).scrollIntoView({ behavior: 'smooth' }); // Scroll to section
  }
});

// ---------------------- NAVIGATION HOVER EFFECT ----------------------
// Handler to fade siblings and logo on hover
const linkHandler = function (e) {
  if (e.target.classList.contains('nav__link')) {
    const link = e.target;
    // Select all nav links in the same nav bar
    const siblings = link.closest('.nav').querySelectorAll('.nav__link');
    // Select the logo
    const logo = document.querySelector('.nav__logo');

    // Fade all siblings except the hovered link
    siblings.forEach(li => {
      if (li !== link) li.style.opacity = this; // 'this' is bound to opacity value
    });

    // Fade the logo as well
    logo.style.opacity = this;
  }
};

// Bind opacity value (0.5 for mouseover, 1 for mouseout)
navBar.addEventListener('mouseover', linkHandler.bind(0.5));
navBar.addEventListener('mouseout', linkHandler.bind(1));

// ---------------------- TAB COMPONENT ----------------------
// Handle tab switching logic
// Event delegation: listen for clicks on the tab container
// and determine which tab was clicked

tabsContainer.addEventListener('click', function (e) {
  // Find the closest tab button (handles clicks on child elements)
  const clicked = e.target.closest('.operations__tab');

  // Guard clause: if no tab was clicked, exit
  if (!clicked) return;

  // Remove active class from all tabs and contents
  operationsBtn.forEach(t => t.classList.remove('operations__tab--active'));
  operationsContent.forEach(c =>
    c.classList.remove('operations__content--active')
  );

  // Activate clicked tab
  clicked.classList.add('operations__tab--active');

  // Show corresponding content area using data-tab attribute
  document
    .querySelector(`.operations__content--${clicked.dataset.tab}`)
    .classList.add('operations__content--active');
});

// ---------------------- STICKY NAVIGATION BAR ----------------------
// Select the header (the section above which nav becomes sticky)
const header = document.querySelector('.header');
// Get the height of the nav bar (used for offset)
const navBarHeight = navBar.getBoundingClientRect().height;

// Callback for Intersection Observer
// Adds/removes 'sticky' class based on header visibility
const navBarObsFun = function (entries) {
  // Only process the first entry (IntersectionObserver always provides an array, but for a single observed element, only one entry is present)
  const [entry] = entries;
  // Add a guard for navBar existence and prevent unnecessary DOM updates
  if (!navBar) return;
  if (!entry.isIntersecting) {
    if (!navBar.classList.contains('sticky')) navBar.classList.add('sticky');
  } else {
    if (navBar.classList.contains('sticky')) navBar.classList.remove('sticky');
  }
};

// Create Intersection Observer for sticky nav
const navigationObserver = new IntersectionObserver(navBarObsFun, {
  root: null, // Observe relative to viewport
  threshold: 0, // Callback fires as soon as header moves out of view
  rootMargin: `-${navBarHeight}px`, // Offset by nav height so nav sticks at right moment
});

// Start observing the header
navigationObserver.observe(header);

// ---------------------- Revealing Sections on Scroll ----------------------

const allSections = document.querySelectorAll('.section');

const revealSection = function (entries, observer) {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    entry.target.classList.remove('section--hidden');

    observer.unobserve(entry.target);
  });
};

const sectionObserver = new IntersectionObserver(revealSection, {
  root: null,
  threshold: 0.15,
});

allSections.forEach(sec => {
  sec.classList.add('section--hidden');
  sectionObserver.observe(sec);
});

// ---------------------- Lazy Loading Images ----------------------

const lazyImgs = document.querySelectorAll('img[data-src]');

const loadImage = function (entries, observer) {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    entry.target.src = entry.target.dataset.src;

    entry.target.addEventListener('load', function () {
      entry.target.classList.remove('lazy-img');
    });

    observer.unobserve(entry.target);
  });
};

const imageObserver = new IntersectionObserver(loadImage, {
  root: null,
  threshold: 0,
  rootMargin: '200px',
});

lazyImgs.forEach(img => {
  imageObserver.observe(img);
});

// ---------------------- Slider Component ----------------------

// Select the main slider container
const slider = document.querySelector('.slider');

// Select all individual slide elements inside the slider
const slides = document.querySelectorAll('.slide');

// Select the right (next) and left (previous) navigation buttons
const btnRight = document.querySelector('.slider__btn--right');
const btnLeft = document.querySelector('.slider__btn--left');

// Helper function to update the position of each slide based on the current slide index
// The slide at the current index is shown, others are moved left/right off screen
const transformSlides = function (slide) {
  slides.forEach((s, i) => {
    // Each slide is translated horizontally by 100% times its offset from the current slide
    // For example, if currentSlide = 1, slide 0 is at -100%, slide 1 at 0%, slide 2 at 100%, etc.
    s.style.transform = `translateX(${100 * (i - slide)}%)`;
  });
};

// Track the index of the currently visible slide
let currentSlide = 0;

// Store the total number of slides
const maxLength = slides.length;

// Initialize the slider by showing the first slide (index 0)
transformSlides(currentSlide);

const goRight = function () {
  // If we're at the last slide, loop back to the first slide
  if (currentSlide === maxLength - 1) {
    currentSlide = 0;
  } else {
    // Otherwise, go to the next slide
    currentSlide++;
  }
  // Update slide positions to reflect the new current slide
  transformSlides(currentSlide);

  activateDots(currentSlide);
};

const goLeft = function () {
  // If we're at the first slide, loop to the last slide
  if (currentSlide === 0) {
    currentSlide = maxLength - 1;
  } else {
    // Otherwise, go to the previous slide
    currentSlide--;
  }
  // Update slide positions to reflect the new current slide
  transformSlides(currentSlide);
  activateDots(currentSlide);
};

// Event listener for the right (next) button
btnRight.addEventListener('click', goRight);

// Event listener for the left (previous) button
btnLeft.addEventListener('click', goLeft);

// implement keyboard functionality for slider component

document.addEventListener('keydown', function (e) {
  if (e.key === 'ArrowRight') goRight();
  if (e.key === 'ArrowLeft') goLeft();
});

// Adding Dots to the component

const dotsContainer = document.querySelector('.dots');

const createDots = function () {
  slides.forEach((s, i) => {
    dotsContainer.insertAdjacentHTML(
      'beforeend',
      `
      <button class="dots__dot dots__dot--active" data-slide="${i}"></button>
      `
    );
  });
};
createDots();

const dots = document.querySelectorAll('.dots__dot');

const deactivateDots = function () {
  dots.forEach(dot => dot.classList.remove('dots__dot--active'));
};

deactivateDots();
document
  .querySelector(`.dots__dot[data-slide="0"]`)
  .classList.add('dots__dot--active');

function activateDots(currentSlide) {
  deactivateDots();
  document
    .querySelector(`.dots__dot[data-slide="${currentSlide}"]`)
    .classList.add('dots__dot--active');
}

dotsContainer.addEventListener('click', function (e) {
  if (!e.target.classList.contains('dots__dot')) return;

  currentSlide = Number(e.target.dataset.slide);
  transformSlides(currentSlide);

  activateDots(currentSlide);
});
