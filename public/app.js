import httpStatusList from "./httpStatusList.js";

document.addEventListener("DOMContentLoaded", () => {
  const statusImage = document.getElementById("status-image");
  const correctStatusCode = document.getElementById("correct-status-code");
  const messageInputs = document.querySelectorAll("input[name='message']");
  const descriptionInput = document.getElementById("description");
  const submitButton = document.getElementById("submit");
  const resultElement = document.getElementById("result");

  const trivia = (function () {
    let currentCorrectStatusCode;

    async function loadTrivia() {
      const statusObj = await fetchRandomStatus();
      const messages = await fetchMessages(statusObj);

      statusImage.src = `https://httpstatusdogs.com/img/${statusObj.statusCode}.jpg`;
      correctStatusCode.textContent = statusObj.statusCode;
      messageInputs.forEach((input, index) => {
        input.value = messages[index];
        input.nextElementSibling.textContent = messages[index];
      });

      currentCorrectStatusCode = statusObj.statusCode;
    }

    async function checkSelectedMessage(selectedMessage) {
      const correctStatusDescription = httpStatusList.find(
        (status) => status.statusCode === currentCorrectStatusCode
      ).description;


      return selectedMessage === correctStatusDescription;
    }

    async function getCorrectMessage() {
      const correctStatusDescription = httpStatusList.find(
        (status) => status.statusCode === currentCorrectStatusCode
      ).description;


      return correctStatusDescription;
    }

    return {
      loadTrivia,
      checkSelectedMessage,
      getCorrectMessage
    };
  })();

  submitButton.addEventListener("click", async (event) => {
    event.preventDefault();

  // const selectedMessage = messageInputs.find((input) => input.checked)?.value;
    const selectedMessage = document.querySelector("input[name='message']:checked").nextElementSibling.textContent;
    const userDescription = descriptionInput.value;

    const isMessageCorrect = await trivia.checkSelectedMessage(selectedMessage);
    const correctMessage = await trivia.getCorrectMessage();

    const response = await fetch("/check-description", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        statusCode: parseInt(correctStatusCode.textContent),
        description: userDescription,
      }),
    });

    const { result, furtherDetail, realWorld } = await response.json();

    if (isMessageCorrect && result) {
      resultElement.textContent = "Success!";
    } else {
      resultElement.innerHTML = `Incorrect. The correct message is: "${correctMessage}".`;
    }

    resultElement.innerHTML += `<br>Feedback: ${furtherDetail}`;
    resultElement.innerHTML += `<br>Real World: ${realWorld}`;
  });

  // Inside the DOMContentLoaded event listener, after submitButton event listener
  document.getElementById("roll-again").addEventListener("click", async () => {
    // Clear the description box
    descriptionInput.value = "";

    // Reset radio buttons
    messageInputs.forEach((input) => {
      input.checked = false;
    });

    resultElement.innerHTML = "";
    // Load a new trivia question
    trivia.loadTrivia();
  });

  async function fetchRandomStatus() {
    const randomIndex = Math.floor(Math.random() * httpStatusList.length);
    const randomStatus = httpStatusList[randomIndex];
    return randomStatus;
  }

  async function fetchMessages(statusObj) {
    const messages = [statusObj.description];
    while (messages.length < 4) {
      const randomStatus = httpStatusList[Math.floor(Math.random() * httpStatusList.length)];
      if (!messages.includes(randomStatus.description)) {
        messages.push(randomStatus.description);
      }
    }
    return shuffle(messages);
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  trivia.loadTrivia();
});
