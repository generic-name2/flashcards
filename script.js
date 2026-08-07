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

    document.getElementById("word").textContent =
        currentCard.word;

    document.getElementById("sentence").textContent =
        currentCard.sentence;

    document.getElementById("answer").textContent =
        currentCard.translation;

    document.getElementById("sentenceTranslation").textContent =
        currentCard.sentence_translation;


    // Reset state
    sentenceVisible = false;
    answerVisible = false;

    updateDisplay();
}


// Update everything that is visible
function updateDisplay() {

    const sentence =
        document.getElementById("sentence");

    const sentenceTranslation =
        document.getElementById("sentenceTranslation");

    const answer =
        document.getElementById("answer");


    // Sentences depend on Show Sentence
    if (sentenceVisible) {

        sentence.classList.remove("hidden");
        sentenceTranslation.classList.remove("hidden");

    } else {

        sentence.classList.add("hidden");
        sentenceTranslation.classList.add("hidden");
    }


    // Word translation depends only on Show Answer
    if (answerVisible) {

        answer.classList.remove("hidden");

    } else {

        answer.classList.add("hidden");
    }


    // Update button text
    document.getElementById("sentenceButton").textContent =
        sentenceVisible ? "Hide Sentence" : "Show Sentence";

    document.getElementById("answerButton").textContent =
        answerVisible ? "Hide Answer" : "Show Answer";
}


// Show / hide BOTH sentences
document.getElementById("sentenceButton")
    .addEventListener("click", function () {

        sentenceVisible = !sentenceVisible;

        updateDisplay();
    });


// Show / hide word translation
document.getElementById("answerButton")
    .addEventListener("click", function () {

        answerVisible = !answerVisible;

        updateDisplay();
    });


// Start the app
loadCards();
