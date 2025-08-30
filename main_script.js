// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDmJ8wsK6sYlRX2DWYTFmxwZONCL9nsmos",
    authDomain: "ensen-mining-bd-4882b.firebaseapp.com",
    databaseURL: "https://ensen-mining-bd-4882b-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "ensen-mining-bd-4882b",
    storageBucket: "ensen-mining-bd-4882b.firebasestorage.app",
    messagingSenderId: "1006758844776",
    appId: "1:1006758844776:web:df590613a79e1e9eed1edd",
    measurementId: "G-8YKDVM1W8B"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = app.auth();
const rtdb = app.database();
const firestore = app.firestore();

// DOM elements
const mainContent = document.querySelector('.main-content');
const loginForm = document.getElementById('login-form');
const currentBalanceEl = document.getElementById('current-balance');
const dailyVideoCountEl = document.getElementById('daily-video-count');
const dailyWebsiteCountEl = document.getElementById('daily-website-count');
const allVideoCountEl = document.getElementById('all-video-count');
const allWebsiteCountEl = document.getElementById('all-website-count');
const successModal = document.getElementById('success-modal');
const errorModal = document.getElementById('error-modal');
const loadingSpinner = document.getElementById('loading-spinner');

// Ads elements
const topAdBanner = document.getElementById('balance-banner-top');
const bottomAdSpace = document.getElementById('ad-space');

// Functions to show/hide UI elements
function showLoading() { loadingSpinner.style.display = 'flex'; }
function hideLoading() { loadingSpinner.style.display = 'none'; }
function showSuccessModal(message) {
    document.getElementById('success-message').innerText = message;
    successModal.style.display = 'flex';
}
function showErrorModal(message) {
    document.getElementById('error-message').innerText = message;
    errorModal.style.display = 'flex';
}

// Function to reset counters at midnight
function resetDailyCounters() {
    const today = new Date().toDateString();
    const lastReset = localStorage.getItem('last_reset');

    if (lastReset !== today) {
        localStorage.setItem('daily_video_count', 0);
        localStorage.setItem('daily_website_count', 0);
        localStorage.setItem('all_video_count', 0);
        localStorage.setItem('all_website_count', 0);
        localStorage.setItem('last_reset', today);
        updateCounters();
        console.log('Daily counters reset.');
    }
}

// Update UI with latest counter values
function updateCounters() {
    const dailyVideoCount = parseInt(localStorage.getItem('daily_video_count') || 0);
    const dailyWebsiteCount = parseInt(localStorage.getItem('daily_website_count') || 0);
    const allVideoCount = parseInt(localStorage.getItem('all_video_count') || 0);
    const allWebsiteCount = parseInt(localStorage.getItem('all_website_count') || 0);

    dailyVideoCountEl.innerText = dailyVideoCount;
    dailyWebsiteCountEl.innerText = dailyWebsiteCount;
    allVideoCountEl.innerText = allVideoCount;
    allWebsiteCountEl.innerText = allWebsiteCount;
}

