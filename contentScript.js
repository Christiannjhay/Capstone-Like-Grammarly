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

// Function to show the popup
function showPopup() {
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
  popup.innerText = "Your text contains profanity";

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

// Function to add an underline to the user input after a delay
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

    // Check if the user has paused typing for 3 seconds
    if (editing === false) {
      // Show the popup only when the user hovers over the underlined text
      tweetInput.addEventListener("mouseover", showPopup);
      tweetInput.addEventListener("mouseout", hidePopup);
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

