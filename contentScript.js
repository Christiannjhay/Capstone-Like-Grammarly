// Function to capture and store an input
function captureInput(inputValue) {
  if (!inputValue.trim()) {
    return; // Skip empty inputs
  }

  // Send the captured input to the Python server
  sendInputToPython(inputValue);

  chrome.storage.local.get({ inputs: [] }, function(result) {
    const storedInputs = result.inputs;
    storedInputs.push(inputValue);
    chrome.storage.local.set({ inputs: storedInputs }, function() {
      if (chrome.runtime.lastError) {
        console.error('Storage error:', chrome.runtime.lastError);
      }
    });
  });
}

// Function to send input to Python for sentiment analysis
function sendInputToPython(inputValue) {
  const url = 'https://capstone-api-wzcr.onrender.com/analyze';
  const options = {
    method: 'POST',
    mode: 'cors',  // Add this line to enable CORS
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: inputValue }),
  };

  fetch(url, options)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Server response:', data);
    })
    .catch(error => {
      console.error('Fetch Error:', error);
    });
}

// Function to capture search input
function captureSearchInput(inputValue) {
  captureInput(inputValue);
}

// Function to style the user input with a red underline
function styleUserInput(inputElement) {
  inputElement.style.textDecoration = 'underline';
  inputElement.style.textDecorationColor = 'purple';
  inputElement.style.textDecorationStyle = 'solid';
  inputElement.style.textDecorationThickness = '3px';
}

// Function to remove the red underline
function removeRedUnderline(inputElement) {
  inputElement.style.textDecoration = 'none';
}


// Capture Twitter Whats Happening
document.body.addEventListener('click', function(event) {
  const tweetButton = event.target.closest('[data-testid="tweetButtonInline"]');
  if (tweetButton) {
    const tweetInput = document.querySelector('[aria-label="Post text"]');
    if (tweetInput) {
      captureInput(tweetInput.innerText);
      styleUserInput(tweetInput);
    }
  }
});

// Capture Twitter Post button and replies
function captureAndStoreInput() {
  const tweetInput = document.querySelector('[data-testid="tweetTextarea_0"]');
  const postButton = document.querySelector('[data-testid="tweetButton"]');
  
  if (tweetInput && postButton) {
    postButton.addEventListener('click', function() {
      const inputValue = tweetInput.innerText;
      captureInput(inputValue);
    });
  }
}



// Function to add an underline to the user input after a delay
let typingTimer;
let editing = false;
let popup;

// Function to show the popup with a specific message
function showPopup(message) {
  // Create the popup element if it doesn't exist
  if (!popup) {
    popup = document.createElement("div");
    popup.className = "popup";
    popup.style.position = "fixed"; // Fixed position for viewport-centered popup
    popup.style.display = "none";
    document.body.appendChild(popup);

    // Add an "X" button to close the popup
    const closeButton = document.createElement("button");
    closeButton.innerText = "X";
    closeButton.addEventListener("click", hidePopup);
    popup.appendChild(closeButton);
  }

  // Set the popup message
  popup.innerText = message;

  // Center the popup on the page
  popup.style.left = "40%";
  popup.style.top = "22%";
  popup.style.transform = "translate(-50%, -50%)";

  // Display the popup element
  popup.style.display = "block";

  // Style the popup element as an inline card
  popup.style.border = "1px solid black";
  popup.style.backgroundColor = "white";
  popup.style.padding = "10px";
}

// Function to hide the popup
function hidePopup() {
  if (popup) {
    popup.style.display = "none";
  }
}

// Function to update the popup message based on the toxicity score
function updatePopupMessage(highestCategory) {
  let message = "Your text contains " + highestCategory;
  showPopup(message);
}

// Function to send text to your Python API
function sendToPythonAPI(text) {
  // Replace with the URL of your Python API endpoint
  const apiUrl = 'https://capstone-api-wzcr.onrender.com/analyze';

  // Create a request to your Python API
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: text })
  };

  // Send the request to your Python API
  fetch(apiUrl, request)
    .then(response => response.json())
    .then(data => {
      
      const highestCategory = data.highest_category; // Extract the highest category from the response
      const sentiment_label = data.sentiment_label; // Extract the highest category from the response

      globalThis.sentiment_label = sentiment_label
      ;
      if (highestCategory !== undefined) {
        updatePopupMessage(highestCategory);
      } else {
        console.error('Error: Toxicity score not found in API response');
      }

    })
    .catch(error => {
      console.error('Error sending data to your Python API:', error);
    });
}

// Function to add an underline to the user input after a delay
function addUnderlineToUserInput() {
  const tweetInput = document.querySelector('[aria-label="Post text"]');
 
  if (editing) {
    clearTimeout(typingTimer);
    removeRedUnderline(tweetInput);
  }

  typingTimer = setTimeout(function() {
    captureInput(tweetInput.innerText);
    styleUserInput(tweetInput);
    editing = false;

    if (editing === false) {
      // Send the text to your Python API
      sendToPythonAPI(tweetInput.innerText);
    }
  }, 3000);
}

// Add an event listener to the tweet input element to listen for keyup events
document.body.addEventListener('keyup', function() {
  editing = true;
  addUnderlineToUserInput();
});

// Add an event listener to the tweet input element to listen for input events
document.body.addEventListener('input', function(event) {
  // If the user is editing, clear the timer and remove the underline
  if (editing) {
    clearTimeout(typingTimer);
    removeRedUnderline(event.target);
    editing = false;
  }
});

// Add an underline to the user input after 3 seconds
addUnderlineToUserInput();

// Call the Twitter Capture functions
captureAndStoreInput();

