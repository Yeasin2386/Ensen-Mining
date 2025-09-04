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
    const mailCountEl = document.getElementById('mail-count');
    const mailBtn = document.getElementById('mail-btn');
    const videoAdTask = document.getElementById('video-ad-task');
    const websiteVisitTask = document.getElementById('website-visit-task');
    const websiteModal = document.getElementById('website-modal');
    const websiteOkBtn = document.getElementById('website-ok-btn');
    const websiteCancelBtn = document.getElementById('website-cancel-btn');

    let currentBalance = 0;

    // Fetch and display user balance
    auth.onAuthStateChanged(user => {
        if (user) {
            db.ref('users/' + user.uid + '/balance').on('value', (snapshot) => {
                currentBalance = snapshot.val() || 0;
                userBalanceEl.textContent = `৳ ${currentBalance.toFixed(2)}`;
            });

            // Function to add reward to user balance
            function addReward(amount) {
                currentBalance += amount;
                db.ref('users/' + user.uid + '/balance').set(currentBalance)
                    .then(() => {
                        userBalanceEl.textContent = `৳ ${currentBalance.toFixed(2)}`;
                        alert(`আপনি ৳${amount.toFixed(2)} উপার্জন করেছেন!`);
                    })
                    .catch(error => {
                        console.error("Error updating balance: ", error);
                        alert("ব্যালেন্স আপডেট করতে সমস্যা হয়েছে।");
                    });
            }

            // --- Monetag Rewarded Interstitial Ad ---
            if (videoAdTask) {
                videoAdTask.addEventListener('click', () => {
                    if (typeof show_9716498 === 'function') {
                        show_9716498().then(() => {
                            // User watched the ad and reward function is called
                            addReward(configs.rewards.watchVideo);
                        }).catch(() => {
                            alert('বিজ্ঞাপন লোড হতে ব্যর্থ হয়েছে। পরে আবার চেষ্টা করুন।');
                        });
                    } else {
                        alert('বিজ্ঞাপন SDK পাওয়া যায়নি।');
                    }
                });
            }

            // --- Adsterra Smartlink with Pop-up ---
            if (websiteVisitTask) {
                websiteVisitTask.addEventListener('click', () => {
                    websiteModal.style.display = 'flex';
                });
            }

            if (websiteOkBtn) {
                websiteOkBtn.addEventListener('click', () => {
                    websiteModal.style.display = 'none';
                    const smartlinkURL = 'https://viaanswerwillow.com/zcj9ncamas?key=6836bdc985e54703a11582786d62f2a5';
                    window.open(smartlinkURL, '_blank');
                    
                    // Add reward after a delay to simulate task completion
                    setTimeout(() => {
                        addReward(configs.rewards.visitWebsite);
                    }, 10000); // 10 seconds delay
                });
            }

            if (websiteCancelBtn) {
                websiteCancelBtn.addEventListener('click', () => {
                    websiteModal.style.display = 'none';
                });
            }

            // --- Mail Notification Logic ---
            function updateMailCount(count) {
                if (count > 0) {
                    mailCountEl.textContent = count;
                    mailCountEl.classList.remove('hidden');
                } else {
                    mailCountEl.classList.add('hidden');
                }
            }
            
            // Example: set initial mail count from a database
            db.ref('users/' + user.uid + '/unreadMails').on('value', (snapshot) => {
                const unreadCount = snapshot.val() || 0;
                updateMailCount(unreadCount);
            });
            
            // Example of how to add a new mail (this would be triggered by a backend system)
            mailBtn.addEventListener('click', () => {
                // Here, you would typically read the mails. For this example, we'll just show an alert.
                alert("মেইল সেকশন খোলা হচ্ছে।");
                db.ref('users/' + user.uid + '/unreadMails').set(0); // Reset count on click
            });

        } else {
            window.location.href = 'index.html'; // Redirect to login if not authenticated
        }
    });

    // --- Tab Navigation Logic ---
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');

            const tabId = this.getAttribute('data-tab');
            tabContents.forEach(tab => {
                if (tab.id === tabId) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });
        });
    });

    // --- Withdraw and History buttons
    if (historyBtn) {
        historyBtn.addEventListener('click', () => {
            window.location.href = 'history.html';
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
                alert("লগআউট ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
            });
        });
    }
});
