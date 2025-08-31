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

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const firestore = firebase.firestore();

// Use a hardcoded user ID for demonstration. In a real app, this should be set after user login.
const userId = 'user_001'; 

document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    const userBalanceEl = document.getElementById('user-balance');
    const historyBtn = document.querySelector('.balance-actions .action-btn:last-child');
    const logoutBtn = document.getElementById('logout-btn');
    const logoutModal = document.getElementById('logout-modal');
    const cancelLogoutBtn = document.getElementById('cancel-logout');
    const confirmLogoutBtn = document.getElementById('confirm-logout');

    // Profile elements
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');

    // Referral Stats
    const totalReferralsEl = document.querySelector('.referral-stats .stat-box:nth-child(1) .stat-value');
    const totalEarningsEl = document.querySelector('.referral-stats .stat-box:nth-child(3) .stat-value');
    
    // Settings menu buttons
    const settingsItems = document.querySelectorAll('.settings-item[data-target]');
    const backButtons = document.querySelectorAll('.back-btn');
    const settingsPages = document.querySelectorAll('.settings-page');

    let userRef = db.ref('users/' + userId);

    // Load all user data from Firebase and update UI
    userRef.on('value', (snapshot) => {
        const userData = snapshot.val();
        if (userData) {
            // Update Balance
            userBalanceEl.textContent = `৳ ${userData.balance.toFixed(2)}`;

            // Update Profile - Make inputs readonly to prevent accidental changes
            if (fullNameInput) {
                fullNameInput.value = userData.fullName || 'N/A';
                fullNameInput.setAttribute('readonly', true);
            }
            if (emailInput) {
                emailInput.value = userData.email || 'N/A';
                emailInput.setAttribute('readonly', true);
            }
            if (phoneInput) {
                phoneInput.value = userData.phone || 'N/A';
                phoneInput.setAttribute('readonly', true);
            }

            // Update Referral Stats
            if (totalReferralsEl) totalReferralsEl.textContent = userData.referrals?.total || 0;
            if (totalEarningsEl) totalEarningsEl.textContent = `৳${userData.referrals?.earnings || 0}`;
        } else {
            // Initialize new user data if it doesn't exist
            userRef.set({
                balance: 0,
                fullName: 'Md. Exmaple Name', // This should be from registration
                email: 'example@email.com',  // This should be from registration
                phone: '01700000000',        // This should be from registration
                referrals: {
                    total: 0,
                    active: 0,
                    earnings: 0,
                    pending: 0
                }
            });
            userBalanceEl.textContent = `৳ 0.00`;
        }
    });

    function switchTab(tabId) {
        tabContents.forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabId).classList.add('active');
        
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-tab') === tabId) {
                item.classList.add('active');
            }
        });
    }

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Handle History Button click
    if (historyBtn) {
        historyBtn.addEventListener('click', () => {
            window.location.href = 'history.html';
        });
    }

    // --- New JavaScript for Settings Tab ---
    function showSettingsPage(pageId) {
        settingsPages.forEach(page => page.classList.remove('active'));
        document.getElementById(pageId).classList.add('active');
    }

    settingsItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetPageId = item.getAttribute('data-target');
            showSettingsPage(targetPageId);
        });
    });

    backButtons.forEach(button => {
        button.addEventListener('click', () => {
            showSettingsPage('settings-menu');
        });
    });

    // --- Logout Logic ---
    logoutBtn.addEventListener('click', () => {
        logoutModal.style.display = 'flex';
    });

    cancelLogoutBtn.addEventListener('click', () => {
        logoutModal.style.display = 'none';
    });

    confirmLogoutBtn.addEventListener('click', () => {
        // Here you would add the Firebase logout function (e.g., firebase.auth().signOut())
        // For now, we'll just redirect to the login page.
        window.location.href = 'index.html'; 
    });
});
