// Add this code to your content.js to better handle API errors
// This should replace the section where you handle summarizedText and error responses

// When a summarized text is received, either replace the selected text or show a popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // ... [Keep your existing message handlers]

  // When a summarized text is received
  if (request.summarizedText) {
    // Remove loading message if it exists
    const loadingEl = document.getElementById('dyslexia-ai-loading');
    if (loadingEl) {
      loadingEl.remove();
    }
    
    let selection = window.getSelection();
    if (selection.rangeCount > 0 && selection.toString().trim().length > 0) {
      // Replace the selected text with the summary
      let range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(request.summarizedText));
      selection.removeAllRanges();
    } else {
      // Create a styled popup for the summary
      showPopup("Summary", request.summarizedText);
    }
  }
  
  // If there was an error with the API request
  if (request.error) {
    // Remove loading message if it exists
    const loadingEl = document.getElementById('dyslexia-ai-loading');
    if (loadingEl) {
      loadingEl.remove();
    }
    
    // Display a nicer error message
    if (request.error.includes("Rate limit")) {
      showPopup("API Rate Limit Error", 
        "You've reached the OpenAI API rate limit. Please wait a minute before trying again. " +
        "This usually happens when you make too many requests in a short period of time.");
    } else {
      showPopup("Error", request.error);
    }
  }
  
  return true;
});

// Helper function to show popups
function showPopup(title, content) {
  // Remove any existing popups
  const existingPopup = document.getElementById('dyslexia-ai-popup');
  if (existingPopup) {
    existingPopup.remove();
  }
  
  const popup = document.createElement('div');
  popup.id = 'dyslexia-ai-popup';
  popup.style.position = 'fixed';
  popup.style.top = '50%';
  popup.style.left = '50%';
  popup.style.transform = 'translate(-50%, -50%)';
  popup.style.maxWidth = '80%';
  popup.style.maxHeight = '80%';
  popup.style.overflowY = 'auto';
  popup.style.backgroundColor = '#fff';
  popup.style.padding = '20px';
  popup.style.borderRadius = '5px';
  popup.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
  popup.style.zIndex = '9999';
  
  const titleElement = document.createElement('h3');
  titleElement.textContent = title;
  titleElement.style.marginTop = '0';
  
  const contentElement = document.createElement('p');
  contentElement.textContent = content;
  
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.style.marginTop = '15px';
  closeButton.style.padding = '5px 10px';
  closeButton.style.backgroundColor = '#4A90E2';
  closeButton.style.color = 'white';
  closeButton.style.border = 'none';
  closeButton.style.borderRadius = '5px';
  closeButton.style.cursor = 'pointer';
  closeButton.onclick = () => {
    document.body.removeChild(popup);
  };
  
  popup.appendChild(titleElement);
  popup.appendChild(contentElement);
  popup.appendChild(closeButton);
  document.body.appendChild(popup);
}