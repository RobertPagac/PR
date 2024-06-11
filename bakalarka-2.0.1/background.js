let isLoggedIn = false;

let isLightMode = false;
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === 'showPasswordDetail') {
        chrome.storage.local.set({ foundWebsite: true });
        chrome.storage.local.set({ un: request.username });
        chrome.storage.local.set({ ws: request.website });
        chrome.storage.local.set({ ps: request.password });
        chrome.storage.local.set({ em: request.email });
        chrome.storage.local.set({ iv: request.iv });
    }
    if (request.action === 'login') {
        isLoggedIn = true;
    } else if (request.action === 'logout') {
        isLoggedIn = false;
    }
});

chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.local.set({ isLoggedIn: isLoggedIn });
    chrome.storage.local.set({ isLightMode: isLightMode });

});

chrome.runtime.onStartup.addListener(function () {
    chrome.storage.local.get(['isLoggedIn'], function (result) {
        isLoggedIn = result.isLoggedIn || false;
    });
    chrome.storage.local.get(['isLightMode'], function (result) {
        isLightMode = result.IsLightMode || false;
    });

    
});
chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.storage.local.set({ foundWebsite: false });
});
