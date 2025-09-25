// ========================================
// CORE FUNCTIONALITY
// ========================================


// Header scroll effect
const navShell = document.getElementById('nav-shell');
const updateHeader = () => {
    if (navShell) {
        navShell.classList.toggle('nav-solid', window.scrollY > 10);
    }
};
window.addEventListener('scroll', updateHeader, { passive: true });

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ========================================
// MOBILE NAVIGATION
// ========================================

const hamburger = document.getElementById('hamburger');
const drawer = document.getElementById('mobile-drawer');
const overlay = document.getElementById('drawer-overlay');

const setDrawer = (open) => {
	if (!drawer || !overlay || !hamburger) return;
	drawer.classList.toggle('drawer-open', open);
	overlay.classList.toggle('hidden', !open);
	hamburger.setAttribute('aria-expanded', String(open));
    
    const iconOpen = document.getElementById('icon-open');
    const iconClose = document.getElementById('icon-close');
	if (iconOpen && iconClose) {
		iconOpen.classList.toggle('hidden', open);
		iconClose.classList.toggle('hidden', !open);
	}
};

hamburger?.addEventListener('click', () => {
    const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
    setDrawer(!isOpen);
});

overlay?.addEventListener('click', () => setDrawer(false));
document.getElementById('drawer-close')?.addEventListener('click', () => setDrawer(false));
drawer?.querySelectorAll('a')?.forEach(a => a.addEventListener('click', () => setDrawer(false)));

// ========================================
// FORM HANDLING & API INTEGRATION
// ========================================

// UTM Parameter tracking
const getUTMParameters = () => {
    const params = new URLSearchParams(window.location.search);
    return {
        utm_campaign: params.get('utm_campaign') || '',
        utm_source: params.get('utm_source') || 'google-ads',
        utm_medium: params.get('utm_medium') || 'none',
        utm_keywords: params.get('utm_term') || params.get('utm_keywords') || ''
    };
};

// Populate UTM fields
const populateUTMFields = () => {
    const utmParams = getUTMParameters();
    const fields = ['utm-campaign', 'utm-source', 'utm-medium', 'utm-keywords'];
    
    ['contact', 'enquire'].forEach(formType => {
        fields.forEach(field => {
            const element = document.getElementById(`${formType}-${field}`);
            if (element) {
                const utmKey = field.replace('-', '_');
                element.value = utmParams[utmKey] || '';
            }
        });
    });
};

// Submit to LeadSquared API
const submitToLeadSquared = async (formData, formName) => {
    const utmParams = getUTMParameters();
    const apiUrl = 'https://api-in21.leadsquared.com/v2/LeadManagement.svc/Lead.Capture?accessKey=u$rb0506e99896ba7ac496877fb56ea6d33&secretKey=0143ea02856f5d3eaad9bf3bcc032043ea3415c4';
    
    const payload = [
        { Attribute: 'FirstName', Value: formData.name },
        { Attribute: 'EmailAddress', Value: formData.email },
        { Attribute: 'Phone', Value: formData.phone },
        { Attribute: 'SearchBy', Value: 'EmailAddress' },
        { Attribute: 'mx_UTM_Campaign', Value: utmParams.utm_campaign },
        { Attribute: 'Source', Value: utmParams.utm_source },
        { Attribute: 'SourceMedium', Value: utmParams.utm_medium },
        { Attribute: 'mx_utm_keywords', Value: utmParams.utm_keywords },
        { Attribute: 'mx_Projects', Value: 'Ark Kushak' },
        { Attribute: 'Source', Value: formName },
        { Attribute: 'mx_Facing_Direction', Value: formData.facing }
    ];

    try {
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload),
            mode: 'cors'
        });

        
        const responseText = await response.text();

        if (response.ok) {
            return { success: true };
        } else {
            return { 
                success: false, 
                error: `API Error: ${response.status} - ${responseText}`,
                status: response.status
            };
        }
    } catch (error) {
        console.error('LeadSquared API Error:', error);
        return { 
            success: false, 
            error: error.message,
            type: error.name
        };
    }
};

