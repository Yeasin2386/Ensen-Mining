/*
  Grand App - v3 (Final Home)
  Main JavaScript file for the home screen.
  
  Updates:
  - Daily video task reward set to ৳1.00.
  - Manual 15s timer replaced by Ad SDK call.
  
  *** ইউজার রিকুয়েস্ট অনুযায়ী পরিবর্তনসমূহ: ***
  1. টাস্ক লিমিট: হোম এবং টাস্ক পেজ উভয়ের জন্য মোট ২০টি।
  2. হোম পেজ টাস্ক: দিনে একবারই সম্পন্ন করা যাবে (মোট ২০টির মধ্যে)।
  3. পপআপ মেসেজ: আরও প্রফেশনাল এবং স্পষ্ট করা হয়েছে।
  4. ডেইলি রিসেট: রাত ১২টায় স্বয়ংক্রিয় রিসেট।
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

  function getState() {
    const today = new new Date().toDateString();
    
    // Get existing state or set defaults
    let balance = parseFloat(localStorage.getItem(STORE_KEYS.balance)) || 0.00;
    let referrals = parseInt(localStorage.getItem(STORE_KEYS.referrals)) || 0;
    
    let tasksState = JSON.parse(localStorage.getItem(STORE_KEYS.tasks)) || { date: today, completed: 0 };
    let homeTaskDoneState = JSON.parse(localStorage.getItem(STORE_KEYS.homeTaskDone)) || { date: today, done: false };

    // --- Daily Reset Logic (New Day Check) ---
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
    const startVideoBtn = $('[data-action="start-video"]'); // General task button (Task.html and Modal)

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

    // 1. **CRITICAL:** Check the total limit again
    if (state.tasksState.completed >= TASK_LIMIT) {
      alert("দুঃখিত, আপনার আজকের দৈনিক টাস্কের লিমিট শেষ। আগামীকাল আবার চেষ্টা করুন।");
      return;
    }
    
    // 2. **NEW LOGIC:** Check if the task being completed is the HOME TASK
    if (taskType === 'home-daily' && state.homeTaskDoneState.done) {
        alert("আপনি আজকের ডেইলি টাস্কটি একবার সম্পন্ন করেছেন। পরবর্তী টাস্কের জন্য ২৪ ঘণ্টা অপেক্ষা করুন।");
        return;
    }
    
    // 3. Update Balance
    state.balance += TASK_REWARD;
    
    // 4. Update Task Count
    state.tasksState.completed += 1;
    
    // 5. Update Home Task State if applicable
    if (taskType === 'home-daily') {
        state.homeTaskDoneState.done = true;
        state.homeTaskDoneState.date = new Date().toDateString(); // Update date to ensure no immediate re-completion
    }
    
    // 6. Save and Update UI
    saveState(state);
    updateUI(state);

    // Provide professional feedback
    alert(`অসাধারণ! টাস্ক সফলভাবে সম্পন্ন হয়েছে। আপনার অ্যাকাউন্টে ৳${TASK_REWARD.toFixed(2)} যোগ করা হয়েছে।`);
  }
  
  function openModal(id, taskType) {
    const modal = $(`#${id}`);
    if (!modal) return;
    
    let state = getState();
    
    // Check total limit before opening modal
    if (state.tasksState.completed >= TASK_LIMIT) {
        alert("দুঃখিত, আপনার আজকের দৈনিক টাস্কের লিমিট শেষ। আগামীকাল আবার চেষ্টা করুন।");
        return;
    }
    
    // Check home task limit if opening from the home button
    if (taskType === 'home-daily' && state.homeTaskDoneState.done) {
        alert("আপনি আজকের ডেইলি টাস্কটি একবার সম্পন্ন করেছেন। পরবর্তী টাস্কের জন্য ২৪ ঘণ্টা অপেক্ষা করুন।");
        return;
    }
    
    // Attach the task type to the confirm button inside the modal
    const confirmBtn = modal.querySelector('[data-action="confirm-task"]');
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.setAttribute('data-task', taskType || 'video'); // Default to 'video' for task.html, 'home-daily' for index.html
    }

    modal.setAttribute("aria-hidden", "false");
    els.app.setAttribute("aria-hidden", "true");
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.setAttribute("aria-hidden", "true");
    els.app.setAttribute("aria-hidden", "false");
  }


  // Function to simulate ad start and handle completion
  function startMonetagAd(startBtn) {
      const modal = startBtn.closest('.modal');
      startBtn.disabled = true;
      startBtn.textContent = 'বিজ্ঞাপন লোড হচ্ছে...'; // Professional text

      // Simulating the Monetag SDK call (Monetag.show_10002890.showAd())
      // Assuming the SDK is loaded in index.html/task.html head/body
      
      // Safety check for SDK (replace with your actual SDK check if needed)
      if (typeof Monetag === 'undefined' || !Monetag.show_10002890 || typeof Monetag.show_10002890.showAd !== 'function') {
           console.error("Ad SDK is not fully loaded. Retrying...");
           startBtn.disabled = false;
           startBtn.textContent = 'Watch Now';
           alert('বিজ্ঞাপনটি লোড হতে পারেনি। অনুগ্রহ করে আবার চেষ্টা করুন।');
           return;
      }

      // *** Ad SDK Call ***
      Monetag.show_10002890.showAd().then(() => { 
          // Ad finished/closed - Professional alert
          const completeBtn = modal.querySelector('[data-action="confirm-task"]');
          completeBtn.disabled = false;
          alert('বিজ্ঞাপন দেখা সম্পন্ন হয়েছে। এখন "Complete" বাটনে ক্লিক করে টাস্কটি নিশ্চিত করুন।');
      }).catch((error) => {
          // Ad failed to load - Professional alert
          startBtn.disabled = false;
          startBtn.textContent = 'Watch Now';
          console.error('Ad Loading Error:', error);
          alert('বিজ্ঞাপন লোড করার সময় একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
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
      if (startVideoBtn && !startVideoBtn.disabled) startMonetagAd(startVideoBtn);
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
