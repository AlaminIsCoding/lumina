// Open the dashboard when the extension icon is clicked
chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({
        url: chrome.runtime.getURL("dashboard/dashboard.html")
    });
});