// Form validation helper
const validateForm = (name, email, phone, facing) => {
    return name && /.+@.+\..+/.test(email) && phone && facing;
};

// reCAPTCHA Enterprise implementation
const SITE_KEY = '6LekfNQrAAAAANygXOBic8qfuKG3-fK-BspMWc0b';

// Execute reCAPTCHA Enterprise
// Call this whenever you need a token (e.g. before form submit)
const executeRecaptcha = async (action = 'contact_form') => {
    try {
    
      
      if (typeof grecaptcha === 'undefined') {
        console.error('reCAPTCHA not loaded - script may have failed to load');
        return null;
      }
      
      if (!grecaptcha.enterprise) {
        console.error('reCAPTCHA Enterprise not available - check if using correct script');
        return null;
      }
  
      
  
      // Wait for reCAPTCHA to be ready
      await new Promise((resolve) => {
        if (grecaptcha.enterprise.ready) {
          grecaptcha.enterprise.ready(resolve);
        } else {
          resolve();
        }
      });
  
      // Correct: call Google's API directly
      const token = await grecaptcha.enterprise.execute(SITE_KEY, { action });
  
      
      return token;
    } catch (error) {
      console.error('reCAPTCHA Enterprise error:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      return null;
    }
  };

// Contact form handler

const contactForm = document.getElementById('contact-form');
const contactMsg = document.getElementById('contact-message');

    

if (contactForm && contactMsg) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const name = String(formData.get('name') || '').trim();
        const email = String(formData.get('email') || '').trim();
        const phone = String(formData.get('phone') || '').trim();
        const facing = String(formData.get('facing') || '').trim();

        // Validation
        if (!validateForm(name, email, phone, facing)) {
            contactMsg.textContent = 'Please fill all fields correctly.';
            contactMsg.className = 'text-red-600';
            return;
        }

        // Submit
        contactMsg.textContent = 'Submitting form, please wait...';
        contactMsg.className = 'text-blue-600';
        
        // Execute reCAPTCHA Enterprise
        const recaptchaToken = await executeRecaptcha('contact_form');

        if (!recaptchaToken) {
          contactMsg.textContent = 'Security verification failed. Please refresh the page and try again.';
          contactMsg.className = 'text-red-600';
          return;
        }
        
        const result = await submitToLeadSquared({ name, email, phone, facing }, 'contact-form');

        if (result.success) {
            localStorage.setItem('arkKushakFormSubmitted', 'true');
            localStorage.setItem('arkKushakFormData', JSON.stringify({
                name, email, phone, facing, source: 'contact-form'
            }));
            
            window.location.href = 'thankyou.html';
        } else {
            
            // Show detailed error message
            const errorMsg = result.error ? `Error: ${result.error}` : 'Error submitting form. Please try again.';
            contactMsg.textContent = errorMsg;
            contactMsg.className = 'text-red-600';
            
            // Log detailed error for debugging
            console.error('Contact form submission failed:', result);
        }
    });
}

// Enquire form handler
const enquireForm = document.getElementById('enquire-form');
const enquireMsg = document.getElementById('enquire-message');



