document.getElementById("open-research").onclick = () => {
  chrome.tabs.create({ url: "src/research.html" });
};

document.getElementById("research-button").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "ACTIVATE_RESEARCH_MODE" });
});
