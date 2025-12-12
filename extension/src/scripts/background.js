chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: "src/research.html" });
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "ACTIVATE_RESEARCH_MODE") {
    chrome.storage.local.set({ researchMode: true });
    sendResponse({ ok: true });
  }

  if (msg.type === "DEACTIVATE_RESEARCH_MODE") {
    chrome.storage.local.set({ researchMode: false });
    sendResponse({ ok: true });
  }
});