if (enquireForm && enquireMsg) {
    enquireForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(enquireForm);
        const name = String(formData.get('name') || '').trim();
        const email = String(formData.get('email') || '').trim();
        const phone = String(formData.get('phone') || '').trim();
        const facing = String(formData.get('facing') || '').trim();

        // Validation
        if (!validateForm(name, email, phone, facing)) {
            enquireMsg.textContent = 'Please fill all fields correctly.';
            enquireMsg.className = 'text-red-600';
            return;
        }

        // Submit
        enquireMsg.textContent = 'Submitting form, please wait...';
        enquireMsg.className = 'text-blue-600';
        
        // Execute reCAPTCHA Enterprise
        const recaptchaToken = await executeRecaptcha('enquire_form');
        if (!recaptchaToken) {
            enquireMsg.textContent = 'Security verification failed. Please refresh the page and try again.';
            enquireMsg.className = 'text-red-600';
            return;
        }
        
        const result = await submitToLeadSquared({ name, email, phone, facing }, 'enquire-form');

        if (result.success) {
            
            localStorage.setItem('arkKushakFormSubmitted', 'true');
            localStorage.setItem('arkKushakFormData', JSON.stringify({
                name, email, phone, facing, source: 'enquire-form'
            }));
            
            window.location.href = 'thankyou.html';
        } else {
            
            // Show detailed error message
            const errorMsg = result.error ? `Error: ${result.error}` : 'Error submitting form. Please try again.';
            enquireMsg.textContent = errorMsg;
            enquireMsg.className = 'text-red-600';
            
            // Log detailed error for debugging
            console.error('Enquire form submission failed:', result);
        }
    });
}

// ========================================
// UI COMPONENTS
// ========================================

// Location tabs
const tabButtons = [
	{ btn: document.getElementById('tab-transport-btn'), panel: document.getElementById('tab-transport') },
	{ btn: document.getElementById('tab-schools-btn'), panel: document.getElementById('tab-schools') },
	{ btn: document.getElementById('tab-hospitals-btn'), panel: document.getElementById('tab-hospitals') },
    { btn: document.getElementById('tab-shopping-btn'), panel: document.getElementById('tab-shopping') }
].filter(x => x.btn && x.panel);

const activateTab = (idx) => {
	tabButtons.forEach((t, i) => {
		const isActive = i === idx;
		t.btn.setAttribute('aria-selected', String(isActive));
		t.btn.classList.toggle('location-tab-active', isActive);
		t.panel.classList.toggle('hidden', !isActive);
	});
};

tabButtons.forEach((t, i) => t.btn.addEventListener('click', () => activateTab(i)));
if (tabButtons.length > 0) activateTab(0);

// Layout lightbox
const layoutThumbs = Array.from(document.querySelectorAll('[data-layout-item]'));
const lightbox = document.getElementById('layout-lightbox');
const lightboxImg = document.getElementById('layout-image');
const lightboxCaption = document.getElementById('layout-caption');

const layoutSources = [
	{ src: 'assets/Ark_Kushak_1st_floor.webp', label: 'Ground Floor' },
	{ src: 'assets/Ark_Kushak_2nd_floor.webp', label: 'First Floor' },
	{ src: 'assets/Ark_Kushak_3rd_floor.webp', label: 'Second Floor' },
    { src: 'assets/Ark_Kushak_site_layout.webp', label: 'Site Layout' }
];

let layoutIndex = 0;

const showLayout = (idx) => {
	layoutIndex = (idx + layoutSources.length) % layoutSources.length;
	const { src, label } = layoutSources[layoutIndex];
	if (lightboxImg) lightboxImg.src = src;
	if (lightboxCaption) lightboxCaption.textContent = label;
};

const openLightbox = (idx) => {
	if (!lightbox) return;
	showLayout(idx);
	lightbox.classList.remove('hidden');
	lightbox.classList.add('flex');
};

const closeLightbox = () => {
	if (!lightbox) return;
	lightbox.classList.add('hidden');
	lightbox.classList.remove('flex');
};

layoutThumbs.forEach(el => {
	el.addEventListener('click', () => {
        const idx = Number(el.getAttribute('data-index')) || 0;
        openLightbox(idx);
	});
});

document.getElementById('layout-prev')?.addEventListener('click', () => showLayout(layoutIndex - 1));
document.getElementById('layout-next')?.addEventListener('click', () => showLayout(layoutIndex + 1));
document.getElementById('layout-close')?.addEventListener('click', closeLightbox);

lightbox?.addEventListener('click', (e) => {
	if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
	if (lightbox?.classList.contains('hidden')) return;
	if (e.key === 'Escape') closeLightbox();
	if (e.key === 'ArrowLeft') showLayout(layoutIndex - 1);
	if (e.key === 'ArrowRight') showLayout(layoutIndex + 1);
});

