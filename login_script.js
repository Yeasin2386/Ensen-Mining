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
const regFullNameInput = document.getElementById('register-fullName');
const regEmailInput = document.getElementById('register-email');
const regMobileInput = document.getElementById('register-mobile');
const regPasswordInput = document.getElementById('register-password');
const regConfirmPasswordInput = document.getElementById('register-confirm-password');
const termsCheckbox = document.getElementById('terms-checkbox');
const forgotPasswordLink = document.getElementById('forgot-password-link');
const forgotPasswordPage = document.getElementById('forgot-password-page');
const backToLoginBtn = document.getElementById('back-to-login-btn');

// Modals and loading spinner
const initialModal = document.getElementById('initial-modal');
const modalProceedBtn = document.getElementById('modal-proceed-btn');
const checkAge = document.getElementById('check-age');
const checkAware = document.getElementById('check-aware');
const checkTerms = document.getElementById('check-terms');
const successModal = document.getElementById('success-modal');
const errorModal = document.getElementById('error-modal');
const successMessage = document.getElementById('success-message');
const errorMessage = document.getElementById('error-message');
const successModalCloseBtn = document.getElementById('success-modal-close-btn');
const errorModalCloseBtn = document.getElementById('error-modal-close-btn');
const loadingSpinner = document.getElementById('loading-spinner');

// Helper functions
function showLoading() { loadingSpinner.style.display = 'flex'; }
function hideLoading() { loadingSpinner.style.display = 'none'; }
function showSuccessModal(message) { successMessage.innerText = message; successModal.style.display = 'flex'; }
function showErrorModal(message) { errorMessage.innerText = message; errorModal.style.display = 'flex'; }
function showMainContent() {
    mainContainer.style.display = 'block';
    forgotPasswordPage.style.display = 'none';
}
function showForgotPasswordPage() {
    mainContainer.style.display = 'none';
    forgotPasswordPage.style.display = 'flex';
}
function togglePasswordVisibility(inputElement) {
    const icon = inputElement.nextElementSibling.querySelector('i');
    if (inputElement.type === 'password') {
        inputElement.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        inputElement.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Event listeners for password visibility
document.querySelectorAll('.toggle-password').forEach(toggleBtn => {
    toggleBtn.addEventListener('click', () => {
        const input = toggleBtn.previousElementSibling;
        togglePasswordVisibility(input);
    });
});

// Initial Modal Logic
document.addEventListener('DOMContentLoaded', () => {
    initialModal.style.display = 'flex';
});

modalProceedBtn.addEventListener('click', () => {
    if (checkAge.checked && checkAware.checked && checkTerms.checked) {
        initialModal.style.display = 'none';
        showMainContent();
    } else {
        alert('অনুগ্রহ করে সমস্ত শর্তাবলীতে সম্মত হন।');
    }
});

// Check for existing user on page load and redirect
auth.onAuthStateChanged(user => {
    if (user) {
        window.location.href = 'main.html';
    }
});

// Tab switching logic
loginTabBtn.addEventListener('click', () => {
    loginTabBtn.classList.add('active');
    registerTabBtn.classList.remove('active');
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
});

registerTabBtn.addEventListener('click', () => {
    registerTabBtn.classList.add('active');
    loginTabBtn.classList.remove('active');
    registerForm.style.display = 'block';
    loginForm.style.display = 'none';
});

// Forgot password link
forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    showForgotPasswordPage();
});

backToLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showMainContent();
});

// Login functionality
loginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const email = loginEmailInput.value;
    const password = loginPasswordInput.value;

    if (!email || !password) {
        showErrorModal('দয়া করে ইমেল এবং পাসওয়ার্ড পূরণ করুন।');
        return;
    }

    showLoading();
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            hideLoading();
            showSuccessModal('লগইন সফল! আপনাকে ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে।');
            setTimeout(() => {
                window.location.href = 'main.html';
            }, 1000);
        })
        .catch(error => {
            hideLoading();
            let errorMessage = 'লগইন ব্যর্থ হয়েছে।';
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = 'ভুল ইমেল বা পাসওয়ার্ড।';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'ভুল ইমেল ফরম্যাট।';
            }
            showErrorModal(errorMessage);
        });
});

// Registration functionality
registerBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const fullName = regFullNameInput.value;
    const email = regEmailInput.value;
    const mobile = regMobileInput.value;
    const password = regPasswordInput.value;
    const confirmPassword = regConfirmPasswordInput.value;

    if (!fullName || !email || !mobile || !password || !confirmPassword) {
        showErrorModal('অনুগ্রহ করে সব তথ্য পূরণ করুন।');
        return;
    }

    if (password !== confirmPassword) {
        showErrorModal('পাসওয়ার্ড দুটি মেলে না।');
        return;
    }

    if (password.length < 8) {
        showErrorModal('পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।');
        return;
    }

    if (!termsCheckbox.checked) {
        showErrorModal('অ্যাকাউন্ট তৈরি করতে আপনাকে অবশ্যই নিয়মাবলীতে সম্মত হতে হবে।');
        return;
    }

    showLoading();
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            // Save user info to Firebase Realtime Database
            database.ref('users/' + user.uid).set({
                fullName: fullName,
                email: email,
                mobile: mobile,
                registeredAt: new Date().toISOString()
            }).then(() => {
                hideLoading();
                showSuccessModal('নিবন্ধন সফল! আপনাকে ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে।');
                setTimeout(() => {
                    window.location.href = 'main.html';
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
                errorMessage = 'পাসওয়ার্ডটি খুব দুর্বল। কমপক্ষে ৮ অক্ষরের পাসওয়ার্ড ব্যবহার করুন।';
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
