// Firebase configuration
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
const auth = firebase.auth();
const database = firebase.database();

// DOM elements
const mainContainer = document.getElementById('main-container');
const loginTabBtn = document.getElementById('login-tab-btn');
const registerTabBtn = document.getElementById('register-tab-btn');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const regFullNameInput = document.getElementById('reg-fullname');
const regMobileInput = document.getElementById('reg-mobile');
const regEmailInput = document.getElementById('reg-email');
const regPasswordInput = document.getElementById('reg-password');
const regConfirmPasswordInput = document.getElementById('reg-confirm-password');
const regReferralInput = document.getElementById('reg-referral');

// Modals
const successModal = document.getElementById('success-modal');
const successMessageEl = document.getElementById('success-message');
const successModalCloseBtn = document.getElementById('success-modal-close-btn');
const errorModal = document.getElementById('error-modal');
const errorMessageEl = document.getElementById('error-message');
const errorModalCloseBtn = document.getElementById('error-modal-close-btn');
const loadingSpinner = document.getElementById('loading-spinner');

// Show/Hide Modals
function showSuccessModal(message) {
    successMessageEl.textContent = message;
    successModal.style.display = 'flex';
}

function showErrorModal(message) {
    errorMessageEl.textContent = message;
    errorModal.style.display = 'flex';
}

function showLoading() {
    loadingSpinner.style.display = 'flex';
}

function hideLoading() {
    loadingSpinner.style.display = 'none';
}

// Tab functionality
loginTabBtn.addEventListener('click', () => {
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
    loginTabBtn.classList.add('active');
    registerTabBtn.classList.remove('active');
});

registerTabBtn.addEventListener('click', () => {
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
    registerTabBtn.classList.add('active');
    loginTabBtn.classList.remove('active');
});

// Login button logic
loginBtn.addEventListener('click', () => {
    const email = loginEmailInput.value;
    const password = loginPasswordInput.value;

    if (!email || !password) {
        showErrorModal('দয়া করে ইমেল এবং পাসওয়ার্ড দিন।');
        return;
    }

    showLoading();
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            hideLoading();
            showSuccessModal('লগইন সফল! আপনাকে ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে।');
            setTimeout(() => {
                // main.html-এ রিডাইরেক্ট করার সঠিক পথ
                window.location.href = 'main-system/main.html';
            }, 1000);
        })
        .catch(error => {
            hideLoading();
            let errorMessage = 'লগইন ব্যর্থ হয়েছে।';
            if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                errorMessage = 'ভুল ইমেল বা পাসওয়ার্ড।';
            }
            showErrorModal(errorMessage);
        });
});

// Register button logic
registerBtn.addEventListener('click', () => {
    const fullName = regFullNameInput.value;
    const mobile = regMobileInput.value;
    const email = regEmailInput.value;
    const password = regPasswordInput.value;
    const confirmPassword = regConfirmPasswordInput.value;
    const referralCode = regReferralInput.value;

    if (!fullName || !mobile || !email || !password || !confirmPassword) {
        showErrorModal('দয়া করে সব তথ্য পূরণ করুন।');
        return;
    }

    if (password !== confirmPassword) {
        showErrorModal('পাসওয়ার্ড দুটি মিলছে না।');
        return;
    }

    showLoading();
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            // Save user data to Realtime Database
            database.ref('users/' + user.uid).set({
                fullName: fullName,
                email: email,
                mobile: mobile,
                balance: 0,
                dailyTaskCount: 0,
                lastTaskDate: '',
                totalReferrals: 0,
                referralEarnings: 0,
                registeredAt: new Date().toISOString()
            }).then(() => {
                // If there's a referral code, add a referral to the referrer
                if (referralCode) {
                    database.ref('users').orderByChild('uid').equalTo(referralCode).once('value', snapshot => {
                        snapshot.forEach(childSnapshot => {
                            const referrerId = childSnapshot.key;
                            database.ref('users/' + referrerId).transaction((currentData) => {
                                if (currentData) {
                                    currentData.totalReferrals = (currentData.totalReferrals || 0) + 1;
                                }
                                return currentData;
                            });
                        });
                    });
                }

                hideLoading();
                showSuccessModal('নিবন্ধন সফল! আপনাকে ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে।');
                setTimeout(() => {
                    // main.html-এ রিডাইরেক্ট করার সঠিক পথ
                    window.location.href = 'main-system/main.html';
                }, 1000);
            }).catch(dbError => {
                hideLoading();
                showErrorModal('ডেটাবেজে তথ্য সংরক্ষণ করতে সমস্যা হয়েছে।');
                console.error(dbError);
            });
        })
        .catch(error => {
            hideLoading();
            let errorMessage = 'নিবন্ধন ব্যর্থ হয়েছে।';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'এই ইমেলটি ইতিমধ্যেই ব্যবহৃত হয়েছে।';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'ভুল ইমেল ফরম্যাট।';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'পাসওয়ার্ডটি খুব দুর্বল। কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড ব্যবহার করুন।';
            }
            showErrorModal(errorMessage);
        });
});

// Modal close buttons
successModalCloseBtn.addEventListener('click', () => {
    successModal.style.display = 'none';
});
errorModalCloseBtn.addEventListener('click', () => {
    errorModal.style.display = 'none';
});
