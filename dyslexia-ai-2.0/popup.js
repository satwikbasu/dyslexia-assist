document.addEventListener("DOMContentLoaded", () => {
  const fontSizeSlider = document.getElementById("fontSize");
  const fontFamilySelect = document.getElementById("fontFamily");

  const buttons = ["bold", "italic", "underline", "speak"];
  const activeStates = {
    bold: false,
    italic: false,
    underline: false,
    speak: false,
  };

  buttons.forEach((btn) => {
    document.getElementById(btn).addEventListener("click", function () {
      activeStates[btn] = !activeStates[btn]; // Toggle state
      this.classList.toggle("active", activeStates[btn]); // Change button UI
      sendMessage(btn, activeStates[btn]); // Send state to content script
    });
  });

  document.getElementById("summarize").addEventListener("click", summarizeText);

  fontSizeSlider.addEventListener("input", () =>
    sendMessage("changeFontSize", fontSizeSlider.value)
  );
  fontFamilySelect.addEventListener("change", () =>
    sendMessage("changeFontFamily", fontFamilySelect.value)
  );
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
    if (value) {
      const utterance = new SpeechSynthesisUtterance(selectedText);
      utterance.lang = "en-US";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      speechSynthesis.speak(utterance);
    } else {
      speechSynthesis.cancel(); // Stop speaking when toggled off
    }
    return;
  }

  // Wrapping selected text with a span and toggling styles
  let span = document.createElement("span");
  span.textContent = selectedText;

  if (action === "bold") {
    span.style.fontWeight = value ? "bold" : "normal";
  } else if (action === "italic") {
    span.style.fontStyle = value ? "italic" : "normal";
  } else if (action === "underline") {
    span.style.textDecoration = value ? "underline" : "none";
  } else if (action === "changeFontSize") {
    span.style.fontSize = value + "px";
  } else if (action === "changeFontFamily") {
    span.style.fontFamily = value;
  }

  range.deleteContents();
  range.insertNode(span);
}

// Function to summarize selected text
function summarizeText() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return;
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        function: summarizeSelectedText,
      },
      (results) => {
        if (results && results[0] && results[0].result) {
          document.getElementById("summaryText").innerText = results[0].result;
          document.getElementById("summaryBox").style.display = "block";
        } else {
          alert("No text selected for summarization.");
        }
      }
    );
  });
}

// Function to summarize text using word frequency-based approach
function summarizeSelectedText() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return "";

  let text = selection.toString().trim();
  if (!text) return "";

  let sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  let wordCounts = {};
  let stopwords = new Set([
    "the",
    "is",
    "in",
    "and",
    "of",
    "to",
    "a",
    "that",
    "it",
    "on",
    "for",
    "with",
    "as",
    "was",
    "at",
    "by",
    "an",
  ]);

  text
    .toLowerCase()
    .split(/\s+/)
    .forEach((word) => {
      word = word.replace(/[^a-zA-Z]/g, ""); // Remove punctuation
      if (word && !stopwords.has(word)) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });

  let sentenceScores = sentences.map((sentence) => {
    let words = sentence.toLowerCase().split(/\s+/);
    let score = words.reduce(
      (sum, word) => sum + (wordCounts[word.replace(/[^a-zA-Z]/g, "")] || 0),
      0
    );
    return { sentence, score };
  });

  sentenceScores.sort((a, b) => b.score - a.score);
  let summary = sentenceScores
    .slice(0, Math.min(3, sentenceScores.length))
    .map((s) => s.sentence)
    .join(" ");

  return summary;
}
