chrome.tabs.onUpdated.addListener(checkForValidUrl);

function checkForValidUrl(tabId, changeInfo, tab){
    if(tab.url.toLowerCase().indexOf("www.jianshu.com/p/")>0){
        chrome.pageAction.show(tabId);
    }
    else{
        chrome.pageAction.hide(tabId);
    }
}