// Task completion and balance update logic
function completeTask(taskType, isDaily) {
    let taskName = '';
    let countKey = '';
    let maxCount = 0;
    let reward = 0;

    if (isDaily) {
        if (taskType === 'video') {
            countKey = 'daily_video_count';
            maxCount = 1;
            reward = 0.50; // Adjust reward amount
            taskName = 'Daily Video';
        } else if (taskType === 'website') {
            countKey = 'daily_website_count';
            maxCount = 1;
            reward = 0.50; // Adjust reward amount
            taskName = 'Daily Website';
        }
    } else {
        if (taskType === 'video') {
            countKey = 'all_video_count';
            maxCount = 30;
            reward = 0.05; // Adjust reward amount
            taskName = 'All Video';
        } else if (taskType === 'website') {
            countKey = 'all_website_count';
            maxCount = 30;
            reward = 0.05; // Adjust reward amount
            taskName = 'All Website';
        }
    }

    let currentCount = parseInt(localStorage.getItem(countKey) || 0);

    if (currentCount >= maxCount) {
        showErrorModal('আপনি আজকের জন্য এই কাজটি সম্পন্ন করেছেন। আগামীকাল আবার চেষ্টা করুন।');
        return;
    }

    showLoading();

    let adPromise;
    if (taskType === 'video') {
        adPromise = show_9716498(); // Monetag Rewarded Interstitial
    } else {
        adPromise = show_9716498('pop'); // Monetag Rewarded Popup
        // Or for Adsterra Smartlink
        // window.open('https://viaanswerwillow.com/zcj9ncamas?key=6836bdc985e54703a11582786d62f2a5', '_blank');
    }

    adPromise.then(() => {
        currentCount++;
        localStorage.setItem(countKey, currentCount);
        updateCounters();
        updateUserBalance(reward, taskName);
        hideLoading();
        showSuccessModal('কাজ সফল! আপনার ব্যালেন্স যোগ করা হয়েছে।');
    }).catch((error) => {
        hideLoading();
        showErrorModal('বিজ্ঞাপন লোড হতে ব্যর্থ হয়েছে।');
    });
}

