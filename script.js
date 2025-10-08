/*
  Grand App - v3 (Final Home)
  Main JavaScript file for the home screen.
  
  *** আপডেটের সারসংক্ষেপ: ***
  1. টাস্ক লিমিট: হোম এবং টাস্ক পেজ উভয়ের জন্য মোট ২০টি।
  2. হোম পেজ টাস্ক: দিনে একবারই সম্পন্ন করা যাবে (মোট ২০টির মধ্যে)।
  3. পপআপ মেসেজ: আরও প্রফেশনাল এবং স্পষ্ট করা হয়েছে।
  4. ডেইলি রিসেট: রাত ১২টায় স্বয়ংক্রিয় রিসেট।
  5. Ad Loading Logic FIX: বিজ্ঞাপনের SDK লোড হওয়ার সেফটি চেক আরও শক্তিশালী করা হয়েছে।
*/

// Using an IIFE (Immediately Activated Function Expression) to avoid polluting the global scope.
(() => {
  "use strict";

  // --- 1. Helper Functions ---
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

  // --- 2. DOM Element Cache ---
  const els = {
    preloader: $("#preloader"),
    app: $("#app"),
    userName: $("#user-name"),
    userUsername: $("#user-username"),
    userAvatar: $("#user-avatar"),
    balanceAmount: $("#balance-amount"),
    tasksToday: $("#tasks-today"), // Home page stat
    referralsCount: $("#referrals-count"),
    modals: { video: $("#modal-watch-video") },
    homeTaskBtn: $('[data-task-btn]'), // Button on index.html
  };

  // --- 3. State Management & localStorage ---
  const STORE_KEYS = {
    balance: "grand_balance_v3",
    tasks: "grand_tasks_v3",
    referrals: "grand_referrals_v3",
    // New key to track home page task completion for the day
    homeTaskDone: "grand_home_task_done_v3",
  };
  
  const TASK_LIMIT = 20; // মোট দৈনিক টাস্ক লিমিট
  const TASK_REWARD = 1.00;
  const USER_INFO = {
    name: "A. K. Yeasin",
    username: "@yeasinkhan",
    avatar: "image/Gemini_Generated_Image_dcsl0idcsl0idcsl.png",
  };
  
  // Custom alert function (to keep consistency without structural changes)
  function showCustomAlert(message) {
    alert(message);
  }

  function getState() {
    // Current date for daily reset check
    const today = new Date().toDateString();
    
    // Get existing state or set defaults
    let balance = parseFloat(localStorage.getItem(STORE_KEYS.balance)) || 0.00;
    let referrals = parseInt(localStorage.getItem(STORE_KEYS.referrals)) || 0;
    
    let tasksState = JSON.parse(localStorage.getItem(STORE_KEYS.tasks)) || { date: today, completed: 0 };
    let homeTaskDoneState = JSON.parse(localStorage.getItem(STORE_KEYS.homeTaskDone)) || { date: today, done: false };

    // --- Daily Reset Logic (New Day Check) ---
    // If the date changes, reset completed tasks and home task status
    if (tasksState.date !== today) {
      tasksState = { date: today, completed: 0 };
    }
    if (homeTaskDoneState.date !== today) {
      homeTaskDoneState = { date: today, done: false };
    }

    return { balance, referrals, tasksState, homeTaskDoneState };
  }

  function saveState(state) {
    localStorage.setItem(STORE_KEYS.balance, state.balance.toFixed(2));
    localStorage.setItem(STORE_KEYS.referrals, state.referrals);
    localStorage.setItem(STORE_KEYS.tasks, JSON.stringify(state.tasksState));
    localStorage.setItem(STORE_KEYS.homeTaskDone, JSON.stringify(state.homeTaskDoneState));
  }
  
  // --- 4. UI/Data Sync Functions ---

  function updateUI(state) {
    if (els.userName) els.userName.textContent = USER_INFO.name;
    if (els.userUsername) els.userUsername.textContent = USER_INFO.username;
    if (els.userAvatar) els.userAvatar.src = USER_INFO.avatar;

    if (els.balanceAmount) els.balanceAmount.textContent = state.balance.toFixed(2);
    if (els.referralsCount) els.referralsCount.textContent = state.referrals;
    
    // Update Task Counter on Home Page and Task Page
    const taskCounterText = `${state.tasksState.completed}/${TASK_LIMIT}`;
    
    // For Home Page (index.html)
    if (els.tasksToday) {
      els.tasksToday.textContent = taskCounterText;
    }
    
    // For Task Page (task.html)
    const taskLimitDisplay = $("#task-limit-display");
    if (taskLimitDisplay) {
        taskLimitDisplay.textContent = taskCounterText;
    }

    // --- Task completion logic and button state ---
    const isLimitReached = state.tasksState.completed >= TASK_LIMIT;
    const startVideoBtn = $('[data-action="start-video"]'); // General task button (Modal)

    // A. Handle General Task Button (Task.html/Modal)
    if (startVideoBtn) {
        if (isLimitReached) {
            startVideoBtn.disabled = true;
            startVideoBtn.textContent = 'দৈনিক লিমিট শেষ';
        } else {
             startVideoBtn.disabled = false;
             startVideoBtn.textContent = 'Watch Now';
        }
    }
    
    // B. Handle Home Page Daily Task Button (index.html)
    if (els.homeTaskBtn) {
        if (isLimitReached) {
             els.homeTaskBtn.disabled = true;
             els.homeTaskBtn.textContent = 'দৈনিক লিমিট শেষ';
        } else if (state.homeTaskDoneState.done) {
             // Home task completed for today, but general limit not reached
             els.homeTaskBtn.disabled = true;
             els.homeTaskBtn.textContent = 'আজকের ডেইলি টাস্ক সম্পন্ন';
        } else {
             // Home task available
             els.homeTaskBtn.disabled = false;
             els.homeTaskBtn.textContent = 'Watch & Earn';
        }
    }
  }

  // --- 5. Core App Logic ---

  function completeTask(taskType) {
    let state = getState();

    // 1. CRITICAL: Check the total limit again
    if (state.tasksState.completed >= TASK_LIMIT) {
      showCustomAlert("দুঃখিত, আপনার আজকের দৈনিক টাস্কের লিমিট শেষ। আগামীকাল আবার চেষ্টা করুন।");
      return;
    }
    
    // 2. NEW LOGIC: Check if the task being completed is the HOME TASK
    if (taskType === 'home-daily' && state.homeTaskDoneState.done) {
        showCustomAlert("আপনি আজকের ডেইলি টাস্কটি একবার সম্পন্ন করেছেন। পরবর্তী টাস্কের জন্য ২৪ ঘণ্টা অপেক্ষা করুন।");
        return;
    }
    
    // 3. Update Balance
    state.balance += TASK_REWARD;
    
    // 4. Update Task Count (Increments the shared 0/20 limit)
    state.tasksState.completed += 1;
    
    // 5. Update Home Task State if applicable
    if (taskType === 'home-daily') {
        state.homeTaskDoneState.done = true;
        state.homeTaskDoneState.date = new Date().toDateString(); // Ensure date is updated
    }
    
    // 6. Save and Update UI
    saveState(state);
    updateUI(state);

    // Provide professional feedback
    showCustomAlert(`অসাধারণ! টাস্ক সফলভাবে সম্পন্ন হয়েছে। আপনার অ্যাকাউন্টে ৳${TASK_REWARD.toFixed(2)} যোগ করা হয়েছে। 🎉`);
  }
  
  function openModal(id, taskType) {
    const modal = $(`#${id}`);
    if (!modal) return;
    
    let state = getState();
    
    // Check total limit before opening modal
    if (state.tasksState.completed >= TASK_LIMIT) {
        showCustomAlert("দুঃখিত, আপনার আজকের দৈনিক টাস্কের লিমিট শেষ। আগামীকাল আবার চেষ্টা করুন।");
        return;
    }
    
    // Check home task limit if opening from the home button
    if (taskType === 'home-daily' && state.homeTaskDoneState.done) {
        showCustomAlert("আপনি আজকের ডেইলি টাস্কটি একবার সম্পন্ন করেছেন। পরবর্তী টাস্কের জন্য ২৪ ঘণ্টা অপেক্ষা করুন।");
        return;
    }
    
    // Attach the task type to the confirm button inside the modal
    const confirmBtn = modal.querySelector('[data-action="confirm-task"]');
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.setAttribute('data-task', taskType || 'video'); // Pass task type
    }

    modal.setAttribute("aria-hidden", "false");
    els.app.setAttribute("aria-hidden", "true");
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.setAttribute("aria-hidden", "true");
    els.app.setAttribute("aria-hidden", "false");
  }


  // Function to start the Video Ad and handle completion
  function startVideoAd(startBtn) { // Renamed to a generic name
      const modal = startBtn.closest('.modal');
      startBtn.disabled = true;
      startBtn.textContent = 'বিজ্ঞাপন লোড হচ্ছে...'; // Professional text

      // Check if the main Ad SDK object is loaded (using Monetag as the internal reference)
      if (typeof Monetag === 'undefined') {
           startBtn.disabled = false;
           startBtn.textContent = 'Watch Now';
           showCustomAlert('বিজ্ঞাপন সিস্টেম এখনও লোড হয়নি। অনুগ্রহ করে পেজটি রিফ্রেশ করে আবার চেষ্টা করুন।');
           console.error("Ad SDK is not loaded.");
           return;
      }
      
      // Check if the specific ad unit method is available
      const adUnit = Monetag.show_10002890;
      if (!adUnit || typeof adUnit.showAd !== 'function') {
           startBtn.disabled = false;
           startBtn.textContent = 'Watch Now';
           showCustomAlert('এই মুহূর্তে কোনো বিজ্ঞাপন নেই। আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন অথবা কিছুক্ষন পরে আবার চেষ্টা করুন।');
           console.error("Ad unit (show_10002890) is not ready.");
           return;
      }

      // *** Ad SDK Call ***
      adUnit.showAd().then(() => { 
          // Ad finished/closed - Professional alert
          const completeBtn = modal.querySelector('[data-action="confirm-task"]');
          completeBtn.disabled = false;
          showCustomAlert('বিজ্ঞাপন দেখা সম্পন্ন হয়েছে। এখন "Complete" বাটনে ক্লিক করে টাস্কটি নিশ্চিত করুন। ✅');
      }).catch((error) => {
          // Ad failed to load - Professional alert
          startBtn.disabled = false;
          startBtn.textContent = 'Watch Now';
          console.error('Video Ad Loading Error:', error);
          showCustomAlert('দুঃখিত, এই মুহূর্তে বিজ্ঞাপন লোড করা সম্ভব হয়নি। দয়া করে কয়েক সেকেন্ড পরে আবার চেষ্টা করুন। 😔');
      });
  }


  // --- 6. Event Listeners ---
  
  function bindEvents() {
    document.addEventListener("click", (e) => {
      const openModalBtn = e.target.closest("[data-open-modal]");
      if (openModalBtn) {
          // Pass the task-type if available, e.g., from the home page button
          const taskType = openModalBtn.dataset.taskType; 
          openModal(openModalBtn.dataset.openModal, taskType);
      }
      
      const closeModalBtn = e.target.closest("[data-close-modal]");
      if (closeModalBtn) closeModal(closeModalBtn.closest(".modal"));
      
      const confirmBtn = e.target.closest('[data-action="confirm-task"]');
      if (confirmBtn && !confirmBtn.disabled) {
        completeTask(confirmBtn.dataset.task);
        closeModal(confirmBtn.closest(".modal"));
      }

      const startVideoBtn = e.target.closest('[data-action="start-video"]');
      if (startVideoBtn && !startVideoBtn.disabled) startVideoAd(startVideoBtn); // Updated function call
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const activeModal = $('[aria-hidden="false"].modal');
        if (activeModal) closeModal(activeModal);
      }
    });
  }
  
  // --- 7. Initialization ---
  
  function init() {
    // Hide preloader
    if (els.preloader) els.preloader.classList.add("hidden");
    if (els.app) els.app.setAttribute("aria-hidden", "false");

    // Load and render initial data
    const initialState = getState();
    updateUI(initialState);
    bindEvents();
  }
  
  document.addEventListener("DOMContentLoaded", init);

})();
