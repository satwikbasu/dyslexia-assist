// Add this to your popup.js to better handle API keys and rate limits
// Replace your existing summarize button click handler with this:

// Summarize Text Button with improved error handling
summarizeBtn.addEventListener("click", function() {
  const apiKey = apiKeyInput.value.trim();
  
  if (!apiKey) {
    statusMessage.textContent = "Please enter and save an API key first";
    statusMessage.className = "status-message error";
    return;
  }
  
  // Disable the button to prevent multiple clicks
  summarizeBtn.disabled = true;
  summarizeBtn.textContent = "Processing...";
  
  // Re-enable the button after a timeout (in case of errors)
  setTimeout(() => {
    summarizeBtn.disabled = false;
    summarizeBtn.textContent = "Summarize Text";
  }, 5000);
  
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs.length === 0) {
      summarizeBtn.disabled = false;
      summarizeBtn.textContent = "Summarize Text";
      return;
    }
    
    chrome.tabs.sendMessage(tabs[0].id, { action: "summarizeText" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending summarize request:", chrome.runtime.lastError);
        statusMessage.textContent = "Error: Could not communicate with the page";
        statusMessage.className = "status-message error";
      }
      // Button will be re-enabled by the timeout
    });
  });
});

// Add this function to check API key validity
function checkApiKey(apiKey) {
  if (!apiKey) return false;
  if (!apiKey.startsWith('sk-')) return false;
  if (apiKey.length < 20) return false;
  return true;
}