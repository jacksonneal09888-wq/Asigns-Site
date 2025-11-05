document.addEventListener('DOMContentLoaded', () => {
    const cookieConsent = document.querySelector('.cookie-consent');
    const acceptCookiesBtn = document.querySelector('.accept-cookies');

    // Check if cookie consent has been given
    if (!localStorage.getItem('cookieConsent')) {
        cookieConsent.style.display = 'flex';
    }

    acceptCookiesBtn.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'true');
        cookieConsent.style.display = 'none';
    });

    // Header scroll effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Section scroll animations
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links li a'); // Select all nav links

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // observer.unobserve(entry.target); // Keep observing for repeated animations if desired
            } else {
                // Optional: remove 'visible' class when out of view
                // entry.target.classList.remove('visible');
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // Back to top button functionality
    const backToTopBtn = document.getElementById('backToTopBtn');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) { // Show button after scrolling 300px
            backToTopBtn.style.display = 'block';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Mobile navigation toggle
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const mobileNavLinks = document.querySelectorAll('.nav-links li'); // Renamed to avoid conflict

    burger.addEventListener('click', () => {
        // Toggle Nav
        nav.classList.toggle('nav-active');

    // Animate Links
    mobileNavLinks.forEach((link, index) => {
        if (link.style.animation) {
            link.style.animation = '';
        } else {
            link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
        }
    });

        // Burger Animation
        burger.classList.toggle('toggle');
    });

    // Close nav when a link is clicked (for smooth scrolling)
    mobileNavLinks.forEach(link => { // Use mobileNavLinks here
        link.addEventListener('click', (e) => {
            // Check if the clicked link is part of the dropdown toggle
            if (link.parentElement.classList.contains('dropdown')) { // Check parent for dropdown class
                e.preventDefault(); // Prevent immediate navigation
                const dropdownContent = link.querySelector('.dropdown-content'); // Get the dropdown content
                if (dropdownContent && dropdownContent.classList.contains('dropdown-content')) {
                    dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
                }
            } else {
                nav.classList.remove('nav-active');
                burger.classList.remove('toggle');
                document.querySelectorAll('.nav-links li').forEach(item => { // Select all li elements for animation reset
                    item.style.animation = ''; // Reset animation
                });
                // Close any open dropdowns when a non-dropdown link is clicked
                const openDropdowns = document.querySelectorAll('.dropdown-content');
                openDropdowns.forEach(dropdown => {
                    dropdown.style.display = 'none';
                });
            }
        });
    });

    // Close dropdowns when clicking outside
    window.addEventListener('click', (e) => {
        if (!e.target.matches('.dropdown a')) {
            const dropdowns = document.querySelectorAll('.dropdown-content');
            dropdowns.forEach(dropdown => {
                if (dropdown.style.display === 'block') {
                    dropdown.style.display = 'none';
                }
            });
        }
    });

    // Lightbox functionality
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const captionText = document.getElementById('caption');
    const closeBtn = document.querySelector('.close-btn');
    const galleryImages = document.querySelectorAll('.portfolio-section .gallery a');

    let slideIndex = 0;

    galleryImages.forEach((imgLink, index) => {
        imgLink.addEventListener('click', (e) => {
            e.preventDefault();
            lightbox.style.display = 'block';
            lightboxImg.src = imgLink.href;
            captionText.innerHTML = imgLink.dataset.title;
            slideIndex = index;
        });
    });

    closeBtn.addEventListener('click', () => {
        lightbox.style.display = 'none';
    });

    // Close lightbox when clicking outside the image
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.style.display = 'none';
        }
    });

    // Keyboard navigation for lightbox
    document.addEventListener('keydown', (e) => {
        if (lightbox.style.display === 'block') {
            if (e.key === 'ArrowLeft') {
                plusSlides(-1);
            } else if (e.key === 'ArrowRight') {
                plusSlides(1);
            } else if (e.key === 'Escape') {
                lightbox.style.display = 'none';
            }
        }
    });

    // Function to change slides
    window.plusSlides = (n) => {
        showSlides(slideIndex += n);
    };

    function showSlides(n) {
        const images = document.querySelectorAll('.portfolio-section .gallery a');
        if (n >= images.length) { slideIndex = 0; }
        if (n < 0) { slideIndex = images.length - 1; }
        lightboxImg.src = images[slideIndex].href;
        captionText.innerHTML = images[slideIndex].dataset.title;
    }

    // File upload display name
    const projectFileInput = document.getElementById('projectFile');
    const fileNameSpan = document.getElementById('fileName');

    if (projectFileInput) {
        projectFileInput.addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                fileNameSpan.textContent = this.files[0].name;
            } else {
                fileNameSpan.textContent = 'No file chosen';
            }
        });
    }
});
