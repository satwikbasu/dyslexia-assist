// Content script for Chrome extension that applies styling to selected text
// and logs the selected text to the console

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "changeFontSize") {
    document.body.style.fontSize = request.value + "px"; // Apply font size globally
  } else if (request.action === "changeFontFamily") {
    document.body.style.fontFamily = request.value; // Apply font family globally
  } else if (request.action === "applyTextStyle") {
    const success = styleSelectedText(request.style);
    sendResponse({ success: success });
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

    // Log success message
    console.log(
      "✅ Successfully applied " + styleType + " styling to the selected text"
    );

    // Clear selection
    selection.removeAllRanges();

    return true;
  } catch (error) {
    console.error("Error applying style:", error);

    // Fallback approach if the main approach fails
    try {
      // Create a unique class for this styling
      const uniqueClass = "extension-style-" + Date.now();

      // Add a style tag to the document head
      const styleTag = document.createElement("style");
      styleTag.textContent = `.${uniqueClass} { 
        ${getCSSPropertyForStyle(styleType)}
      }`;
      document.head.appendChild(styleTag);

      // Create a wrapper with the unique class
      const wrapper = document.createElement("span");
      wrapper.className = uniqueClass;

      // Wrap selection with the styled span
      const clone = range.cloneContents();
      wrapper.appendChild(clone);
      range.deleteContents();
      range.insertNode(wrapper);

      // Log success message for fallback method
      console.log(
        "✅ Successfully applied " +
          styleType +
          " styling using fallback method"
      );

      return true;
    } catch (fallbackError) {
      console.error("Fallback approach also failed:", fallbackError);
      return false;
    }
  }
}

// Helper function to get CSS property based on style type
function getCSSPropertyForStyle(styleType) {
  switch (styleType) {
    case "bold":
      return "font-weight: bold !important;";
    case "italic":
      return "font-style: italic !important;";
    case "underline":
      return "text-decoration: underline !important;";
    default:
      return "";
  }
}

// Log when the extension loads
console.log(
  "Text styling extension content script loaded. Select text and use the extension buttons to format it."
);