// Video modal
const arkOpen = document.getElementById('ark-video-open');
const arkModal = document.getElementById('ark-video-modal');
const arkClose = document.getElementById('ark-video-close');

const openArkVideo = () => {
    if (arkModal) {
    arkModal.classList.remove('hidden');
    arkModal.classList.add('flex');
    }
};

const closeArkVideo = () => {
    if (arkModal) {
    arkModal.classList.add('hidden');
    arkModal.classList.remove('flex');
    }
};

arkOpen?.addEventListener('click', openArkVideo);
arkClose?.addEventListener('click', closeArkVideo);
arkModal?.addEventListener('click', (e) => {
    if (e.target === arkModal) closeArkVideo();
});

document.addEventListener('keydown', (e) => {
    if (!arkModal || arkModal.classList.contains('hidden')) return;
    if (e.key === 'Escape') closeArkVideo();
});

// ========================================
// ENQUIRE SIDEBAR
// ========================================

const enquireToggle = document.getElementById('enquire-toggle');
const enquirePanel = document.getElementById('enquire-panel');
const enquireClose = document.getElementById('enquire-close');

const setEnquireOpen = (open) => {
    if (!enquirePanel || !enquireToggle) return;
    enquirePanel.classList.toggle('enquire-open', open);
    enquireToggle.setAttribute('aria-expanded', String(open));
    const labelEl = enquireToggle.querySelector('span');
    if (labelEl) labelEl.textContent = open ? 'Close' : 'Enquire Now';
};

// Show enquire button after scrolling
const updateEnquireButton = () => {
    if (enquireToggle) {
        enquireToggle.classList.toggle('hidden', window.scrollY <= 300);
    }
};

window.addEventListener('scroll', updateEnquireButton, { passive: true });

// Auto-open after 5 seconds if no form submitted
setTimeout(() => {
    const formSubmitted = localStorage.getItem('arkKushakFormSubmitted');
    if (enquirePanel && enquireToggle && formSubmitted !== 'true') {
        enquireToggle.classList.remove('hidden');
        setEnquireOpen(true);
    }
}, 5000);

enquireToggle?.addEventListener('click', () => {
    const isOpen = enquirePanel?.classList.contains('enquire-open');
    setEnquireOpen(!isOpen);
});

enquireClose?.addEventListener('click', () => setEnquireOpen(false));

// ========================================
// BROCHURE DOWNLOAD
// ========================================

const downloadBrochure = (event) => {
    event.preventDefault();
    
    const formSubmitted = localStorage.getItem('arkKushakFormSubmitted');
    
    if (formSubmitted === 'true') {
        const link = document.createElement('a');
        link.href = 'assets/Ark_Kushak_Brochure.pdf';
        link.download = 'Ark_Kushak_Brochure.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showMessage('Brochure downloaded successfully!', 'success');
    } else {
        showMessage('Please fill out the form to download the brochure', 'info');
        if (enquirePanel && enquireToggle) {
            enquireToggle.classList.remove('hidden');
            setEnquireOpen(true);
        }
    }
};

const showMessage = (message, type) => {
    let messageEl = document.getElementById('brochure-message');
    if (!messageEl) {
        messageEl = document.createElement('div');
        messageEl.id = 'brochure-message';
        document.body.appendChild(messageEl);
    }
    
    messageEl.textContent = message;
    messageEl.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white max-w-sm ${
        type === 'success' ? 'bg-green-500' : 'bg-blue-500'
    }`;
    
    setTimeout(() => messageEl?.remove(), 3000);
};

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Setup brochure download buttons
    document.querySelectorAll('a[href="#brochure"]').forEach(button => {
        button.addEventListener('click', downloadBrochure);
    });
    
    // Populate UTM fields
    populateUTMFields();
    
    // Setup animations
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            observer.unobserve(entry.target);
        }
    });
    }, { threshold: 0.1, rootMargin: '50px' });

    document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
});