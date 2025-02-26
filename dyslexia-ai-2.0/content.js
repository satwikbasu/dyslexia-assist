// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "changeFontSize") {
    document.body.style.fontSize = request.value + "px"; // Apply font size globally
  } else if (request.action === "changeFontFamily") {
    document.body.style.fontFamily = request.value; // Apply font family globally
  } else if (request.action === "applyTextStyle") {
    const success = styleSelectedText(request.style);
    sendResponse({ success: success });
  } else if (request.action === "summarizeText") {
    const text = getSelectedText();
    if (text) {
      const summary = summarizeText(text);
      console.log("🔹 Original Text:", text);
      console.log("📌 Summarized Text:", summary);
      sendResponse({ success: true, summary: summary });
    } else {
      sendResponse({ success: false, message: "No text selected." });
    }
  }
  return true; // Required for async response
});

// Function to style selected text and log it to console
function styleSelectedText(styleType) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return false;

  const range = selection.getRangeAt(0);
  if (range.collapsed) return false;

  // Get the selected text
  const selectedText = selection.toString();

  // Log selection information to console
  console.log("Selected Text:", selectedText);
  console.log("Selection Length:", selectedText.length);
  console.log("Applied Style:", styleType);

  // Create a span element to wrap the selection
  const span = document.createElement("span");

  // Set the appropriate CSS style
  switch (styleType) {
    case "bold":
      span.style.fontWeight = "bold";
      break;
    case "italic":
      span.style.fontStyle = "italic";
      break;
    case "underline":
      span.style.textDecoration = "underline";
      break;
    default:
      return false;
  }

  try {
    // Extract content and wrap in styled span
    const fragment = range.extractContents();
    span.appendChild(fragment);
    range.insertNode(span);

    console.log(
      "✅ Successfully applied " + styleType + " styling to the selected text"
    );
    selection.removeAllRanges();
    return true;
  } catch (error) {
    console.error("Error applying style:", error);
    return false;
  }
}

// Function to get selected text
function getSelectedText() {
  let selectedText = window.getSelection().toString().trim();
  return selectedText ? selectedText : null;
}

// Text Summarization Function (Extractive)
function summarizeText(text, sentenceCount = 3) {
  let sentences = text.match(/[^.!?]+[.!?]/g) || [text];

  // Word frequency scoring
  let wordFrequency = {};
  sentences.forEach((sentence) => {
    sentence
      .toLowerCase()
      .split(/\s+/)
      .forEach((word) => {
        word = word.replace(/[^a-z]/gi, "");
        if (word) wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      });
  });

  // Score sentences
  let sentenceScores = sentences.map((sentence) => {
    return {
      text: sentence,
      score: sentence
        .toLowerCase()
        .split(/\s+/)
        .reduce(
          (sum, word) =>
            sum + (wordFrequency[word.replace(/[^a-z]/gi, "")] || 0),
          0
        ),
    };
  });

  // Sort by score and pick top N sentences
  return sentenceScores
    .sort((a, b) => b.score - a.score)
    .slice(0, sentenceCount)
    .map((s) => s.text)
    .join(" ");
}

// Log when the extension loads
console.log("Text styling & summarization extension content script loaded.");
