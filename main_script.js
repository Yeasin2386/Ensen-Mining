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
    const withdrawBtn = document.getElementById('withdraw-btn');
    const mailBtn = document.getElementById('mail-btn');
    const minWithdrawalEl = document.getElementById('min-withdrawal');
    const minWithdrawalMessageEl = document.getElementById('min-withdraw-message');
    const processingFeeEl = document.getElementById('processing-fee');
    const referralPercentEl = document.getElementById('referral-percent');
    const referralAmountEl = document.getElementById('referral-amount');
    const referralBonusEl = document.getElementById('referral-bonus');
    
    // Task Buttons
    const watchAdBtn = document.getElementById('watch-ad-btn');
    const watchAdBtn2 = document.getElementById('watch-ad-btn-2');
    const visitSiteBtn = document.getElementById('visit-site-btn');
    const visitSiteBtn2 = document.getElementById('visit-site-btn-2');
    const rewardedPopupBtn = document.getElementById('rewarded-popup-btn');

    // Pop-up Modal elements
    const customModal = document.getElementById('custom-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalOkBtn = document.getElementById('modal-ok-btn');

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

    // --- Firebase and User Data ---
    auth.onAuthStateChanged(user => {
        if (user) {
            const userId = user.uid;
            let userRef = db.ref('users/' + userId);

            userRef.on('value', (snapshot) => {
                const userData = snapshot.val();
                if (userData) {
                    userBalanceEl.textContent = `৳ ${userData.balance?.toFixed(2) || '0.00'}`;
                    
                    // Update Profile Data
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
            window.location.href = 'index.html';
        }
    });

    function updateBalance(amount) {
        const userId = auth.currentUser.uid;
        const userRef = db.ref('users/' + userId);
        userRef.transaction((currentData) => {
            if (currentData) {
                currentData.balance = (currentData.balance || 0) + amount;
            }
            return currentData;
        }, (error, committed, snapshot) => {
            if (error) {
                console.error("Balance update failed:", error);
            }
        });
    }
    
    // --- Update UI with values from config.js ---
    if (minWithdrawalEl) minWithdrawalEl.textContent = `৳ ${configs.minWithdrawal}`;
    if (minWithdrawalMessageEl) minWithdrawalMessageEl.textContent = `৳${configs.minWithdrawal}`;
    if (processingFeeEl) processingFeeEl.textContent = `${configs.processingFee}%`;
    if (referralPercentEl) referralPercentEl.textContent = `${configs.referralPercent}`;
    if (referralAmountEl) referralAmountEl.textContent = `${configs.referralBonusAmount}`;
    if (referralBonusEl) referralBonusEl.textContent = `${(configs.referralBonusAmount * (configs.referralPercent / 100))}`;
    
    if (watchAdBtn) watchAdBtn.textContent = `+৳${configs.rewards.watchVideo}`;
    if (watchAdBtn2) watchAdBtn2.textContent = `+৳${configs.rewards.watchVideo}`;
    if (visitSiteBtn) visitSiteBtn.textContent = `+৳${configs.rewards.visitWebsite}`;
    if (visitSiteBtn2) visitSiteBtn2.textContent = `+৳${configs.rewards.visitWebsite}`;
    if (rewardedPopupBtn) rewardedPopupBtn.textContent = `+৳${configs.rewards.rewardedPopup}`;


    // --- Custom Pop-up Modal Functions ---
    function showModal(title, message) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        customModal.style.display = 'flex';
    }

    modalOkBtn.addEventListener('click', () => {
        customModal.style.display = 'none';
    });

    // --- Task Functionality ---

    // 1. Watch a Video (Rewarded Interstitial)
    function handleRewardedInterstitial(event) {
        event.preventDefault();
        if (typeof show_9716498 === 'function') {
            show_9716498().then(() => {
                updateBalance(configs.rewards.watchVideo);
                showModal('Success!', `Your account has been credited with ৳${configs.rewards.watchVideo}.`);
            }).catch(() => {
                showModal('Error!', 'Ad could not be loaded. Please try again.');
            });
        } else {
            showModal('Error!', 'Ad service is not available. Please try again later.');
        }
    }
    if (watchAdBtn) watchAdBtn.addEventListener('click', handleRewardedInterstitial);
    if (watchAdBtn2) watchAdBtn2.addEventListener('click', handleRewardedInterstitial);

    // 2. Rewarded Popup Ad
    if (rewardedPopupBtn) {
        rewardedPopupBtn.addEventListener('click', (event) => {
            event.preventDefault();
            if (typeof show_9716498 === 'function') {
                show_9716498('pop').then(() => {
                    updateBalance(configs.rewards.rewardedPopup);
                    showModal('Success!', `Your account has been credited with ৳${configs.rewards.rewardedPopup}.`);
                }).catch(() => {
                    showModal('Error!', 'Ad could not be loaded. Please try again.');
                });
            } else {
                showModal('Error!', 'Ad service is not available. Please try again later.');
            }
        });
    }

    // 3. Visit Website (Adsterra Smartlink)
    function handleVisitSite(event) {
        event.preventDefault();
        const smartlink = "https://viaanswerwillow.com/zcj9ncamas?key=6836bdc985e54703a11582786d62f2a5";
        const stayTime = 10000; // 10 seconds

        showModal('Visit Website', `You must stay on the site for 10-15 seconds to receive the reward of ৳${configs.rewards.visitWebsite}.`);
        
        setTimeout(() => {
            window.open(smartlink, '_blank');
        }, 1500);

        setTimeout(() => {
            updateBalance(configs.rewards.visitWebsite);
            showModal('Success!', `Your account has been credited with ৳${configs.rewards.visitWebsite}.`);
        }, stayTime + 2000); // Wait for the specified time plus a small buffer
    }
    if (visitSiteBtn) visitSiteBtn.addEventListener('click', handleVisitSite);
    if (visitSiteBtn2) visitSiteBtn2.addEventListener('click', handleVisitSite);

    // --- Tab and Navigation Logic ---
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

    if (historyBtn) {
        historyBtn.addEventListener('click', () => {
            window.location.href = 'history.html';
        });
    }

    if (withdrawBtn) {
        withdrawBtn.addEventListener('click', () => {
            switchTab('settings-tab');
            showSettingsPage('withdraw-page');
        });
    }
    
    if (mailBtn) {
        mailBtn.addEventListener('click', () => {
            switchTab('settings-tab');
            showSettingsPage('mail-page');
        });
    }
    
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
