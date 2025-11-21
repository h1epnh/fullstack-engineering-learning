// ===================================
// Navigation Scroll Effect
// ===================================
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ===================================
// Mobile Menu Toggle
// ===================================
hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close menu when clicking on a link
navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// ===================================
// Smooth Scroll for Navigation Links
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ===================================
// Scroll to Top Button
// ===================================
const scrollTopBtn = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ===================================
// Reviews Slider
// ===================================
const reviewsSlider = document.querySelector('.reviews-slider');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let currentSlide = 0;
const slideWidth = 300; // Approximate width of one card + gap

if (prevBtn && nextBtn && reviewsSlider) {
    prevBtn.addEventListener('click', () => {
        currentSlide = Math.max(currentSlide - 1, 0);
        updateSlider();
    });

    nextBtn.addEventListener('click', () => {
        const maxSlide = reviewsSlider.children.length - 1;
        currentSlide = Math.min(currentSlide + 1, maxSlide);
        updateSlider();
    });

    function updateSlider() {
        const offset = currentSlide * slideWidth;
        reviewsSlider.style.transform = `translateX(-${offset}px)`;
    }
}

// Auto-slide reviews every 5 seconds
let autoSlideInterval = setInterval(() => {
    if (reviewsSlider) {
        const maxSlide = reviewsSlider.children.length - 1;
        currentSlide = (currentSlide + 1) % (maxSlide + 1);
        updateSlider();
    }
}, 5000);

// Pause auto-slide on hover
if (reviewsSlider) {
    reviewsSlider.addEventListener('mouseenter', () => {
        clearInterval(autoSlideInterval);
    });

    reviewsSlider.addEventListener('mouseleave', () => {
        autoSlideInterval = setInterval(() => {
            const maxSlide = reviewsSlider.children.length - 1;
            currentSlide = (currentSlide + 1) % (maxSlide + 1);
            updateSlider();
        }, 5000);
    });
}

// ===================================
// Booking Form Submission
// ===================================
const bookingForm = document.getElementById('bookingForm');

if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            service: document.getElementById('service').value,
            datetime: document.getElementById('datetime').value,
            note: document.getElementById('note').value
        };
        
        // Here you would typically send this data to a server
        // For now, we'll just show a success message
        alert(`Cảm ơn ${formData.name}!\n\nYêu cầu đặt lịch của bạn đã được gửi thành công.\nChúng tôi sẽ liên hệ với bạn qua số ${formData.phone} để xác nhận.\n\nDịch vụ: ${getServiceName(formData.service)}\nThời gian: ${formatDateTime(formData.datetime)}`);
        
        // Reset form
        bookingForm.reset();
    });
}

// Helper function to get service name
function getServiceName(value) {
    const services = {
        'hair': 'Làm Tóc',
        'nail': 'Làm Nail',
        'spa': 'Gội Đầu Massage',
        'combo-hair-nail-tay': 'Combo Hair + Nail Tay',
        'combo-hair-nail-full': 'Combo Hair + Nail Tay + Chân',
        'combo-vip': 'Combo VIP (Full Service)'
    };
    return services[value] || value;
}

// Helper function to format datetime
function formatDateTime(datetime) {
    const date = new Date(datetime);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    return date.toLocaleDateString('vi-VN', options);
}

// ===================================
// Scroll Animations
// ===================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
});

// ===================================
// Gallery Lightbox (Simple Implementation)
// ===================================
const galleryItems = document.querySelectorAll('.gallery-item');

galleryItems.forEach(item => {
    item.addEventListener('click', () => {
        const img = item.querySelector('img');
        const overlay = item.querySelector('.gallery-overlay');
        
        // Create lightbox
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <span class="lightbox-close">&times;</span>
                <img src="${img.src}" alt="${img.alt}">
                <div class="lightbox-caption">
                    <h4>${overlay.querySelector('h4').textContent}</h4>
                    <p>${overlay.querySelector('p').textContent}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(lightbox);
        document.body.style.overflow = 'hidden';
        
        // Close lightbox
        const closeBtn = lightbox.querySelector('.lightbox-close');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(lightbox);
            document.body.style.overflow = 'auto';
        });
        
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                document.body.removeChild(lightbox);
                document.body.style.overflow = 'auto';
            }
        });
    });
});

// Add lightbox styles dynamically
const lightboxStyles = document.createElement('style');
lightboxStyles.textContent = `
    .lightbox {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    }
    
    .lightbox-content {
        position: relative;
        max-width: 90%;
        max-height: 90%;
        animation: scaleIn 0.3s ease;
    }
    
    .lightbox-content img {
        max-width: 100%;
        max-height: 80vh;
        border-radius: 10px;
        box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
    }
    
    .lightbox-close {
        position: absolute;
        top: -40px;
        right: 0;
        font-size: 3rem;
        color: var(--gold);
        cursor: pointer;
        transition: 0.3s ease;
    }
    
    .lightbox-close:hover {
        color: var(--gold-light);
        transform: rotate(90deg);
    }
    
    .lightbox-caption {
        text-align: center;
        margin-top: 1rem;
        color: var(--white);
    }
    
    .lightbox-caption h4 {
        color: var(--gold);
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes scaleIn {
        from { transform: scale(0.8); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }
`;
document.head.appendChild(lightboxStyles);

// ===================================
// Set minimum datetime for booking
// ===================================
const datetimeInput = document.getElementById('datetime');
if (datetimeInput) {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    datetimeInput.min = now.toISOString().slice(0, 16);
}

// ===================================
// Phone number formatting
// ===================================
const phoneInput = document.getElementById('phone');
if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 10) {
            value = value.slice(0, 10);
        }
        e.target.value = value;
    });
}

// ===================================
// Active Navigation Link Highlighting
// ===================================
const sections = document.querySelectorAll('section[id]');

function highlightNavigation() {
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelector(`.nav-menu a[href="#${sectionId}"]`)?.classList.add('active');
        } else {
            document.querySelector(`.nav-menu a[href="#${sectionId}"]`)?.classList.remove('active');
        }
    });
}

window.addEventListener('scroll', highlightNavigation);

// Add active link style
const navLinkActiveStyle = document.createElement('style');
navLinkActiveStyle.textContent = `
    .nav-menu a.active {
        color: var(--gold);
    }
    
    .nav-menu a.active::after {
        width: 100%;
    }
`;
document.head.appendChild(navLinkActiveStyle);

// ===================================
// Console Welcome Message
// ===================================
console.log('%c🎨 Nhơn Hair & Lý Nail 💅', 'font-size: 24px; font-weight: bold; color: #d4af37;');
console.log('%cSalon Tóc & Nail Chuyên Nghiệp', 'font-size: 14px; color: #999;');
console.log('%c📞 Hotline: 0123 456 789', 'font-size: 12px; color: #d4af37;');
