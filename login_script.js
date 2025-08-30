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
const auth = firebase.auth();

// DOM elements
const mainContainer = document.getElementById('main-container');
const registerPage = document.getElementById('register-page');
const forgotPasswordPage = document.getElementById('forgot-password-page');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const resetPasswordBtn = document.getElementById('reset-password-btn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const regEmailInput = document.getElementById('reg-email');
const regPasswordInput = document.getElementById('reg-password');
const termsCheckbox = document.getElementById('terms-checkbox');
const resetEmailInput = document.getElementById('reset-email');
const successModal = document.getElementById('success-modal');
const errorModal = document.getElementById('error-modal');
const successMessage = document.getElementById('success-message');
const errorMessage = document.getElementById('error-message');
const loadingSpinner = document.getElementById('loading-spinner');

// Show/Hide UI functions
function showLoading() { loadingSpinner.style.display = 'flex'; }
function hideLoading() { loadingSpinner.style.display = 'none'; }
function showSuccessModal(message) { successMessage.innerText = message; successModal.style.display = 'flex'; }
function showErrorModal(message) { errorMessage.innerText = message; errorModal.style.display = 'flex'; }

// Modal close event listeners
document.getElementById('success-modal-close-btn').addEventListener('click', () => successModal.style.display = 'none');
document.getElementById('error-modal-close-btn').addEventListener('click', () => errorModal.style.display = 'none');

// Toggle Password Visibility
function togglePasswordVisibility(id) {
    const passwordInput = document.getElementById(id);
    const toggleIcon = passwordInput.nextElementSibling.querySelector('i');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// UI Navigation
document.getElementById('register-link').addEventListener('click', (e) => {
    e.preventDefault();
    mainContainer.style.display = 'none';
    registerPage.style.display = 'block';
});
document.getElementById('back-to-login').addEventListener('click', (e) => {
    e.preventDefault();
    registerPage.style.display = 'none';
    mainContainer.style.display = 'block';
});
document.getElementById('forgot-password-link').addEventListener('click', (e) => {
    e.preventDefault();
    mainContainer.style.display = 'none';
    forgotPasswordPage.style.display = 'block';
});
document.getElementById('back-to-login-from-forgot').addEventListener('click', (e) => {
    e.preventDefault();
    forgotPasswordPage.style.display = 'none';
    mainContainer.style.display = 'block';
});

// Firebase Auth Logic
loginBtn.addEventListener('click', () => {
    const email = emailInput.value;
    const password = passwordInput.value;

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
                // Redirect to main.html on successful login
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

registerBtn.addEventListener('click', () => {
    const email = regEmailInput.value;
    const password = regPasswordInput.value;

    if (!email || !password) {
        showErrorModal('দয়া করে ইমেল এবং পাসওয়ার্ড পূরণ করুন।');
        return;
    }
    
    if (!termsCheckbox.checked) {
        showErrorModal('অ্যাকাউন্ট তৈরি করতে আপনাকে অবশ্যই শর্তাবলী ও গোপনীয়তা নীতির সাথে একমত হতে হবে।');
        return;
    }

    showLoading();
    auth.createUserWithEmailAndPassword(email, password)
        .then(() => {
            hideLoading();
            showSuccessModal('নিবন্ধন সফল! আপনাকে ড্যাশবোর্ডে নিয়ে যাওয়া হচ্ছে।');
            setTimeout(() => {
                // Redirect to main.html after successful registration
                window.location.href = 'main.html';
            }, 1000);
        })
        .catch(error => {
            hideLoading();
            let errorMessage = 'নিবন্ধন ব্যর্থ হয়েছে।';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'এই ইমেলটি ইতিমধ্যেই ব্যবহৃত হয়েছে।';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'পাসওয়ার্ডটি খুব দুর্বল। কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড ব্যবহার করুন।';
            }
            showErrorModal(errorMessage);
        });
});

resetPasswordBtn.addEventListener('click', () => {
    const email = resetEmailInput.value;

    if (!email) {
        showErrorModal('দয়া করে আপনার ইমেল লিখুন।');
        return;
    }

    showLoading();
    auth.sendPasswordResetEmail(email)
        .then(() => {
            hideLoading();
            showSuccessModal('আপনার ইমেলে পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে।');
        })
        .catch(error => {
            hideLoading();
            showErrorModal('এই ইমেলটি খুঁজে পাওয়া যায়নি।');
        });
});

// Check for existing user on page load
auth.onAuthStateChanged(user => {
    if (user) {
        // If a user is already logged in, redirect them immediately to main.html
        window.location.href = 'main.html';
    }
});
