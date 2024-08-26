chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(error => console.error('Error setting panel behavior:', error));

let tabId_global = null;

// window.addEventListener('message', function(event) {
//   if (event.data.action === 'docSelected') {
//     const docUrl = event.data.url;
//     console.log('Document URL:', docUrl);
//     // Optionally do something with the URL, like open it or store it
//     window.location.href = docUrl;  // This opens the document URL
//   }
// });



chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith("https://docs.google.com/document/")) {
    console.log("Tab URL matched:", tab.url);
    console.log("Setting tabId_global:", tabId);
    tabId_global = tabId;
  } else {
    console.log("Tab URL did not match or is incomplete:", tab.url);
  }
});


// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   console.log('background.js received message:', request);
//   if (request.action === "getUrl") {
//     chrome.scripting.executeScript({
//       target: { tabId: sender.tab.id },
//       function: () => {
//         return localStorage.getItem('selectedFileUrl');
//       }
//     }, (injectionResults) => {
//       if (injectionResults && injectionResults[0].result) {
//         sendResponse({ url: injectionResults[0].result });
//       } else {
//         sendResponse({ url: null });
//       }
//     });
//     return true; // Indicates that the response will be sent asynchronously
//   } if (request.action === "openUrl") {
//     chrome.windows.create({
//       url: request.url,
//       type: "popup",  // 'popup' type to avoid standard window features
//       width: 800,
//       height: 600
//     });
//   }

//   if (request.action === "docSelected") {
//     console.log("Document URL:", request.url);
//     // Use the URL as needed in your extension
//   }
// });


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Sender:', sender);
  console.log('Message:', message);
  if (tabId_global === null) {
    console.error('Tab ID is not set');
    return;
  }

  if (message.action === "startTyping") {
    console.log('Starting typing on tabId:', tabId_global);
    chrome.scripting.executeScript({
      target: { tabId: tabId_global },
      function: injectScript,
      args: [
        message.text,
        message.typingSpeed,
        message.mistakeRate,
        message.correctionSpeed,
        message.breakTime,
        message.breakInterval,
      ],
    }).catch(error => console.error('Error executing script:', error));
  }

  if (message.action === "googleDocs") {
    console.log('Executing Google Docs script on tabId:', tabId_global);
    chrome.scripting.executeScript({
      target: { tabId: tabId_global },
      function: googleDocs,
    }).catch(error => console.error('Error executing Google Docs script:', error));
  }
});

function googleDocs() {
  console.log("googleDocs called");

  // Your existing googleDocs code here...
}

function injectScript(
  text,
  typingSpeed,
  mistakeRate,
  correctionSpeed,
  breakTime,
  breakInterval
) {
  async function simulateTyping(inputElement, char, delay) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let eventObj;
        if (char === "\n") {
          eventObj = new KeyboardEvent("keydown", {
            bubbles: true,
            key: "Enter",
            code: "Enter",
            keyCode: 13,
            which: 13,
            charCode: 13,
          });
        } else {
          eventObj = new KeyboardEvent("keypress", {
            bubbles: true,
            key: char,
            charCode: char.charCodeAt(0),
            keyCode: char.charCodeAt(0),
            which: char.charCodeAt(0),
          });
        }
        inputElement.dispatchEvent(eventObj);
        resolve();
      }, delay);
    });
  }

  async function typeStringWithRandomDelay(inputElement, string) {
    const lowerBoundValue = 6000 / typingSpeed;
    const upperBoundValue = lowerBoundValue * 0.8;
    let wordCount = 0;
    let mistakeCount = 0;

    for (let i = 0; i < string.length; i++) {
      const char = string[i];
      const randomDelay =
        Math.floor(Math.random() * (upperBoundValue - lowerBoundValue + 1)) +
        lowerBoundValue;

      if (wordCount >= breakInterval) {
        wordCount = 0;
        await new Promise((resolve) => setTimeout(resolve, breakTime * 60000));
      }

      if (mistakeCount < mistakeRate && wordCount % mistakeRate === 0) {
        const typoChar = String.fromCharCode(char.charCodeAt(0) + 1);
        await simulateTyping(inputElement, typoChar, randomDelay);
        await simulateTyping(inputElement, "\b", randomDelay / correctionSpeed);
        mistakeCount++;
      }

      await simulateTyping(inputElement, char, randomDelay);
      if (char === " " || char === "\n") wordCount++;

      if (i % 5 === 0) {
        chrome.runtime.sendMessage({ progress: (i / string.length) * 100 });
      }
    }
  }

  const iframe = document.querySelector(".docs-texteventtarget-iframe");
  if (iframe) {
    const input = iframe.contentDocument.activeElement;
    typeStringWithRandomDelay(input, text);
  } else {
    console.error("Input element not found.");
  }
}
