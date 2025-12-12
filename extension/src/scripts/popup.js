document.getElementById("open-research").onclick = () => {
  chrome.tabs.create({ url: "src/research.html" });
};