// Update balance in Firebase Realtime Database
function updateUserBalance(reward, taskName) {
    const user = auth.currentUser;
    if (user) {
        const balanceRef = rtdb.ref('balances/' + user.uid);
        balanceRef.transaction((currentBalance) => {
            if (currentBalance === null) {
                return {
                    currentBalance: reward,
                    lastUpdated: firebase.database.ServerValue.TIMESTAMP
                };
            } else {
                return {
                    currentBalance: currentBalance.currentBalance + reward,
                    lastUpdated: firebase.database.ServerValue.TIMESTAMP
                };
            }
        }).then(() => {
            // Log transaction to Firestore
            firestore.collection('transactions').add({
                userId: user.uid,
                task: taskName,
                amount: reward,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        }).catch((error) => {
            console.error('Balance update failed:', error);
            showErrorModal('ব্যালেন্স আপডেটে সমস্যা হয়েছে।');
        });
    }
}

// Function to fetch and display balance from Firebase
function fetchAndDisplayBalance() {
    const user = auth.currentUser;
    if (user) {
        const balanceRef = rtdb.ref('balances/' + user.uid);
        balanceRef.on('value', (snapshot) => {
            const data = snapshot.val();
            if (data) {
                currentBalanceEl.innerText = `${data.currentBalance.toFixed(2)}$`;
            } else {
                currentBalanceEl.innerText = '0.00$';
            }
        });
    }
}

// Function to fetch and display notification count
function fetchAndDisplayNotifications() {
    const user = auth.currentUser;
    const notificationBadge = document.getElementById('notification-count');
    if (user) {
        const notificationsRef = firestore.collection('notifications').where('read', '==', false);
        notificationsRef.onSnapshot((snapshot) => {
            const unreadCount = snapshot.size;
            notificationBadge.innerText = unreadCount;
            notificationBadge.style.display = unreadCount > 0 ? 'block' : 'none';
        });
    }
}

// Adsterra ad placement
function loadAdsterraBanners() {
    // Banner 320x50 on top
    const topAdScript = document.createElement('script');
    topAdScript.innerHTML = `atOptions = {'key' : '3e8de08585fbff771f13f27096f68fa0','format' : 'iframe','height' : 50,'width' : 320,'params' : {}};`;
    const topAdScriptInvoke = document.createElement('script');
    topAdScriptInvoke.type = 'text/javascript';
    topAdScriptInvoke.src = '//viaanswerwillow.com/3e8de08585fbff771f13f27096f68fa0/invoke.js';
    topAdBanner.appendChild(topAdScript);
    topAdBanner.appendChild(topAdScriptInvoke);

    // Native Banner on bottom
    const nativeBannerScript = document.createElement('script');
    nativeBannerScript.async = true;
    nativeBannerScript.dataset.cfasync = 'false';
    nativeBannerScript.src = '//viaanswerwillow.com/3209e68579e4f1bf631f417096bd186e/invoke.js';
    const nativeBannerDiv = document.createElement('div');
    nativeBannerDiv.id = 'container-3209e68579e4f1bf631f417096bd186e';
    bottomAdSpace.appendChild(nativeBannerScript);
    bottomAdSpace.appendChild(nativeBannerDiv);

    // Banner 300x250 on bottom
    const bannerScript = document.createElement('script');
    bannerScript.innerHTML = `atOptions = {'key' : '46272549345a79336d26e76ff1c1d24b','format' : 'iframe','height' : 250,'width' : 300,'params' : {}};`;
    const bannerScriptInvoke = document.createElement('script');
    bannerScriptInvoke.type = 'text/javascript';
    bannerScriptInvoke.src = '//viaanswerwillow.com/46272549345a79336d26e76ff1c1d24b/invoke.js';
    bottomAdSpace.appendChild(bannerScript);
    bottomAdSpace.appendChild(bannerScriptInvoke);
}

// Authentication state listener
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in.
        mainContent.style.display = 'block';
        fetchAndDisplayBalance();
        fetchAndDisplayNotifications();
        resetDailyCounters();
        updateCounters();
        loadAdsterraBanners();
        // Monetag In-app Interstitial
        show_9716498({ type: 'inApp', inAppSettings: { frequency: 2, capping: 0.1, interval: 30, timeout: 5, everyPage: false } });
    } else {
        // User is signed out. Redirect to login page.
        window.location.href = 'index.html';
    }
});

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Tab switching
    document.querySelectorAll('.tab-buttons .tab-button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.tab-buttons .tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
            button.classList.add('active');
            document.getElementById(`${button.dataset.tab}-tab-content`).style.display = 'block';
        });
    });

    // Task buttons
    document.getElementById('watch-daily-video-btn').addEventListener('click', () => completeTask('video', true));
    document.getElementById('visit-daily-website-btn').addEventListener('click', () => completeTask('website', true));
    document.getElementById('watch-all-video-btn').addEventListener('click', () => completeTask('video', false));
    document.getElementById('visit-all-website-btn').addEventListener('click', () => completeTask('website', false));

    // Modal close buttons
    document.getElementById('success-modal-close-btn').addEventListener('click', () => successModal.style.display = 'none');
    document.getElementById('error-modal-close-btn').addEventListener('click', () => errorModal.style.display = 'none');

    // Navigation links
    document.getElementById('mail-icon').addEventListener('click', () => {
        // Here you can navigate to the "Mail" section within the settings page.
        // For a single-page app, this might be a simple class toggle or scroll to an element.
        // For now, it will just show a success message as an example.
        showSuccessModal('মেইল সেকশনে নিয়ে যাওয়া হচ্ছে।');
    });
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', () => {
        auth.signOut().then(() => {
            window.location.href = 'index.html';
        }).catch((error) => {
            showErrorModal('লগআউট করতে সমস্যা হয়েছে।');
        });
    });

    // New Request Balance button logic (Placeholder)
    document.getElementById('request-balance-btn').addEventListener('click', () => {
        showSuccessModal('আপনার ব্যালেন্স রিকুয়েস্ট করা হয়েছে।');
    });

    // Withdraw and Add button functionality (Placeholder)
    document.getElementById('withdraw-btn').addEventListener('click', () => {
        showSuccessModal('উইথড্র অপশনে নিয়ে যাওয়া হচ্ছে।');
    });
    
    document.getElementById('add-balance-btn').addEventListener('click', () => {
        showSuccessModal('ব্যালেন্স অ্যাড করার অপশনে নিয়ে যাওয়া হচ্ছে।');
    });
});
