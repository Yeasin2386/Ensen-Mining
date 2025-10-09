/*
  Grand App - v3 (Final Home)
  Main JavaScript file for the home screen.
  
  *** আপডেটের সারসংক্ষেপ: ***
  1. Monetag Integration FIX: Rewarded Interstitial (show_10002890) কল লজিক আপডেট করা হয়েছে।
  2. Reward Automation: অ্যাড দেখা শেষ হলে "Complete" বাটনে ক্লিক করার দরকার নেই, স্বয়ংক্রিয়ভাবে পুরষ্কার যোগ হবে।
  3. UI Cleanup: মডাল থেকে অপ্রয়োজনীয় 'Confirm Task' বাটন লজিক মুছে ফেলা হয়েছে।
  
  *** আপনার সমস্যার সমাধান (Modified Code): ***
  - startVideoAd: এখন সরাসরি show_10002890() কল করে এবং .then() এ completeTask() কল করে।
  - openModal/bindEvents: 'confirm-task' লজিক বাদ দেওয়া হয়েছে।
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
    homeTaskBtn: $('[data-task-type="home-daily"]'), 
  };

  // --- 3. State Management & localStorage ---
  const STORE_KEYS = {
    balance: "grand_balance_v3",
    tasks: "grand_tasks_v3",
    referrals: "grand_referrals_v3",
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
    const today = new Date().toDateString();
    
    let balance = parseFloat(localStorage.getItem(STORE_KEYS.balance)) || 0.00;
    let referrals = parseInt(localStorage.getItem(STORE_KEYS.referrals)) || 0;
    
    let tasksState = JSON.parse(localStorage.getItem(STORE_KEYS.tasks)) || { date: today, completed: 0 };
    let homeTaskDoneState = JSON.parse(localStorage.getItem(STORE_KEYS.homeTaskDone)) || { date: today, done: false };

    // --- Daily Reset Logic ---
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
    const taskGoButtons = $$('.task-card[data-task-id="watch-video"] .btn-go');
    const homeTaskBtn = els.homeTaskBtn;

    // Handle home page specific button
    if (homeTaskBtn) {
        const isHomeTaskDone = state.homeTaskDoneState.done;
        
        if (isLimitReached) {
            homeTaskBtn.disabled = true;
            homeTaskBtn.textContent = 'দৈনিক লিমিট শেষ';
        } else if (isHomeTaskDone) {
             homeTaskBtn.disabled = true;
             homeTaskBtn.textContent = 'আজকের ডেইলি টাস্ক সম্পন্ন';
        } else {
             homeTaskBtn.disabled = false;
             homeTaskBtn.textContent = 'Watch & Earn';
        }
    }

    // Handle task page buttons (using the generic selector)
    taskGoButtons.forEach(btn => {
        // Only apply logic to buttons that are NOT the home page button
        const isHomeTask = btn.dataset.taskType === 'home-daily';
        
        if (isLimitReached) {
            btn.disabled = true;
            btn.textContent = 'দৈনিক লিমিট শেষ';
        } else if (isHomeTask && state.homeTaskDoneState.done) {
             btn.disabled = true;
             btn.textContent = 'আজকের ডেইলি টাস্ক সম্পন্ন';
        } else {
             btn.disabled = false;
             btn.textContent = isHomeTask ? 'Watch & Earn' : 'Go';
        }
    });
    
  }

  // --- 5. Core App Logic ---

  function completeTask(taskType) {
    let state = getState();

    // 1. CRITICAL: Check the total limit again
    if (state.tasksState.completed >= TASK_LIMIT) {
      // Alert is already given in startVideoAd's initial check, but for safety:
      showCustomAlert("দুঃখিত, আপনার আজকের দৈনিক টাস্কের লিমিট শেষ।");
      return;
    }
    
    // 2. Check if the task being completed is the HOME TASK
    if (taskType === 'home-daily' && state.homeTaskDoneState.done) {
        // Alert is already given in startVideoAd's initial check, but for safety:
        showCustomAlert("আপনি আজকের ডেইলি টাস্কটি একবার সম্পন্ন করেছেন।");
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
    // This alert is now triggered only on successful reward
    showCustomAlert(`অসাধারণ! টাস্ক সফলভাবে সম্পন্ন হয়েছে। আপনার অ্যাকাউন্টে ৳${TASK_REWARD.toFixed(2)} যোগ করা হয়েছে। 🎉`);
  }
  
  function openModal(id, taskType) {
    const modal = $(`#${id}`);
    if (!modal) return;
    
    let state = getState();
    
    // Pre-check limits before opening modal
    if (state.tasksState.completed >= TASK_LIMIT) {
        showCustomAlert("দুঃখিত, আপনার আজকের দৈনিক টাস্কের লিমিট শেষ। আগামীকাল আবার চেষ্টা করুন।");
        return;
    }
    
    if (taskType === 'home-daily' && state.homeTaskDoneState.done) {
        showCustomAlert("আপনি আজকের ডেইলি টাস্কটি একবার সম্পন্ন করেছেন। পরবর্তী টাস্কের জন্য ২৪ ঘণ্টা অপেক্ষা করুন।");
        return;
    }
    
    // Get the start button inside the modal
    const startBtn = modal.querySelector('[data-action="start-video"]');
    
    if (startBtn) {
        startBtn.disabled = false;
        startBtn.textContent = 'Watch Now';
        // Pass the task type to the start button for use in startVideoAd
        startBtn.setAttribute('data-task', taskType || 'video'); 
    }
    
    // IMPORTANT: Hide the old 'Confirm' button as reward is now automatic
    const confirmBtn = modal.querySelector('[data-action="confirm-task"]');
    if(confirmBtn) confirmBtn.style.display = 'none'; 

    modal.setAttribute("aria-hidden", "false");
    els.app.setAttribute("aria-hidden", "true");
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.setAttribute("aria-hidden", "true");
    els.app.setAttribute("aria-hidden", "false");
    
    // Reset modal button state when closing
    const startBtn = modal.querySelector('[data-action="start-video"]');
    if (startBtn) {
        startBtn.disabled = false;
        startBtn.textContent = 'Watch Now';
    }
  }


  // Function to start the Video Ad and handle completion (UPDATED FOR MONETAG show_10002890)
  function startVideoAd(startBtn) {
      const modal = startBtn.closest('.modal');
      const taskType = startBtn.dataset.task; // Get task type

      // Check limits again just in case
      let state = getState();
      if (state.tasksState.completed >= TASK_LIMIT || (taskType === 'home-daily' && state.homeTaskDoneState.done)) {
          startBtn.disabled = false;
          startBtn.textContent = 'Watch Now';
          showCustomAlert("দুঃখিত, আপনার আজকের দৈনিক টাস্কের লিমিট শেষ।");
          return;
      }
      
      startBtn.disabled = true;
      startBtn.textContent = 'বিজ্ঞাপন লোড হচ্ছে...'; 

      // Check if the Monetag Rewarded Interstitial function is available
      if (typeof show_10002890 !== 'function') {
           startBtn.disabled = false;
           startBtn.textContent = 'Watch Now';
           showCustomAlert('বিজ্ঞাপন সিস্টেম এখনও লোড হয়নি। অনুগ্রহ করে পেজটি রিফ্রেশ করে আবার চেষ্টা করুন।');
           console.error("Monetag SDK function show_10002890 is not available.");
           return;
      }
      
      // *** Ad SDK Call ***
      show_10002890().then(() => { 
          // 1. Reward the user directly (Ad finished successfully)
          completeTask(taskType); 
          
          startBtn.textContent = 'টাস্ক সম্পন্ন হলো! 🎉'; // Temporary feedback on the button
          
          // 2. Close the modal after a short delay for final feedback
          setTimeout(() => {
             closeModal(modal);
          }, 1500); 
          
      }).catch((error) => {
          // Ad failed to load (no reward given)
          startBtn.disabled = false;
          startBtn.textContent = 'Watch Now';
          console.error('Video Ad Loading Error:', error);
          showCustomAlert('দুঃখিত, এই মুহূর্তে বিজ্ঞাপন লোড করা সম্ভব হয়নি। দয়া করে কয়েক সেকেন্ড পরে আবার চেষ্টা করুন। 😔');
      });
  }


  // --- 6. Event Listeners ---
  
  function bindEvents() {
    document.addEventListener("click", (e) => {
      // 1. OPEN MODAL
      const openModalBtn = e.target.closest("[data-open-modal]");
      if (openModalBtn) {
          const taskType = openModalBtn.dataset.taskType; 
          openModal(openModalBtn.dataset.openModal, taskType);
      }
      
      // 2. CLOSE MODAL
      const closeModalBtn = e.target.closest("[data-close-modal]");
      if (closeModalBtn) closeModal(closeModalBtn.closest(".modal"));
      
      // 3. START VIDEO AD
      const startVideoBtn = e.target.closest('[data-action="start-video"]');
      if (startVideoBtn && !startVideoBtn.disabled) startVideoAd(startVideoBtn);
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

// ... তোমার আগের কোড অপরিবর্তিত থাকবে ... 

(() => {
  "use strict";

  // --- 1. Helper Functions ---
  const $ = (selector, parent = document) => parent.querySelector(selector);

  // শুধুমাত্র নাম, user-username বাদ
  const USER_INFO = {
    name: "A. K. Yeasin" // এখানে ইউজারের নাম বসাও
  };

  // initials avatar generator
  function getInitials(name) {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  }

  // --- 4. UI/Data Sync Functions ---
  function updateUI(state) {
    const userNameEl = $("#user-name");
    if (userNameEl) userNameEl.textContent = USER_INFO.name;

    // initials avatar বসাও
    const avatarEl = $("#avatar-circle");
    if (avatarEl) avatarEl.textContent = getInitials(USER_INFO.name);

    // ... আগের কোড (ব্যালেন্স, টাস্ক, রেফারেল ইত্যাদি) ...
    const balanceAmount = $("#balance-amount");
    if (balanceAmount) balanceAmount.textContent = state.balance.toFixed(2);
    const referralsCount = $("#referrals-count");
    if (referralsCount) referralsCount.textContent = state.referrals;
    const tasksToday = $("#tasks-today");
    if (tasksToday) tasksToday.textContent = `${state.tasksState.completed}/${20}`;
  }

  // ... আগের কোড অপরিবর্তিত ...
})();
