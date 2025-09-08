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
            const targetTab = document.getElementById(this.dataset.tab);
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
                        // For demonstration, let's just add the reward after a delay
                        setTimeout(() => {
                            const reward = window.configs.rewards.watchVideo;
                            updateBalance(user.uid, reward);
                            showCustomModal('সফল!', `৳${reward} আপনার অ্যাকাউন্টে যোগ করা হয়েছে।`);
                        }, 5000); // 5 second delay for demo
                    }
                });
            } else {
                showCustomModal('লগইন করুন', 'এই টাস্কটি করতে হলে আপনাকে প্রথমে লগইন করতে হবে।');
            }
        });
    }

    if (visitSiteBtn) {
        visitSiteBtn.addEventListener('click', () => {
            const user = auth.currentUser;
            if (user) {
                checkAndUpdateDailyTask(user.uid, (canProceed) => {
                    if (canProceed) {
                        // Open new window immediately to simulate site visit
                        const siteUrl = "https://www.google.com"; // Replace with your target site URL
                        const newWindow = window.open(siteUrl, '_blank');

                        // Show timer modal
                        visitSiteModal.style.display = 'flex';
                        let timer = 8;
                        visitModalTimer.textContent = timer;

                        const countdown = setInterval(() => {
                            timer--;
                            visitModalTimer.textContent = timer;

                            if (timer <= 0) {
                                clearInterval(countdown);
                                visitModalMessage.textContent = "আপনার টাকা যোগ করা হয়েছে!";
                                visitModalTimer.style.display = 'none';

                                // Add the reward to user's balance
                                const reward = window.configs.rewards.visitWebsite;
                                updateBalance(user.uid, reward);
                                visitModalTitle.textContent = 'সফল!';
                                visitModalOkBtn.textContent = 'চালিয়ে যান';
                                visitModalOkBtn.addEventListener('click', () => {
                                    visitSiteModal.style.display = 'none';
                                });
                            }
                        }, 1000);
                    }
                });
            } else {
                showCustomModal('লগইন করুন', 'এই টাস্কটি করতে হলে আপনাকে প্রথমে লগইন করতে হবে।');
            }
        });
    }


    // --- Other Logic ---
    if (withdrawBtn) {
        withdrawBtn.addEventListener('click', () => {
            document.querySelector('[data-tab="withdraw-tab"]').click();
        });
    }
    
    // Referral copy link functionality
    const copyBtn = document.getElementById('copy-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const referralLinkEl = document.getElementById('referral-link-text');
            const referralLink = referralLinkEl.textContent;
            navigator.clipboard.writeText(referralLink).then(() => {
                showCustomModal('কপি সফল!', 'রেফারেল লিংকটি সফলভাবে কপি করা হয়েছে।');
            }).catch(err => {
                console.error('Failed to copy text: ', err);
                showCustomModal('ভুল হয়েছে', 'রেফারেল লিংক কপি করা সম্ভব হয়নি।');
            });
        });
    }
    
    // Withdraw form logic
    const withdrawMethods = document.querySelectorAll('.withdraw-method');
    const accountNumberInput = document.getElementById('account-number');
    const submitWithdrawBtn = document.getElementById('submit-withdraw-btn');
    const withdrawAmountInput = document.getElementById('withdraw-amount');

    if(submitWithdrawBtn) {
        submitWithdrawBtn.addEventListener('click', () => {
            const amount = parseFloat(withdrawAmountInput.value);
            const selectedMethod = document.querySelector('.withdraw-method.selected');
            const accountNumber = accountNumberInput.value.trim();
            const minWithdrawal = parseFloat(minWithdrawalMessageEl.textContent);
    
            if (!selectedMethod) {
                showCustomModal('ভুল হয়েছে', 'দয়া করে একটি পদ্ধতি নির্বাচন করুন।');
                return;
            }
    
            if (isNaN(amount) || amount <= 0) {
                showCustomModal('ভুল হয়েছে', 'সঠিক পরিমাণ লিখুন।');
                return;
            }
    
            if (amount < minWithdrawal) {
                showCustomModal('ভুল হয়েছে', `ন্যূনতম উত্তোলনের পরিমাণ ${minWithdrawal} টাকা।`);
                return;
            }
    
            if (!accountNumber) {
                showCustomModal('ভুল হয়েছে', 'অ্যাকাউন্ট নম্বর / Pay ID দিন।');
                return;
            }
    
            const user = auth.currentUser;
            if (user) {
                const userRef = db.ref('users/' + user.uid);
                userRef.once('value').then(snapshot => {
                    const userData = snapshot.val();
                    const currentBalance = userData.balance || 0;
    
                    if (currentBalance < amount) {
                        showCustomModal('ব্যালেন্স অপর্যাপ্ত', 'আপনার অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই।');
                        return;
                    }
    
                    // Process the withdrawal
                    const fee = amount * (parseFloat(processingFeeEl.textContent) / 100);
                    const finalAmount = amount - fee;
                    const newBalance = currentBalance - amount;
    
                    userRef.update({ balance: newBalance.toFixed(2) }).then(() => {
                        // Store withdrawal history
                        const withdrawalHistoryRef = db.ref('withdrawalHistory/' + user.uid).push();
                        withdrawalHistoryRef.set({
                            amount: amount,
                            finalAmount: finalAmount.toFixed(2),
                            method: selectedMethod.dataset.method,
                            accountNumber: accountNumber,
                            status: 'Pending',
                            timestamp: firebase.database.ServerValue.TIMESTAMP
                        }).then(() => {
                            showCustomModal('অনুরোধ সফল!', `আপনার ${amount} টাকা উত্তোলনের অনুরোধটি সফলভাবে জমা হয়েছে।`);
                            withdrawAmountInput.value = '';
                            accountNumberInput.value = '';
                        }).catch(error => {
                            console.error("Error writing withdrawal history: ", error);
                            showCustomModal('ভুল হয়েছে', 'উত্তোলনের অনুরোধ জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
                        });
                    }).catch(error => {
                        console.error("Error updating balance: ", error);
                        showCustomModal('ভুল হয়েছে', 'ব্যালেন্স আপডেট করতে সমস্যা হয়েছে।');
                    });
                });
            } else {
                showCustomModal('লগইন করুন', 'উত্তোলন করার জন্য আপনাকে লগইন করতে হবে।');
            }
        });
    }

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
