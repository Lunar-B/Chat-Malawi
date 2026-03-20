// Device Detection and Analytics
class AppTracker {
    constructor() {
        this.deviceInfo = this.getDeviceInfo();
        this.analyticsEvents = [];
        this.downloadCount = 12847; // Starting download count for Super-App
        this.init();
    }

    init() {
        this.trackPageView();
        this.setupStickyDownloadBar();
        this.setupScrollTracking();
        this.initializeCounters();
        this.logDeviceInfo();
    }

    getDeviceInfo() {
        const userAgent = navigator.userAgent;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
        const isAndroid = /Android/i.test(userAgent);
        const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
        
        return {
            userAgent: userAgent,
            isMobile: isMobile,
            isAndroid: isAndroid,
            isIOS: isIOS,
            isDesktop: !isMobile,
            browser: this.getBrowserName(userAgent),
            os: this.getOSName(userAgent),
            screenResolution: `${screen.width}x${screen.height}`,
            language: navigator.language,
            timestamp: new Date().toISOString()
        };
    }

    getBrowserName(userAgent) {
        if (userAgent.indexOf('Chrome') > -1) return 'Chrome';
        if (userAgent.indexOf('Safari') > -1) return 'Safari';
        if (userAgent.indexOf('Firefox') > -1) return 'Firefox';
        if (userAgent.indexOf('Edge') > -1) return 'Edge';
        if (userAgent.indexOf('Opera') > -1) return 'Opera';
        return 'Unknown';
    }

    getOSName(userAgent) {
        if (userAgent.indexOf('Android') > -1) return 'Android';
        if (userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) return 'iOS';
        if (userAgent.indexOf('Windows') > -1) return 'Windows';
        if (userAgent.indexOf('Mac') > -1) return 'macOS';
        if (userAgent.indexOf('Linux') > -1) return 'Linux';
        return 'Unknown';
    }

    logDeviceInfo() {
        console.log('=== Chat Malawi Super-App Tracker ===');
        console.log('Device Info:', this.deviceInfo);
        console.log('Super-App Features: Social, Creator Economy, Digital Wallet, Entertainment, AI');
        console.log('=========================================');
    }

    trackEvent(eventName, additionalData = {}) {
        const event = {
            eventName: eventName,
            timestamp: new Date().toISOString(),
            deviceInfo: this.deviceInfo,
            ...additionalData
        };

        this.analyticsEvents.push(event);
        console.log('Event Tracked:', event);

        // Send to Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                'device_type': this.deviceInfo.isMobile ? 'mobile' : 'desktop',
                'os': this.deviceInfo.os,
                'browser': this.deviceInfo.browser,
                ...additionalData
            });
        }

        // Prepare for future backend tracking
        this.sendToBackend(event);
    }

    trackPageView() {
        this.trackEvent('super_app_page_view', {
            page_title: document.title,
            page_location: window.location.href,
            app_category: 'Super-App',
            core_pillars: 5
        });
    }

    trackDownload() {
        this.trackEvent('download_super_app_apk', {
            file_name: 'Chat Malawi.apk',
            file_size: '28.4MB',
            app_type: 'Super-App',
            features: ['social_connectivity', 'creator_economy', 'digital_wallet', 'entertainment_hub', 'ai_personalization']
        });
        
        // Increment download counter
        this.downloadCount++;
        this.updateDownloadCounters();
    }

    sendToBackend(event) {
        // Future: Send to your analytics backend
        // fetch('/api/analytics', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(event)
        // });
        
        // For now, just store in localStorage
        const storedEvents = JSON.parse(localStorage.getItem('chat_malawi_analytics') || '[]');
        storedEvents.push(event);
        localStorage.setItem('chat_malawi_analytics', JSON.stringify(storedEvents));
    }

    setupStickyDownloadBar() {
        const stickyBar = document.getElementById('stickyDownload');
        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateStickyBar = () => {
            if (window.scrollY > 500) {
                stickyBar.classList.add('show');
            } else {
                stickyBar.classList.remove('show');
            }
            ticking = false;
        };

        const onScroll = () => {
            lastScrollY = window.scrollY;
            if (!ticking) {
                window.requestAnimationFrame(updateStickyBar);
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll);
    }

    setupScrollTracking() {
        let maxScroll = 0;
        const scrollThresholds = [25, 50, 75, 90];

        window.addEventListener('scroll', () => {
            const scrollPercentage = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
            
            if (scrollPercentage > maxScroll) {
                maxScroll = scrollPercentage;
                
                scrollThresholds.forEach(threshold => {
                    if (scrollPercentage >= threshold && !this[`scrolled_${threshold}`]) {
                        this[`scrolled_${threshold}`] = true;
                        this.trackEvent('scroll_depth', {
                            scroll_percentage: threshold
                        });
                    }
                });
            }
        });
    }

    initializeCounters() {
        // Animate download counter on page load
        this.animateCounter('counter-number', this.downloadCount);
    }

    updateDownloadCounters() {
        const counters = document.querySelectorAll('.counter-number');
        counters.forEach(counter => {
            counter.textContent = this.downloadCount.toLocaleString();
        });
    }

    animateCounter(className, target) {
        const counters = document.querySelectorAll(`.${className}`);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
            current += step;
            if (current < target) {
                counters.forEach(counter => {
                    counter.textContent = Math.floor(current).toLocaleString();
                });
                requestAnimationFrame(updateCounter);
            } else {
                counters.forEach(counter => {
                    counter.textContent = target.toLocaleString();
                });
            }
        };

        updateCounter();
    }
}

