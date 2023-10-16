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
  const url = 'http://127.0.0.1:5000/analyze';
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

function addUnderlineToUserInput() {
  // Get the tweet input element
  const tweetInput = document.querySelector('[aria-label="Post text"]');

  // If the user starts editing, clear the timer and remove the underline
  if (editing) {
    clearTimeout(typingTimer);
    removeRedUnderline(tweetInput);
  }

  // Start a new timer to add an underline after a 3-second delay
  typingTimer = setTimeout(function() {
    captureInput(tweetInput.innerText);
    styleUserInput(tweetInput);
    editing = false;
  }, 3000);
}

// Function to show the popup
function showPopup(element, message) {
  // Create the popup element
  const popup = document.querySelector(".underline-popup");
  if (!popup) {
    // If the popup element does not exist, create it
    popup = document.createElement("div");
    popup.className = "underline-popup";
    document.body.appendChild(popup);
  }

  // Set the popup message
  popup.innerText = message;

  // Position the popup element below the element that triggered it
  const rect = element.getBoundingClientRect();
  popup.style.top = rect.bottom + "px";
  popup.style.left = rect.left + "px";

  // Display the popup element
  popup.style.display = "block";
}

// Function to hide the popup
function hidePopup() {
  const popup = document.querySelector(".underline-popup");
  if (popup) {
    popup.style.display = "none";
  }
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

// Add an event listener to the tweet input element to listen for mouseover events
document.body.addEventListener("mouseover", function(event) {
  // If the user is hovering over underlined text, show the popup
  if (event.target.style.textDecoration === "underline") {
    showPopup(event.target, "the text contains Profanity"); // Customize the message here
  }
});

// Add an event listener to the document body to listen for mouseout events
document.body.addEventListener("mouseout", function() {
  // Hide the popup when the user moves the mouse out of the popup element
  hidePopup();
});

// Add an underline to the user input after 3 seconds
addUnderlineToUserInput();

// Call the Twitter Capture functions
captureAndStoreInput();

