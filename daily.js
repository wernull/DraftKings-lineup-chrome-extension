
var dkRegex = /draftkings\.com/;

chrome.browserAction.onClicked.addListener(function(tab){
  if (dkRegex.test(tab.url)) {
    chrome.tabs.executeScript(null, {file: 'jquery.js'});
    chrome.tabs.executeScript(null, {file: 'dk.js'});
  }
});
