const configs = {
    minWithdrawal: 100,
    processingFee: 5, // in percentage
    referralPercent: 10,
    referralBonusAmount: 100, // this is the amount required for bonus
    rewards: {
        watchVideo: 5.00,
        rewardedPopup: 2.00,
        visitWebsite: 3.00,
        otherTasks: 0.00
    }
};

// This syntax makes the configs object available in main_script.js
window.configs = configs;
