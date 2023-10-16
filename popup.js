// popup.js
document.addEventListener("DOMContentLoaded", function () {
  chrome.storage.local.get({ inputs: [] }, result => {
    const storedInputs = result.inputs;
    const inputList = document.getElementById("inputList");
    storedInputs.forEach(input => {
      const listItem = document.createElement("li");
      listItem.textContent = input;
      inputList.appendChild(listItem);
    });
  });

  const clearButton = document.getElementById("clearButton");
  clearButton.addEventListener("click", () => {
    chrome.storage.local.set({ inputs: [] }, () => {
      const inputList = document.getElementById("inputList");
      inputList.innerHTML = ""; // Clear the list of inputs
    });
  });
});
