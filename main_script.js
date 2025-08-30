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

// Check if a user is logged in
auth.onAuthStateChanged(user => {
    if (!user) {
        // If no user is logged in, redirect to the login page
        window.location.href = 'index.html';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Tab switching logic
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;

            // Remove 'active' class from all buttons and content
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.style.display = 'none');

            // Add 'active' class to the clicked button and show the corresponding content
            button.classList.add('active');
            document.getElementById(`${targetTab}-tab-content`).style.display = 'block';
        });
    });

    // Logout Modal Logic
    const logoutBtn = document.getElementById('logout-btn');
    const logoutModal = document.getElementById('logout-modal');
    const cancelLogoutBtn = document.getElementById('cancel-logout');
    const confirmLogoutBtn = document.getElementById('confirm-logout');
    const loadingSpinner = document.getElementById('loading-spinner');

    logoutBtn.addEventListener('click', () => {
        logoutModal.style.display = 'flex';
    });

    cancelLogoutBtn.addEventListener('click', () => {
        logoutModal.style.display = 'none';
    });

    confirmLogoutBtn.addEventListener('click', () => {
        logoutModal.style.display = 'none';
        loadingSpinner.style.display = 'flex';
        
        auth.signOut().then(() => {
            // Redirect to login page after successful sign out
            window.location.href = 'index.html';
        }).catch((error) => {
            // Handle errors here
            loadingSpinner.style.display = 'none';
            alert("Error signing out: " + error.message);
        });
    });
});
