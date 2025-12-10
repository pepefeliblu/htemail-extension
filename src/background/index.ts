console.log('HTEMAIL Background Script Loaded');

chrome.runtime.onInstalled.addListener(() => {
    console.log('HTEMAIL Extension Installed');
});
