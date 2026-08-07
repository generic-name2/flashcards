let cards = [];
let currentCard = null;

let sentenceVisible = false;
let answerVisible = false;


// Load the cards from cards.json
async function loadCards() {

    const response = await fetch("cards.json");

    cards = await response.json();

    showRandomCard();
}


// Choose a random card
function showRandomCard() {

    const randomIndex =
        Math.floor(Math.random() * cards.length);

    currentCard = cards[randomIndex];

    // Question word
    document.getElementById("word").textContent =
        currentCard.word;

    // Question sentence
    document.getElementById("sentence").textContent =
        currentCard.sentence;

    // Answer word
    document.getElementById("answer").textContent =
        currentCard.translation;

    // Answer sentence
    document.getElementById("sentenceTranslation").textContent =
        currentCard.sentence_translation;


    // Reset switches
    sentenceVisible = false;
    answerVisible = false;

    updateDisplay();
}


// Decide what should be visible
function updateDisplay() {

    const sentence =
        document.getElementById("sentence");

    const answer =
        document.getElementById("answer");

    const sentenceTranslation =
        document.getElementById("sentenceTranslation");


    // QS
    // Question sentence is visible only when SS is ON
    if (sentenceVisible) {
        sentence.classList.remove("hidden");
    } else {
        sentence.classList.add("hidden");
    }


    // AW
    // Answer word is visible only when SA is ON
    if (answerVisible) {
        answer.classList.remove("hidden");
    } else {
        answer.classList.add("hidden");
    }


    // AS
    // Answer sentence is visible ONLY when
    // BOTH SS and SA are ON
    if (sentenceVisible && answerVisible) {
        sentenceTranslation.classList.remove("hidden");
    } else {
        sentenceTranslation.classList.add("hidden");
    }


    // Update button labels
    document.getElementById("sentenceButton").textContent =
        sentenceVisible ? "Hide Sentence" : "Show Sentence";

    document.getElementById("answerButton").textContent =
        answerVisible ? "Hide Answer" : "Show Answer";
}


// SS button
document.getElementById("sentenceButton")
    .addEventListener("click", function () {

        sentenceVisible = !sentenceVisible;

        updateDisplay();
    });


// SA button
document.getElementById("answerButton")
    .addEventListener("click", function () {

        answerVisible = !answerVisible;

        updateDisplay();
    });


// Start the app
loadCards();
