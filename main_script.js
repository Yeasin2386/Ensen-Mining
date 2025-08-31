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
const auth = firebase.auth();

document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    const userBalanceEl = document.getElementById('user-balance');
    const historyBtn = document.getElementById('history-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const logoutModal = document.getElementById('logout-modal');
    const cancelLogoutBtn = document.getElementById('cancel-logout');
    const confirmLogoutBtn = document.getElementById('confirm-logout');
    const loadingSpinnerOverlay = document.getElementById('loading-spinner-overlay');

    // Profile elements
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');

    // Referral Stats
    const totalReferralsEl = document.getElementById('total-referrals');
    const activeReferralsEl = document.getElementById('active-referrals');
    const totalEarningsEl = document.getElementById('total-earnings');
    const pendingBonusEl = document.getElementById('pending-bonus');
    
    // Settings menu buttons
    const settingsItems = document.querySelectorAll('.settings-item[data-target]');
    const backButtons = document.querySelectorAll('.back-btn');
    const settingsPages = document.querySelectorAll('.settings-page');

    // Check for user login state
    auth.onAuthStateChanged(user => {
        if (user) {
            const userId = user.uid;
            let userRef = db.ref('users/' + userId);

            // Load all user data from Firebase
            userRef.on('value', (snapshot) => {
                const userData = snapshot.val();
                if (userData) {
                    // Update Balance
                    userBalanceEl.textContent = `৳ ${userData.balance?.toFixed(2) || '0.00'}`;

                    // Update Profile
                    if (fullNameInput) {
                        fullNameInput.value = userData.fullName || 'N/A';
                    }
                    if (emailInput) {
                        emailInput.value = userData.email || 'N/A';
                    }
                    if (phoneInput) {
                        phoneInput.value = userData.phone || 'N/A';
                    }

                    // Update Referral Stats
                    if (totalReferralsEl) totalReferralsEl.textContent = userData.referrals?.total || 0;
                    if (activeReferralsEl) activeReferralsEl.textContent = userData.referrals?.active || 0;
                    if (totalEarningsEl) totalEarningsEl.textContent = `৳${userData.referrals?.earnings || 0}`;
                    if (pendingBonusEl) pendingBonusEl.textContent = `৳${userData.referrals?.pending || 0}`;
                }
            });

        } else {
            // User is not logged in, redirect to login page
            window.location.href = 'index.html';
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
        showSettingsPage('settings-menu');
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
    
    // Copy referral link
    const copyButton = document.querySelector('.copy-btn');
    if (copyButton) {
        copyButton.addEventListener('click', function() {
            const referralLink = document.querySelector('.referral-code').textContent;
            navigator.clipboard.writeText(referralLink).then(() => {
                this.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-copy"></i> Copy Link';
                }, 2000);
            });
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

    // Withdraw method selection
    const withdrawMethods = document.querySelectorAll('.withdraw-method');
    const accountNumberInput = document.getElementById('account-number');
    withdrawMethods.forEach(method => {
        method.addEventListener('click', () => {
            withdrawMethods.forEach(m => m.classList.remove('selected'));
            method.classList.add('selected');
            if (method.dataset.method === 'bkash') {
                accountNumberInput.placeholder = "e.g., 01700000000 (Bkash Number)";
            } else {
                accountNumberInput.placeholder = "e.g., Your Binance Pay ID or Address";
            }
        });
    });

    // --- Logout Logic with Loading Spinner ---
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logoutModal.style.display = 'flex';
        });
    }

    if (cancelLogoutBtn) {
        cancelLogoutBtn.addEventListener('click', () => {
            logoutModal.style.display = 'none';
        });
    }

    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener('click', () => {
            logoutModal.style.display = 'none';
            loadingSpinnerOverlay.style.display = 'flex';
            
            auth.signOut().then(() => {
                window.location.href = 'index.html';
            }).catch((error) => {
                console.error("Logout Error: ", error);
                loadingSpinnerOverlay.style.display = 'none';
                alert("Logout failed. Please try again.");
            });
        });
    }
});
