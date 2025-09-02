document.addEventListener('DOMContentLoaded', () => {

    // --- Global DOM Elements ---
    const menuToggle = document.getElementById('menuToggle');
    const mainNav = document.getElementById('mainNav');
    const navLinks = document.querySelectorAll('.main-nav .nav-link');
    const goToTopBtn = document.getElementById('goToTopBtn');

    // --- Chat Box Elements ---
    const chatBox = document.querySelector('.chat-container');
    const chatHeader = document.querySelector('.chat-header');
    const chatMessages = document.getElementById('chatMessages');
    const chatForm = document.getElementById('chatForm');
    const userInput = document.getElementById('userInput');
    const quickQuestionButtons = document.querySelectorAll('.quick-buttons button');


    // --- 1. Mobile Navigation Toggle ---
    if (menuToggle && mainNav) {
        // Initial accessibility state for menu toggle
        menuToggle.setAttribute('aria-expanded', 'false');

        menuToggle.addEventListener('click', () => {
            const isNavOpen = mainNav.classList.toggle('active'); // Toggle class and store state
            const icon = menuToggle.querySelector('i');

            if (isNavOpen) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
                document.body.style.overflow = 'hidden'; // Prevent scrolling when nav is open
                menuToggle.setAttribute('aria-expanded', 'true'); // Accessibility
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
                document.body.style.overflow = ''; // Restore scrolling
                menuToggle.setAttribute('aria-expanded', 'false'); // Accessibility
            }
        });

        // Close nav when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    const icon = menuToggle.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                    document.body.style.overflow = '';
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    // --- 2. Active Navigation Link Highlight ---
    const highlightNavLink = () => {
        let currentPath = window.location.pathname.split('/').pop();
        if (currentPath === '' || currentPath === '/') {
            currentPath = 'index.html';
        }

        navLinks.forEach(link => {
            const linkFileName = link.getAttribute('href').split('/').pop();

            if (currentPath === linkFileName) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    };
    highlightNavLink(); // Run on page load


    // --- 3. Hero Slider Functionality (REMOVED - Replaced by Three.js in three-scene.js) ---
    // The visual dynamic elements for the hero section are now handled by three-scene.js


    // --- 4. Go to Top Button ---
    if (goToTopBtn) {
        const toggleGoToTopButton = () => {
            if (window.scrollY > 300) { // Show button after scrolling 300px
                goToTopBtn.classList.add('show');
            } else {
                goToTopBtn.classList.remove('show');
            }
        };

        window.addEventListener('scroll', toggleGoToTopButton);
        toggleGoToTopButton(); // Call once on load to set initial state
        
        goToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // --- 5. Scroll-Based Fade-In Animations (Intersection Observer) ---
    const faders = document.querySelectorAll('.fade-in-up');

    const appearOptions = {
        threshold: 0.1, // Element is 10% visible
        rootMargin: "0px 0px -50px 0px" // Start animating 50px before it hits bottom of viewport
    };

    if ('IntersectionObserver' in window) {
        const appearOnScroll = new IntersectionObserver(function(entries, observer) {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    return;
                } else {
                    entry.target.classList.add('appear');
                    observer.unobserve(entry.target); // Stop observing once it has appeared
                }
            });
        }, appearOptions);

        faders.forEach(fader => {
            appearOnScroll.observe(fader);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        faders.forEach(fader => {
            fader.classList.add('appear');
        });
    }


    // --- 6. Live Chat Box Functionality ---
    if (chatBox && chatHeader && chatForm && chatMessages && userInput) {
        chatHeader.setAttribute('aria-expanded', 'false'); // Initial accessibility state

        chatHeader.addEventListener('click', () => {
            const isActive = chatBox.classList.toggle('active');
            chatHeader.setAttribute('aria-expanded', isActive ? 'true' : 'false');
            if (isActive) {
                chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to bottom when opening
            }
        });

        const responses = {
            "services": "We offer two-wheelers, tempos, and mini trucks for local deliveries across multiple cities. We also handle cargo, passenger transport, warehousing, and international logistics. Visit our Services page for more details!",
            "company": "We are Vishal Transport 🚛 — your trusted partner for safe, fast, and affordable local transportation services since 2020. Our mission is to simplify logistics with reliable, tech-enabled solutions.",
            "contact": "You can reach us at 📞 +91 98765 43210 (Phone support available 24/7) or ✉️ support@vishaltransport.in. Our office is in Mumbai, India.",
            "booking": "Booking is simple! Just visit our Booking page and fill out your details. It's designed for instant confirmation. For special requests, feel free to contact our support team directly.",
            "default": "Sorry, I didn’t get that. I can answer questions about our services, company, contact details, or how to book. Could you please rephrase?"
        };

        function getBotReply(message) {
            const msg = message.toLowerCase();
            if (msg.includes("service")) return responses.services;
            if (msg.includes("who") || msg.includes("about") || msg.includes("company")) return responses.company;
            if (msg.includes("contact") || msg.includes("reach")) return responses.contact;
            if (msg.includes("book") || msg.includes("vehicle") || msg.includes("quote")) return responses.booking;
            return responses.default;
        }

        // Optional: Add a user toggle for speech synthesis or make it default off
        function speak(text) {
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'en-IN'; // You can change language code here
                speechSynthesis.speak(utterance);
            } else {
                console.warn("Speech synthesis not supported in this browser.");
            }
        }

        function appendMessage(sender, message) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `${sender}-message`;
            messageDiv.textContent = message;
            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to latest message
        }

        // Handle quick question buttons
        quickQuestionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const question = button.dataset.question;
                userInput.value = question; // Populate input
                chatForm.dispatchEvent(new Event('submit', { cancelable: true })); // Programmatically submit
            });
        });

        // Handle chat form submission
        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const userMsg = userInput.value.trim();
            if (!userMsg) return;

            appendMessage('user', userMsg);
            userInput.value = ""; // Clear input

            // Simulate bot typing/thinking delay
            setTimeout(() => {
                const reply = getBotReply(userMsg);
                appendMessage('bot', reply);
                // speak(reply); // Re-enable if speech synthesis is desired
            }, 600);
        });
    }

    // --- 7. FAQ Accordion Functionality ---
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    if (accordionHeaders.length > 0) {
        accordionHeaders.forEach(header => {
            const content = header.nextElementSibling;
            
            // Set initial ARIA attributes for accessibility
            header.setAttribute('aria-expanded', 'false');
            header.setAttribute('aria-controls', content.id);

            header.addEventListener('click', () => {
                const isActive = header.classList.contains('active');
                
                // Close other open accordion items if they exist and are not the current one
                const currentlyActiveHeader = document.querySelector('.accordion-header.active');
                if (currentlyActiveHeader && currentlyActiveHeader !== header) {
                    currentlyActiveHeader.classList.remove('active');
                    currentlyActiveHeader.setAttribute('aria-expanded', 'false');
                    const currentlyActiveContent = currentlyActiveHeader.nextElementSibling;
                    if (currentlyActiveContent) {
                        currentlyActiveContent.classList.remove('active');
                    }
                }

                // Toggle the clicked item
                header.classList.toggle('active');
                content.classList.toggle('active');

                // Update ARIA attribute based on new state
                header.setAttribute('aria-expanded', !isActive ? 'true' : 'false');
            });
        });
    }


    // --- 8. Form Submission Handlers (Booking & Contact) ---
    // Moved here from the previous general debug as they are crucial for backend
    const bookingForm = document.querySelector('.booking-form');
    const contactForm = document.querySelector('.contact-form');

    const showFormMessage = (targetElement, message, type) => {
        targetElement.textContent = message;
        targetElement.className = `form-message ${type}`; // Add type class (success/error)
        targetElement.style.display = 'block'; // Make visible
        setTimeout(() => {
            targetElement.style.display = 'none'; // Hide after a few seconds
            targetElement.textContent = '';
            targetElement.className = 'form-message'; // Reset classes
        }, 5000); // Message disappears after 5 seconds
    };

    // Handle Booking Form Submission
    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent default form submission

            const formData = new FormData(bookingForm); // Get form data
            const data = Object.fromEntries(formData.entries()); // Convert to plain object

            const bookingMessageDiv = document.getElementById('bookingMessage');
            showFormMessage(bookingMessageDiv, 'Sending request...', 'info'); // Provide immediate feedback

            try {
                // IMPORTANT: Replace 'http://localhost:5000' with your actual backend URL in production
                const response = await fetch('https://vishal-transport.onrender.com/api/booking', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                const result = await response.json();

                if (response.ok) {
                    showFormMessage(bookingMessageDiv, result.message, 'success');
                    bookingForm.reset(); // Clear form on success
                } else {
                    showFormMessage(bookingMessageDiv, result.message || 'An unexpected error occurred.', 'error');
                }
            } catch (error) {
                console.error('Error submitting booking form:', error);
                showFormMessage(bookingMessageDiv, 'Network error. Please try again later.', 'error');
            }
        });
    }

    // Handle Contact Form Submission
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent default form submission

            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            // Get the form-message div associated with this form
            // Assuming it's a direct child or easily selectable within the form
            const contactMessageDiv = contactForm.querySelector('.form-message');
            showFormMessage(contactMessageDiv, 'Sending message...', 'info'); // Provide immediate feedback


            try {
                // IMPORTANT: Replace 'http://localhost:5000' with your actual backend URL in production
                const response = await fetch('https://vishal-transport.onrender.com/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                const result = await response.json();

                if (response.ok) {
                    showFormMessage(contactMessageDiv, result.message, 'success');
                    contactForm.reset(); // Clear form on success
                } else {
                    showFormMessage(contactMessageDiv, result.message || 'An unexpected error occurred.', 'error');
                }
            } catch (error) {
                console.error('Error submitting contact form:', error);
                showFormMessage(contactMessageDiv, 'Network error. Please try again later.', 'error');
            }
        });
    }
});
