function modifyContent(action, value) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  let selectedText = range.toString().trim();
  if (!selectedText) return;

  let parentElement = selection.focusNode.parentElement;

  // Toggle Speak functionality
  if (action === "speak") {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel(); // Stop speech if already speaking
    } else {
      const utterance = new SpeechSynthesisUtterance(selectedText);
      utterance.lang = "en-US";
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      speechSynthesis.speak(utterance);
    }
    return;
  }

  // Toggle text styling
  let span = document.createElement("span");
  span.textContent = selectedText;

  let toggleStyle = (property, valueOn, valueOff) => {
    span.style[property] =
      parentElement.style[property] === valueOn ? valueOff : valueOn;
  };

  if (action === "bold") toggleStyle("fontWeight", "bold", "normal");
  if (action === "italic") toggleStyle("fontStyle", "italic", "normal");
  if (action === "underline")
    toggleStyle("textDecoration", "underline", "none");
  if (action === "changeFontSize") span.style.fontSize = value + "px";
  if (action === "changeFontFamily") span.style.fontFamily = value;

  range.deleteContents();
  range.insertNode(span);
}

// Summarize selected text using word frequency
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
  ]);

  text
    .toLowerCase()
    .split(/\s+/)
    .forEach((word) => {
      word = word.replace(/[^a-zA-Z]/g, "");
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
  return sentenceScores
    .slice(0, Math.min(3, sentenceScores.length))
    .map((s) => s.sentence)
    .join(" ");
}
