// Mobile Navigation Toggle
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 70; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = '#fff';
        navbar.style.backdropFilter = 'none';
    }
});

// Form submission handler
const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(this);
        const name = this.querySelector('input[type="text"]').value;
        const email = this.querySelector('input[type="email"]').value;
        const message = this.querySelector('textarea').value;

        // Simple validation
        if (!name || !email || !message) {
            alert('Please fill in all fields');
            return;
        }

        // Simulate form submission
        const submitBtn = this.querySelector('button');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        setTimeout(() => {
            alert('Thank you for your message! We\'ll get back to you soon.');
            this.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    });
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.product-card, .service-card, .contact-item');

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// WhatsApp icon click tracking (optional)
const whatsappLink = document.querySelector('.whatsapp-link');
if (whatsappLink) {
    whatsappLink.addEventListener('click', () => {
        // You can add analytics tracking here
        console.log('WhatsApp link clicked - Cannabis Madrid');
    });
}

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';

    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        const rate = scrolled * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Product card hover effects
document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('mouseenter', function () {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });

    card.addEventListener('mouseleave', function () {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Service card animations
document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', function () {
        const icon = this.querySelector('i');
        icon.style.transform = 'scale(1.2) rotate(5deg)';
        icon.style.color = '#1d4ed8';
    });

    card.addEventListener('mouseleave', function () {
        const icon = this.querySelector('i');
        icon.style.transform = 'scale(1) rotate(0deg)';
        icon.style.color = '#2563eb';
    });
});

// Stats counter animation
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);

    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start) + '+';
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + '+';
        }
    }

    updateCounter();
}

// Trigger counter animation when stats section is visible
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counters = entry.target.querySelectorAll('.stat h3');
            counters.forEach(counter => {
                const target = parseInt(counter.textContent);
                animateCounter(counter, target);
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stats');
if (statsSection) {
    statsObserver.observe(statsSection);
}



// Age Verification Modal
(function () {
    const ageModal = document.getElementById('ageVerificationModal');
    const ageConfirm = document.getElementById('ageConfirm');
    const ageDeny = document.getElementById('ageDeny');

    // Check if user has already verified age
    const ageVerified = sessionStorage.getItem('ageVerified');

    if (!ageVerified) {
        // Show modal immediately
        if (ageModal) {
            ageModal.classList.remove('hidden');
            // Don't prevent scrolling - let site be visible behind
        }
    }

    // Handle age confirmation
    if (ageConfirm) {
        ageConfirm.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            sessionStorage.setItem('ageVerified', 'true');
            if (ageModal) {
                ageModal.classList.add('hidden');
            }
            // Show cookie banner after age verification
            setTimeout(() => {
                checkAndShowCookieBanner();
            }, 500);
        });
    }

    // Handle age denial
    if (ageDeny) {
        ageDeny.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            alert('You must be 18 or older to access this website.');
            window.location.href = 'https://www.google.com'; // Redirect away
        });
    }
})();

// Cookie Consent Management
(function () {
    const cookieBanner = document.getElementById('cookieBanner');
    const cookieSettingsModal = document.getElementById('cookieSettingsModal');
    const cookieAccept = document.getElementById('cookieAccept');
    const cookieReject = document.getElementById('cookieReject');
    const cookieSettings = document.getElementById('cookieSettings');
    const closeCookieSettings = document.getElementById('closeCookieSettings');
    const saveCookieSettings = document.getElementById('saveCookieSettings');

    // Cookie preference keys
    const COOKIE_CONSENT_KEY = 'cookieConsent';
    const COOKIE_PREFERENCES_KEY = 'cookiePreferences';

    // Check if user has already made a choice
    function hasCookieConsent() {
        return localStorage.getItem(COOKIE_CONSENT_KEY) !== null;
    }

    // Get cookie preferences
    function getCookiePreferences() {
        const saved = localStorage.getItem(COOKIE_PREFERENCES_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            essential: true, // Always true, cannot be disabled
            analytics: false,
            marketing: false
        };
    }

    // Save cookie preferences
    function saveCookiePreferences(prefs) {
        localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
        localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    }

    // Show cookie banner
    function showCookieBanner() {
        if (cookieBanner && !hasCookieConsent()) {
            setTimeout(() => {
                cookieBanner.classList.add('show');
            }, 100);
        }
    }

    // Hide cookie banner
    function hideCookieBanner() {
        if (cookieBanner) {
            cookieBanner.classList.remove('show');
        }
    }

    // Check and show cookie banner (only if age is verified)
    function checkAndShowCookieBanner() {
        const ageVerified = sessionStorage.getItem('ageVerified');
        if (ageVerified && !hasCookieConsent()) {
            showCookieBanner();
        }
    }

    // Accept all cookies
    if (cookieAccept) {
        cookieAccept.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const prefs = {
                essential: true,
                analytics: true,
                marketing: true
            };
            saveCookiePreferences(prefs);
            hideCookieBanner();
            initializeCookies(prefs);
        });
    }

    // Reject all cookies (except essential)
    if (cookieReject) {
        cookieReject.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const prefs = {
                essential: true,
                analytics: false,
                marketing: false
            };
            saveCookiePreferences(prefs);
            hideCookieBanner();
            initializeCookies(prefs);
        });
    }

    // Open cookie settings
    if (cookieSettings) {
        cookieSettings.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (cookieSettingsModal) {
                cookieSettingsModal.classList.add('show');
                // Load current preferences
                const prefs = getCookiePreferences();
                document.getElementById('analyticsCookies').checked = prefs.analytics;
                document.getElementById('marketingCookies').checked = prefs.marketing;
            }
        });
    }

    // Close cookie settings
    if (closeCookieSettings) {
        closeCookieSettings.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (cookieSettingsModal) {
                cookieSettingsModal.classList.remove('show');
            }
        });
    }

    // Save cookie settings
    if (saveCookieSettings) {
        saveCookieSettings.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const prefs = {
                essential: true,
                analytics: document.getElementById('analyticsCookies').checked,
                marketing: document.getElementById('marketingCookies').checked
            };
            saveCookiePreferences(prefs);
            hideCookieBanner();
            if (cookieSettingsModal) {
                cookieSettingsModal.classList.remove('show');
            }
            initializeCookies(prefs);
        });
    }

    // Initialize cookies based on preferences
    function initializeCookies(prefs) {
        // Essential cookies are always enabled
        console.log('Essential cookies: Enabled');

        if (prefs.analytics) {
            console.log('Analytics cookies: Enabled');
            // Initialize analytics here (e.g., Google Analytics)
            // Example: gtag('consent', 'update', { 'analytics_storage': 'granted' });
        } else {
            console.log('Analytics cookies: Disabled');
        }

        if (prefs.marketing) {
            console.log('Marketing cookies: Enabled');
            // Initialize marketing cookies here
            // Example: gtag('consent', 'update', { 'ad_storage': 'granted' });
        } else {
            console.log('Marketing cookies: Disabled');
        }
    }

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', () => {
        // Check if age is already verified
        const ageVerified = sessionStorage.getItem('ageVerified');
        if (ageVerified) {
            checkAndShowCookieBanner();
        }

        // Load existing preferences and initialize cookies
        if (hasCookieConsent()) {
            const prefs = getCookiePreferences();
            initializeCookies(prefs);
        }
    });

    // Close cookie settings when clicking outside
    if (cookieSettingsModal) {
        cookieSettingsModal.addEventListener('click', (e) => {
            if (e.target === cookieSettingsModal) {
                cookieSettingsModal.classList.remove('show');
            }
        });
    }
})();
