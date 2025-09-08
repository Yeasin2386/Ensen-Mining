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

const DAILY_TASK_LIMIT = 25;

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
    
    // New Elements
    const taskCounterEl = document.getElementById('task-counter');
    const dailyTasksContainer = document.getElementById('daily-tasks-container');

    // Task Buttons
    const watchAdBtn = document.getElementById('watch-ad-btn');
    const visitSiteBtn = document.getElementById('visit-site-btn');

    // Pop-up Modal elements
    const customModal = document.getElementById('custom-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalOkBtn = document.getElementById('modal-ok-btn');
    
    // Visit Site Modal elements
    const visitSiteModal = document.getElementById('visit-site-modal');
    const visitModalTitle = document.getElementById('visit-modal-title');
    const visitModalMessage = document.getElementById('visit-modal-message');
    const visitModalTimer = document.getElementById('visit-modal-timer');
    const visitModalOkBtn = document.getElementById('visit-modal-ok-btn');

    // Function to show a custom modal
    function showCustomModal(title, message) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        customModal.style.display = 'flex';
    }

    // Function to hide the custom modal
    function hideCustomModal() {
        customModal.style.display = 'none';
    }

    modalOkBtn.addEventListener('click', hideCustomModal);

    // Function to update the user's balance in Firebase
    function updateBalance(userId, rewardAmount) {
        const userRef = db.ref('users/' + userId);
        userRef.transaction((currentData) => {
            if (currentData === null) {
                return; // Abort the transaction if user data doesn't exist
            }
            const currentBalance = currentData.balance || 0;
            const newBalance = (parseFloat(currentBalance) + rewardAmount).toFixed(2);
            currentData.balance = parseFloat(newBalance);
            return currentData;
        }, (error, committed, snapshot) => {
            if (error) {
                console.error("Transaction failed abnormally!", error);
            } else if (!committed) {
                console.log("Transaction aborted because user balance was updated by another user.");
            } else {
                console.log("Balance updated successfully.");
                updateUI(snapshot.val());
            }
        });
    }

    // Function to check and update daily tasks
    function checkAndUpdateDailyTask(userId, callback) {
        const userRef = db.ref('users/' + userId);
        userRef.once('value').then(snapshot => {
            const userData = snapshot.val();
            const today = new Date().toISOString().slice(0, 10);
            let dailyTaskCount = userData.dailyTaskCount || 0;
            const lastTaskDate = userData.lastTaskDate || today;

            if (lastTaskDate !== today) {
                dailyTaskCount = 0;
            }

            if (dailyTaskCount >= DAILY_TASK_LIMIT) {
                showCustomModal('লিমিট শেষ!', 'আজকের জন্য আপনার টাস্ক লিমিট শেষ। পরের দিন আবার চেষ্টা করুন।');
                if (callback) callback(false);
            } else {
                dailyTaskCount++;
                userRef.update({
                    dailyTaskCount: dailyTaskCount,
                    lastTaskDate: today
                }).then(() => {
                    updateTaskCounter(dailyTaskCount);
                    if (callback) callback(true);
                }).catch(error => {
                    console.error("Error updating daily task count:", error);
                    showCustomModal('ভুল হয়েছে', 'টাস্ক সম্পন্ন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
                    if (callback) callback(false);
                });
            }
        }).catch(error => {
            console.error("Error fetching user data for tasks:", error);
            showCustomModal('ভুল হয়েছে', 'ডেটা লোড করতে সমস্যা হয়েছে।');
            if (callback) callback(false);
        });
    }

    // Function to update the task counter display
    function updateTaskCounter(count) {
        const remainingTasks = DAILY_TASK_LIMIT - count;
        taskCounterEl.textContent = `Today's Tasks: ${remainingTasks}/${DAILY_TASK_LIMIT}`;
    }

    // User authentication state listener
    auth.onAuthStateChanged(user => {
        if (user) {
            const userRef = db.ref('users/' + user.uid);
            userRef.on('value', (snapshot) => {
                const userData = snapshot.val();
                if (userData) {
                    updateUI(userData);
                    updateTaskCounter(userData.dailyTaskCount || 0);
                }
            });
            // Fetch configuration
            db.ref('configs').once('value', snapshot => {
                const configs = snapshot.val();
                if (configs) {
                    minWithdrawalEl.textContent = `৳ ${configs.minWithdrawal}`;
                    minWithdrawalMessageEl.textContent = configs.minWithdrawal;
                    processingFeeEl.textContent = configs.processingFee;
                }
            });
        } else {
            window.location.href = 'index.html';
        }
    });

    // Update UI elements with user data
    function updateUI(userData) {
        if (userData) {
            userBalanceEl.textContent = `৳ ${userData.balance ? userData.balance.toFixed(2) : '0.00'}`;
            // referral link logic
            const referralLinkEl = document.getElementById('referral-link-text');
            if (referralLinkEl) {
                const referralLink = `${window.location.origin}/index.html?ref=${userData.uid}`;
                referralLinkEl.textContent = referralLink;
            }
            // referral stats logic
            const totalReferralsEl = document.getElementById('total-referrals');
            const referralEarningsEl = document.getElementById('referral-earnings');
            if (totalReferralsEl && referralEarningsEl) {
                totalReferralsEl.textContent = userData.totalReferrals || 0;
                referralEarningsEl.textContent = `৳${userData.referralEarnings ? userData.referralEarnings.toFixed(2) : '0.00'}`;
            }
        }
    }

    // Tab navigation logic
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));
            this.classList.add('active');
            const targetTabId = this.id.replace('-nav', '-tab');
            const targetTab = document.getElementById(targetTabId);
            if (targetTab) {
                targetTab.classList.add('active');
            }
        });
    });

    // --- Task Buttons Logic with daily limit ---
    if (watchAdBtn) {
        watchAdBtn.addEventListener('click', () => {
            const user = auth.currentUser;
            if (user) {
                checkAndUpdateDailyTask(user.uid, (canProceed) => {
                    if (canProceed) {
                        showCustomModal('ভিডিও দেখুন', 'ভিডিও বিজ্ঞাপনটি দেখার জন্য প্রস্তুত।');
                        // Implement your ad-watching logic here
                        // For demonstration purposes, we'll update the balance directly
                        const rewardAmount = 5.00;
                        updateBalance(user.uid, rewardAmount);
                    }
                });
            } else {
                showCustomModal('লগইন করুন', 'টাস্ক সম্পন্ন করতে আপনাকে লগইন করতে হবে।');
            }
        });
    }

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
