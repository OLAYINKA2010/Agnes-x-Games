// Check login status
const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

const signupNav = document.getElementById("signupNav");
const loginNav = document.getElementById("loginNav");
const logoutNav = document.getElementById("logoutNav");

if (loggedInUser) {
    // User is logged in
    signupNav.style.display = "none";
    loginNav.style.display = "none";
    logoutNav.style.display = "inline-block";
} else {
    // User is logged out
    signupNav.style.display = "inline-block";
    loginNav.style.display = "inline-block";
    logoutNav.style.display = "none";
}

// Hide "Start Free Trial" and "Create Free Account" when logged in
const startTrial = document.getElementById("startTrialBtn");
const createAccount = document.getElementById("createAccountBtn");

if (loggedInUser) {
    if (startTrial) startTrial.style.display = "none";
    if (createAccount) createAccount.style.display = "none";
} else {
    if (startTrial) startTrial.style.display = "inline-block";
    if (createAccount) createAccount.style.display = "inline-block";
}
