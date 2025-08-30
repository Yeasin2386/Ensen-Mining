// Your Firebase Configuration
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
const db = app.firestore();
const rtdb = app.database();

document.addEventListener('DOMContentLoaded', function() {
    const loginTabBtn = document.getElementById('login-tab-btn');
    const registerTabBtn = document.getElementById('register-tab-btn');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const initialModal = document.getElementById('initial-modal');
    const modalProceedBtn = document.getElementById('modal-proceed-btn');
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const mainContainer = document.getElementById('main-container');
    const forgotPasswordPage = document.getElementById('forgot-password-page');
    const backToLoginBtn = document.getElementById('back-to-login-btn');
    const successModal = document.getElementById('success-modal');
    const errorModal = document.getElementById('error-modal');
    const loadingSpinner = document.getElementById('loading-spinner');

    // Function to show and hide the loading spinner
    function showLoading() {
        loadingSpinner.style.display = 'flex';
    }

    function hideLoading() {
        loadingSpinner.style.display = 'none';
    }

    // Function to show custom success modal
    function showSuccessModal(message) {
        document.getElementById('success-message').innerText = message;
        successModal.style.display = 'flex';
        // Add event listener to close button
        document.getElementById('success-modal-close-btn').onclick = () => {
            successModal.style.display = 'none';
            // Redirect or proceed to main.html after successful login/registration
            // window.location.href = 'main.html';
        };
    }

    // Function to show custom error modal
    function showErrorModal(message) {
        document.getElementById('error-message').innerText = message;
        errorModal.style.display = 'flex';
        // Add event listener to close button
        document.getElementById('error-modal-close-btn').onclick = () => {
            errorModal.style.display = 'none';
        };
    }

    // Handle initial modal
    mainContainer.style.display = 'none';
    initialModal.style.display = 'flex';

    modalProceedBtn.addEventListener('click', function() {
        const ageCheckbox = document.getElementById('check-age').checked;
        const awareCheckbox = document.getElementById('check-aware').checked;
        const termsCheckbox = document.getElementById('check-terms').checked;

        if (ageCheckbox && awareCheckbox && termsCheckbox) {
            initialModal.style.display = 'none';
            mainContainer.style.display = 'block';
        } else {
            showErrorModal('চালিয়ে যেতে আপনাকে অবশ্যই সব শর্তাবলীতে সম্মত হতে হবে।');
        }
    });

    // Tab switching
    loginTabBtn.addEventListener('click', function() {
        loginTabBtn.classList.add('active');
        registerTabBtn.classList.remove('active');
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    });

    registerTabBtn.addEventListener('click', function() {
        registerTabBtn.classList.add('active');
        loginTabBtn.classList.remove('active');
        registerForm.style.display = 'block';
        loginForm.style.display = 'none';
    });

    // Forgot password link functionality
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        mainContainer.style.display = 'none';
        forgotPasswordPage.style.display = 'flex';
    });

    backToLoginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        forgotPasswordPage.style.display = 'none';
        mainContainer.style.display = 'block';
    });
    
    // Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(icon => {
        icon.addEventListener('click', function() {
            const input = this.closest('.password-container').querySelector('.form-input');
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    });

    // Firebase Registration Logic
    document.getElementById('register-btn').addEventListener('click', function(e) {
        e.preventDefault();
        const fullName = document.getElementById('register-fullName').value;
        const email = document.getElementById('register-email').value;
        const mobile = document.getElementById('register-mobile').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const termsCheckbox = document.getElementById('terms-checkbox');

        if (password !== confirmPassword) {
            showErrorModal('পাসওয়ার্ড দুটি মিলছে না!');
            return;
        }

        if (!termsCheckbox.checked) {
            showErrorModal('অ্যাকাউন্ট তৈরি করতে আপনাকে পরিষেবার শর্তাবলীতে সম্মত হতে হবে।');
            return;
        }

        if (password.length < 8) {
            showErrorModal('পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।');
            return;
        }

        showLoading();

        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                // Save user data to Firestore
                return db.collection('users').doc(user.uid).set({
                    fullName: fullName,
                    email: email,
                    mobile: mobile,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                }).then(() => {
                    // Save initial balance to Realtime Database
                    return rtdb.ref('balances/' + user.uid).set({
                        currentBalance: 0,
                        lastUpdated: firebase.database.ServerValue.TIMESTAMP
                    });
                });
            })
            .then(() => {
                hideLoading();
                showSuccessModal('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!');
            })
            .catch((error) => {
                hideLoading();
                let errorMessage = 'একটি সমস্যা হয়েছে, আবার চেষ্টা করুন।';
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        errorMessage = 'এই ইমেইল ঠিকানাটি আগে থেকেই ব্যবহৃত হচ্ছে।';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'একটি বৈধ ইমেইল ঠিকানা লিখুন।';
                        break;
                    case 'auth/weak-password':
                        errorMessage = 'পাসওয়ার্ডটি খুব দুর্বল। আরও শক্তিশালী পাসওয়ার্ড ব্যবহার করুন।';
                        break;
                }
                showErrorModal(errorMessage);
            });
    });

    // Firebase Login Logic
    document.getElementById('login-btn').addEventListener('click', function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        showLoading();

        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                hideLoading();
                showSuccessModal('সফলভাবে লগইন করা হয়েছে!');
                // Optional: Redirect to main.html
                // window.location.href = 'main.html';
            })
            .catch((error) => {
                hideLoading();
                let errorMessage = 'লগইন ব্যর্থ হয়েছে। ইমেল বা পাসওয়ার্ড ভুল।';
                switch (error.code) {
                    case 'auth/user-not-found':
                    case 'auth/wrong-password':
                        errorMessage = 'ভুল ইমেইল বা পাসওয়ার্ড।';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'একটি বৈধ ইমেইল ঠিকানা লিখুন।';
                        break;
                }
                showErrorModal(errorMessage);
            });
    });
});
