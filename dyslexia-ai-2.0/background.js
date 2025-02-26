// Modified background.js to handle rate limiting
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // Summarize text (called by the content script)
    if (request.action === "summarizeAI") {
      const apiKey = request.apiKey;
      
      fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You create concise summaries of text while preserving key information."
            },
            {
              role: "user",
              content: `Summarize this content: "${request.text}"`
            }
          ],
          max_tokens: 300
        })
      })
      .then(response => {
        // Check if response is ok before parsing
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please wait a minute before trying again.");
        } else if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.choices && data.choices[0] && data.choices[0].message) {
          // Send the summarized text back to the content script
          chrome.tabs.sendMessage(sender.tab.id, { 
            summarizedText: data.choices[0].message.content.trim() 
          });
        } else {
          const errorMessage = data.error?.message || "Could not summarize text. API error.";
          console.error("API Response Error:", errorMessage);
          chrome.tabs.sendMessage(sender.tab.id, { 
            error: errorMessage
          });
        }
      })
      .catch(error => {
        console.error("Error summarizing text:", error);
        const friendlyMessage = error.message.includes("Rate limit") 
          ? error.message 
          : "Failed to connect to API: " + error.message;
          
        chrome.tabs.sendMessage(sender.tab.id, { 
          error: friendlyMessage
        });
      });
      
      return true; // Indicates async response
    }
  
    // Other handlers remain the same...
    
    return true;
  });