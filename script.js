let cards = [];
let currentCard = null;


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

    // Hide everything except the word
    document.getElementById("sentence")
        .classList.add("hidden");

    document.getElementById("answer")
        .classList.add("hidden");

    document.getElementById("sentenceTranslation")
        .classList.add("hidden");

    document.getElementById("sentenceButton").textContent =
        "Show Sentence";

    document.getElementById("answerButton").textContent =
        "Show Answer";
}


// Show / hide sentence
document.getElementById("sentenceButton")
    .addEventListener("click", function () {

        const sentence =
            document.getElementById("sentence");

        const translation =
            document.getElementById("sentenceTranslation");

        sentence.classList.toggle("hidden");

        if (sentence.classList.contains("hidden")) {

            this.textContent = "Show Sentence";

            translation.classList.add("hidden");

        } else {

            this.textContent = "Hide Sentence";
        }
    });


// Show / hide answer
document.getElementById("answerButton")
    .addEventListener("click", function () {

        document.getElementById("answer")
            .classList.toggle("hidden");

        document.getElementById("sentenceTranslation")
            .classList.toggle("hidden");

        if (
            document.getElementById("answer")
                .classList.contains("hidden")
        ) {

            this.textContent = "Show Answer";

        } else {

            this.textContent = "Hide Answer";
        }
    });


// Start the app
loadCards();