// Initialize tracker
const tracker = new AppTracker();

// Download APK function
function downloadAPK() {
    // Track download event
    tracker.trackDownload();
    
    // Show toast notification
    showToast('Downloading Chat Malawi Super-App! Check your downloads folder.');
    
    // Start download
    const link = document.createElement('a');
    link.href = './Chat Malawi.apk';
    link.download = 'Chat Malawi.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show installation instructions for Android users
    if (tracker.deviceInfo.isAndroid) {
        setTimeout(() => {
            showToast('Enable "Install Unknown Apps" in settings if needed!');
        }, 2000);
        setTimeout(() => {
            showToast('Get ready to experience Malawi\'s ultimate Super-App! 🇲🇼');
        }, 4000);
    } else if (tracker.deviceInfo.isIOS) {
        setTimeout(() => {
            showToast('This Super-App is for Android devices only!');
        }, 2000);
    } else {
        setTimeout(() => {
            showToast('Transfer to your Android device to install the Super-App!');
        }, 2000);
    }
}

// Share functions
function shareOnWhatsApp() {
    const message = encodeURIComponent('🇲🇼 Download Chat Malawi Super-App and experience the future of digital interaction! Social, Creator Economy, Digital Wallet & Entertainment - all in one! 🚀');
    const url = encodeURIComponent(window.location.href);
    const whatsappUrl = `https://wa.me/?text=${message}%20${url}`;
    
    tracker.trackEvent('share_super_app_whatsapp');
    window.open(whatsappUrl, '_blank');
    showToast('Sharing Super-App on WhatsApp...');
}

function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    
    tracker.trackEvent('share_super_app_facebook');
    window.open(facebookUrl, '_blank');
    showToast('Sharing Super-App on Facebook...');
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        tracker.trackEvent('copy_super_app_link');
        showToast('Super-App link copied to clipboard! 🚀');
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        tracker.trackEvent('copy_super_app_link');
        showToast('Super-App link copied to clipboard! 🚀');
    });
}

// Toast notification system
function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// Footer link functions
function showPrivacy() {
    tracker.trackEvent('view_privacy_policy');
    showToast('Privacy Policy - Coming Soon!');
}

function showTerms() {
    tracker.trackEvent('view_terms_service');
    showToast('Terms of Service - Coming Soon!');
}

function showSupport() {
    tracker.trackEvent('view_support');
    showToast('Support - Contact us at support@chatmalawi.com');
}

// PWA Install Prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Show install banner after 5 seconds
    setTimeout(() => {
        if (deferredPrompt && !localStorage.getItem('pwa-install-dismissed')) {
            showInstallBanner();
        }
    }, 5000);
});

function showInstallBanner() {
    const banner = document.createElement('div');
    banner.className = 'install-banner';
    banner.innerHTML = `
        <div class="install-banner-content">
            <span>📱 Install Chat Malawi for easy access!</span>
            <button onclick="installPWA()">Install</button>
            <button onclick="dismissInstallBanner()">×</button>
        </div>
    `;
    
    document.body.appendChild(banner);
    
    setTimeout(() => {
        banner.classList.add('show');
    }, 100);
}

function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                tracker.trackEvent('pwa_install_accepted');
                showToast('App installed successfully!');
            } else {
                tracker.trackEvent('pwa_install_dismissed');
            }
            deferredPrompt = null;
        });
    }
    
    dismissInstallBanner();
}

function dismissInstallBanner() {
    const banner = document.querySelector('.install-banner');
    if (banner) {
        banner.classList.remove('show');
        setTimeout(() => {
            banner.remove();
        }, 300);
    }
    
    localStorage.setItem('pwa-install-dismissed', 'true');
}

// Performance monitoring
window.addEventListener('load', () => {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    tracker.trackEvent('page_load_complete', {
        load_time_ms: loadTime
    });
    
    console.log(`Page loaded in ${loadTime}ms`);
});

// Error tracking
window.addEventListener('error', (e) => {
    tracker.trackEvent('javascript_error', {
        error_message: e.message,
        error_filename: e.filename,
        error_lineno: e.lineno,
        error_colno: e.colno
    });
});

// Service Worker registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
                tracker.trackEvent('service_worker_registered');
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
                tracker.trackEvent('service_worker_failed');
            });
    });
}

// Add CSS for install banner
const installBannerStyles = `
.install-banner {
    position: fixed;
    top: -100px;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #2563eb 0%, #10b981 100%);
    color: white;
    padding: 15px;
    z-index: 3000;
    transition: top 0.3s ease;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.install-banner.show {
    top: 0;
}

.install-banner-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
}

.install-banner-content span {
    flex: 1;
    font-weight: 500;
}

.install-banner-content button {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 8px 16px;
    border-radius: 20px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
}

.install-banner-content button:hover {
    background: rgba(255, 255, 255, 0.3);
}

.install-banner-content button:last-child {
    background: transparent;
    border: none;
    font-size: 1.2rem;
    padding: 8px 12px;
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = installBannerStyles;
document.head.appendChild(styleSheet);

// Console welcome message
console.log('%c🇲🇼 Chat Malawi Super-App - The Digital Heartbeat of Malawi!', 'color: #2563eb; font-size: 20px; font-weight: bold;');
console.log('%cSocial Connectivity • Creator Economy • Digital Wallet • Entertainment • AI Personalization', 'color: #10b981; font-size: 14px;');
console.log('%cBuilt by Malawians, for Malawians 🇲🇼', 'color: #f59e0b; font-size: 12px;');
