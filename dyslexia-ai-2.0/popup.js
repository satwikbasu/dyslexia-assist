document.addEventListener("DOMContentLoaded", () => {
  const fontSizeSlider = document.getElementById("fontSize");
  const fontFamilySelect = document.getElementById("fontFamily");

  document.getElementById("bold").addEventListener("click", () => sendMessage("bold"));
  document.getElementById("italic").addEventListener("click", () => sendMessage("italic"));
  document.getElementById("underline").addEventListener("click", () => sendMessage("underline"));
  document.getElementById("speak").addEventListener("click", () => sendMessage("speak"));

  fontSizeSlider.addEventListener("input", () => sendMessage("changeFontSize", fontSizeSlider.value));
  fontFamilySelect.addEventListener("change", () => sendMessage("changeFontFamily", fontFamilySelect.value));
});

function sendMessage(action, value = null) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return;
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      function: modifyContent,
      args: [action, value],
    });
  });
}

function modifyContent(action, value) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  
  const range = selection.getRangeAt(0);
  let selectedText = range.toString().trim();

  if (!selectedText) return;

  if (action === "speak") {
    const utterance = new SpeechSynthesisUtterance(selectedText);
    utterance.lang = "en-US"; // You can change this to other languages
    utterance.rate = 1.0; // Adjust speed (0.5 = slow, 2.0 = fast)
    utterance.pitch = 1.0; // Adjust pitch
    speechSynthesis.speak(utterance);
    return;
  }

  let span = document.createElement("span");
  span.textContent = selectedText;

  let parentElement = selection.focusNode.parentElement;

  if (action === "bold") {
    span.style.fontWeight = parentElement.style.fontWeight === "bold" ? "normal" : "bold";
  } else if (action === "italic") {
    span.style.fontStyle = parentElement.style.fontStyle === "italic" ? "normal" : "italic";
  } else if (action === "underline") {
    span.style.textDecoration = parentElement.style.textDecoration === "underline" ? "none" : "underline";
  } else if (action === "changeFontSize") {
    span.style.fontSize = value + "px";
  } else if (action === "changeFontFamily") {
    span.style.fontFamily = value;
  }

  range.deleteContents();
  range.insertNode(span);
}
