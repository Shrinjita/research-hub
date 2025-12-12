chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: "src/research.html" });
});
