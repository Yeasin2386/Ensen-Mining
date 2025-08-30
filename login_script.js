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

// Check for existing user on page load and redirect
auth.onAuthStateChanged(user => {
    if (user) {
        window.location.href = 'main.html';
    }
});

// DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    const mainContainer = document.getElementById('main-container');
    const registerPage = document.getElementById('register-page');
    const forgotPasswordPage = document.getElementById('forgot-password-page');
    const registerLink = document.getElementById('register-link');
    const backToLoginBtn = document.getElementById('back-to-login');
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const backToLoginFromForgotBtn = document.getElementById('back-to-login-from-forgot');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const resetPasswordBtn = document.getElementById('reset-password-btn');

    registerLink.addEventListener('click', function(e) {
        e.preventDefault();
        mainContainer.style.display = 'none';
        registerPage.style.display = 'block';
    });

    backToLoginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        registerPage.style.display = 'none';
        mainContainer.style.display = 'block';
    });

    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        mainContainer.style.display = 'none';
        forgotPasswordPage.style.display = 'flex';
    });

    backToLoginFromForgotBtn.addEventListener('click', function(e) {
        e.preventDefault();
        forgotPasswordPage.style.display = 'none';
        mainContainer.style.display = 'block';
    });
    
    // This is the new, crucial part of the code
    loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                window.location.href = 'main.html';
            })
            .catch(error => {
                alert(error.message);
            });
    });

    registerBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;
        const termsCheckbox = document.getElementById('terms-checkbox');
        
        if (termsCheckbox.checked) {
             auth.createUserWithEmailAndPassword(email, password)
                .then(() => {
                    window.location.href = 'main.html';
                })
                .catch(error => {
                    alert(error.message);
                });
        } else {
            alert('You must agree to the terms of service to create an account.');
        }
    });

    resetPasswordBtn.addEventListener('click', function(e) {
        e.preventDefault();
        const email = document.getElementById('reset-email').value;
        
        auth.sendPasswordResetEmail(email)
            .then(() => {
                alert('Password reset email sent!');
            })
            .catch(error => {
                alert(error.message);
            });
    });
});

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
