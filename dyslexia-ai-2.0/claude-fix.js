// popup.js
document.addEventListener("DOMContentLoaded", () => {
  const fontSizeSlider = document.getElementById("fontSize");
  const fontFamilySelect = document.getElementById("fontFamily");
  const summarizeBtn = document.getElementById("summarize-btn");
  const apiKeyInput = document.getElementById("apiKey");
  const saveApiKeyBtn = document.getElementById("save-api-key");
  const statusMessage = document.getElementById("status-message");

  // Load saved API key if it exists
  chrome.storage.sync.get(['openai_api_key'], function(result) {
    if (result.openai_api_key) {
      apiKeyInput.value = result.openai_api_key;
      statusMessage.textContent = "API key loaded";
      statusMessage.className = "status-message success";
    }
  });

  // Style buttons
  document.getElementById("bold").addEventListener("click", () => applyStyle("bold"));
  document.getElementById("italic").addEventListener("click", () => applyStyle("italic"));
  document.getElementById("underline").addEventListener("click", () => applyStyle("underline"));
  document.getElementById("speak").addEventListener("click", () => speak());

  // Font controls
  fontSizeSlider.addEventListener("input", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs.length === 0) return;
      chrome.tabs.sendMessage(tabs[0].id, { 
        action: "changeFontSize", 
        value: fontSizeSlider.value 
      });
    });
  });
  
  fontFamilySelect.addEventListener("change", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs.length === 0) return;
      chrome.tabs.sendMessage(tabs[0].id, { 
        action: "changeFontFamily", 
        value: fontFamilySelect.value 
      });
    });
  });

  // Save API key
  saveApiKeyBtn.addEventListener("click", function() {
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
      statusMessage.textContent = "Please enter an API key";
      statusMessage.className = "status-message error";
      return;
    }
    
    if (!apiKey.startsWith('sk-')) {
      statusMessage.textContent = "Invalid API key format";
      statusMessage.className = "status-message error";
      return;
    }
    
    chrome.storage.sync.set({ 'openai_api_key': apiKey }, function() {
      statusMessage.textContent = "API key saved successfully";
      statusMessage.className = "status-message success";
    });
  });

  // Summarize Text Button with error handling
  summarizeBtn.addEventListener("click", function() {
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
      statusMessage.textContent = "Please enter and save an API key first";
      statusMessage.className = "status-message error";
      return;
    }
    
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs.length === 0) return;
      chrome.tabs.sendMessage(tabs[0].id, { action: "summarizeText" }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error sending summarize request:", chrome.runtime.lastError);
        }
      });
    });
  });
});

function applyStyle(styleType) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return;
    chrome.tabs.sendMessage(tabs[0].id, { 
      action: "applyTextStyle", 
      style: styleType 
    });
  });
}

function speak() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return;
    chrome.tabs.sendMessage(tabs[0].id, { action: "speak" });
  });
}