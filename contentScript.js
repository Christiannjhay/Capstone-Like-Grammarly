


// Function to capture and store an input / Skip empty inputs / Send captured input to the API
function captureInput(inputValue) {
  if (!inputValue.trim()) {
    return;
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
  const url = 'https://capstone-api-wzcr.onrender.com/log';
  const options = {
    method: 'POST',
    mode: 'cors', 
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


// Function to capture Twitter Whats Happening
function captureWhatsHappening() {
  const tweetInput = document.querySelector('[aria-label="Post text"]');
  const tweetButton = event.target.closest('[data-testid="tweetButtonInline"]');

  if (tweetButton) {
    const inputValue = tweetInput.innerText;
    captureInput(inputValue);
   
  }
}

// Function to handle the tweet button click
function onTweetButtonClick() {
  const tweetInput = document.querySelector('[data-testid="tweetTextarea_0"]');
  if (tweetInput) {
    const inputValue = tweetInput.innerText;
   
  }
}


// Add an event listener to capture Twitter Whats Happening
document.body.addEventListener('click', captureWhatsHappening);

// Add an event listener to the tweet post button
const postButton = document.querySelector('[data-testid="tweetButton"]');
if (postButton) {
  postButton.addEventListener('click', onTweetButtonClick);
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

// Function to add an underline to the user input after a delay
let typingTimer;
let editing = false;
let popup;
let sent = false;


// Function to show the popup with a specific message
function showPopup(message) {
  // Create the popup element if it doesn't exist
  if (!popup) {
    popup = document.createElement("div");
    popup.className = "popup";
    popup.style.position = "fixed"; // Fixed position for viewport-centered popup
    popup.style.display = "none";
    document.body.appendChild(popup);

    // Add message container
    const messageContainer = document.createElement("p");
    messageContainer.className = "popupMessage";
    popup.appendChild(messageContainer);

    // Add dislike button
    const dislikeButton = document.createElement("button");
    dislikeButton.innerText = "👎 Dislike";
    dislikeButton.addEventListener("click", () => handleFeedback("dislike"));
    popup.appendChild(dislikeButton);
  }

  // Set the popup message
  const messageContainer = popup.querySelector(".popupMessage");
  messageContainer.innerText = message;

  // Center the popup on the page
  popup.style.left = "40%";
  popup.style.top = "17%";
  popup.style.transform = "translate(-50%, -50%)";

  // Display the popup element
  popup.style.display = "block";

  // Style the popup element as an inline card
  popup.style.border = "1px solid black";
  popup.style.backgroundColor = "gray";
  popup.style.padding = "10px";

  // Add event listener to hide the popup when the mouse wheel is used
  window.addEventListener('wheel', hidePopup);

  // Add delete button
const deleteButton = document.createElement("button");
deleteButton.innerText = "🗑️ Delete";
deleteButton.addEventListener("click", () => handleDelete());
popup.appendChild(deleteButton);

// Function to handle delete
function handleDelete() {
  const tweetInput = document.querySelector('[aria-label="Post text"]');
  if (tweetInput) {
    tweetInput.innerText = ''; // Clear the input field
    clearPopup(); // Hide the popup
    removeRedUnderline(tweetInput); // Remove underline
    clearTimeout(typingTimer); // Reset the typing timer
  }
}
}

// Function to handle user feedback
function handleFeedback() {
  // Capture the input value
  const inputValue = document.querySelector('[aria-label="Post text"]').innerText;

  // If the input is empty, don't send it
  if (!inputValue.trim()) {
    return;
  }

  // Send the captured input to the Python server
  const url = 'https://capstone-api-wzcr.onrender.com/report';
  const options = {
    method: 'POST',
    mode: 'cors', 
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



// Function to hide the popup
function hidePopup() {
  if (popup) {
    popup.style.display = "none";
  }
  
  // Remove the event listener when the popup is hidden to prevent unnecessary calls to hidePopup
  window.removeEventListener('wheel', hidePopup);
}

// Function to update the popup message based on the toxicity score
function updatePopupMessage(highestCategory) {
  let message = "Your text contains " + highestCategory;
  showPopup(message);
}


// Function to send text to your Python API
async function sendToPythonAPI(text) {
  
  const apiUrl = 'https://capstone-api-wzcr.onrender.com/analyze';
  const request = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: text })
  };

  try {
    const response = await fetch(apiUrl, request);
    const data = await response.json();
    
    // Extract the highest category and underline decision from the response.
    const highestCategory = data.highest_category;
    const decision = data.underline_decision;

    if (highestCategory !== undefined) {
      updatePopupMessage(highestCategory);
      return decision; // Return the decision value
    } else {
      console.error('Error: Toxicity score not found in API response');
      return undefined;
    }
  } catch (error) {
    console.error('Error sending data to your Python API:', error);
    return undefined;
  }
}

// Function to add an underline to the user input after a delay
async function addUnderlineToUserInput() {
  const tweetInput = document.querySelector('[aria-label="Post text"]');

  if (editing) {
    clearTimeout(typingTimer);
    removeRedUnderline(tweetInput);
  }

  typingTimer = setTimeout(async function () {
    editing = false;

    if (editing === false) {
      if (tweetInput.innerText.trim() === "") {
        clearPopup(); // Hide the popup when the textfield is empty
      } else {
        // Send the text to your Python API and wait for the response
        sent = true;
        const decision = await sendToPythonAPI(tweetInput.innerText);
        // Call the function with the delay.
        addUnderlineWithDelay(sent, decision);
      }
    }
  }, 3000);

  async function addUnderlineWithDelay(sent, decision) {
    if (sent === true) {
      if (decision >= 0.5) {
        styleUserInput(tweetInput);
        console.log('TOXIC');
        console.log(decision);
      } else {
        console.log('NOT TOXIC');
        console.log(decision);
        hidePopup();
      }
      
    } else {
      console.log('API NOT WORKING');
    }
  }
}


// Function to clear the popup
function clearPopup() {
  const tweetInput = document.querySelector('[aria-label="Post text"]');

  if (popup) {
    hidePopup();
    removeRedUnderline(tweetInput);
  }
}

let typeTimer;
const debounceDelay = 1000; // Adjust the delay as needed
let debounceTimeout;

// Add an event listener to the tweet input element to listen for input events
document.body.addEventListener('input', function (event) {
  const tweetInput = document.querySelector('[aria-label="Post text"]');
  editing = true;
  removeRedUnderline(tweetInput);
  clearTimeout(typeTimer);
  clearTimeout(debounceTimeout);

  debounceTimeout = setTimeout(function () {
    addUnderlineToUserInput(tweetInput.innerText);
  }, debounceDelay);
});

// Add an event listener to the tweet input element to listen for keydown events
document.body.addEventListener('keydown', function (event) {
clearPopup();

const tweetInput = document.querySelector('[aria-label="Post text"]');

removeRedUnderline(tweetInput);
  if (event.key === "Backspace") {
    clearPopup();
    clearTimeout(typingTimer);
  
    typingTimer = setTimeout(function() {
      
      addUnderlineToUserInput();
      console.log("it is working");
    }, 2000);
  
    removeRedUnderline(tweetInput);
    if (tweetInput && tweetInput.innerText.trim() === "") {
      clearPopup(); // Hide the popup when the textfield is empty and Backspace is pressed
      removeRedUnderline(tweetInput);
    }
  }

  // For example, you can hide the popup when the user presses Enter.
  if (event.key === "Enter") {
    clearPopup(); 
  }
});

onTweetButtonClick();
