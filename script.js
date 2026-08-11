let cards = [];

let currentCard = null;

let sentenceVisible = false;

let answerVisible = false;


// ========================================
// LOAD CARDS
// ========================================

async function loadCards() {

    const response =
        await fetch("cards.json");

    cards =
        await response.json();

    showNextCard();
}


// ========================================
// GET SAVED PROGRESS
// ========================================

function getProgress() {

    const saved =
        localStorage.getItem("flashcardProgress");

    if (saved) {

        return JSON.parse(saved);

    }

    return {};
}


// ========================================
// SAVE PROGRESS
// ========================================

function saveProgress(progress) {

    localStorage.setItem(
        "flashcardProgress",
        JSON.stringify(progress)
    );
}


// ========================================
// FIND AVAILABLE CARDS
// ========================================

function getAvailableCards() {

    const progress =
        getProgress();

    const now =
        Date.now();


    return cards.filter(function(card) {

        const cardProgress =
            progress[card.id];


        // Never reviewed = new card
        if (!cardProgress) {

            return true;
        }


        // Reviewed card:
        // available only when due

        return cardProgress.due <= now;

    });
}


// ========================================
// FIND NEXT CARD
// ========================================

function showNextCard() {

    const availableCards =
        getAvailableCards();


    // ------------------------------------
    // Cards are available
    // ------------------------------------

    if (availableCards.length > 0) {

        const randomIndex =
            Math.floor(
                Math.random() *
                availableCards.length
            );


        const selectedCard =
            availableCards[randomIndex];


        displayCard(selectedCard);

        return;
    }


    // ------------------------------------
    // Nothing is available right now
    // ------------------------------------

    showNothingDue();
}


// ========================================
// DISPLAY A CARD
// ========================================

function displayCard(card) {

    currentCard =
        card;


    // Question word

    document.getElementById("word")
        .textContent =
        currentCard.word;


    // Question sentence

    document.getElementById("sentence")
        .textContent =
        currentCard.sentence;


    // Answer word

    document.getElementById("answer")
        .textContent =
        currentCard.translation;


    // Answer sentence

    document.getElementById(
        "sentenceTranslation"
    ).textContent =
        currentCard.sentence_translation;


    // Reset visibility

    sentenceVisible = false;

    answerVisible = false;


    updateDisplay();

    updateProgressDisplay();


    // Hide review buttons

    document.getElementById(
        "reviewButtons"
    ).classList.add("hidden");
}


// ========================================
// NOTHING DUE
// ========================================

function showNothingDue() {

    currentCard = null;


    document.getElementById("word")
        .textContent =
        "Nothing due right now";


    document.getElementById("sentence")
        .textContent =
        "";


    document.getElementById("answer")
        .textContent =
        "";


    document.getElementById(
        "sentenceTranslation"
    ).textContent =
        "";


    document.getElementById(
        "sentence"
    ).classList.add("hidden");


    document.getElementById(
        "answer"
    ).classList.add("hidden");


    document.getElementById(
        "sentenceTranslation"
    ).classList.add("hidden");


    document.getElementById(
        "reviewButtons"
    ).classList.add("hidden");


    document.getElementById(
        "progressInfo"
    ).innerHTML =
        "No cards are due right now.";


    document.getElementById(
        "debugInfo"
    ).innerHTML =
        "The scheduler is waiting for the next due card.";
}


// ========================================
// UPDATE DISPLAY
// ========================================

function updateDisplay() {

    const sentence =
        document.getElementById("sentence");

    const answer =
        document.getElementById("answer");

    const sentenceTranslation =
        document.getElementById(
            "sentenceTranslation"
        );


    // ------------------------------------
    // Question sentence
    // ------------------------------------

    if (sentenceVisible) {

        sentence.classList.remove("hidden");

    } else {

        sentence.classList.add("hidden");
    }


    // ------------------------------------
    // Answer word
    // ------------------------------------

    if (answerVisible) {

        answer.classList.remove("hidden");

    } else {

        answer.classList.add("hidden");
    }


    // ------------------------------------
    // Answer sentence
    // ------------------------------------

    if (
        sentenceVisible &&
        answerVisible
    ) {

        sentenceTranslation
            .classList.remove("hidden");

    } else {

        sentenceTranslation
            .classList.add("hidden");
    }


    // ------------------------------------
    // Button labels
    // ------------------------------------

    document.getElementById(
        "sentenceButton"
    ).textContent =
        sentenceVisible
            ? "Hide Sentence"
            : "Show Sentence";


    document.getElementById(
        "answerButton"
    ).textContent =
        answerVisible
            ? "Hide Answer"
            : "Show Answer";


    // ------------------------------------
    // Review buttons
    // ------------------------------------

    if (answerVisible && currentCard) {

        document.getElementById(
            "reviewButtons"
        ).classList.remove("hidden");

    } else {

        document.getElementById(
            "reviewButtons"
        ).classList.add("hidden");
    }
}


// ========================================
// SHOW / HIDE SENTENCE
// ========================================

document.getElementById(
    "sentenceButton"
).addEventListener(
    "click",
    function () {

        if (!currentCard) {
            return;
        }


        sentenceVisible =
            !sentenceVisible;


        updateDisplay();
    }
);


// ========================================
// SHOW / HIDE ANSWER
// ========================================

document.getElementById(
    "answerButton"
).addEventListener(
    "click",
    function () {

        if (!currentCard) {
            return;
        }


        answerVisible =
            !answerVisible;


        updateDisplay();
    }
);


// ========================================
// FORMAT INTERVAL
// ========================================

function formatInterval(milliseconds) {

    const minutes =
        Math.round(
            milliseconds / 60000
        );


    if (minutes < 60) {

        return minutes +
            " minute(s)";
    }


    const hours =
        Math.round(
            minutes / 60
        );


    if (hours < 24) {

        return hours +
            " hour(s)";
    }


    const days =
        Math.round(
            hours / 24
        );


    return days +
        " day(s)";
}


// ========================================
// FORMAT DATE
// ========================================

function formatDate(timestamp) {

    if (!timestamp) {

        return "Not scheduled";
    }


    const date =
        new Date(timestamp);


    return date.toLocaleString();
}


// ========================================
// UPDATE PROGRESS DISPLAY
// ========================================

function updateProgressDisplay() {

    const progress =
        getProgress();


    const progressInfo =
        document.getElementById(
            "progressInfo"
        );


    const debugInfo =
        document.getElementById(
            "debugInfo"
        );


    // No current card

    if (!currentCard) {

        return;
    }


    const id =
        currentCard.id;


    const cardProgress =
        progress[id];


    // ------------------------------------
    // New card
    // ------------------------------------

    if (!cardProgress) {

        progressInfo.innerHTML =
            "New card";


        debugInfo.innerHTML =

            "Card ID: " +
            id +
            "<br>" +

            "Reviews: 0<br>" +

            "Last answer: None<br>" +

            "Interval: 0 minutes<br>" +

            "Next review: Not scheduled";


        return;
    }


    // ------------------------------------
    // Existing card
    // ------------------------------------

    progressInfo.innerHTML =

        "Last answer: <strong>" +
        cardProgress.lastAnswer +
        "</strong><br>" +

        "Next review: <strong>" +
        formatDate(
            cardProgress.due
        ) +
        "</strong>";


    debugInfo.innerHTML =

        "Card ID: " +
        id +
        "<br>" +

        "Reviews: " +
        cardProgress.repetitions +
        "<br>" +

        "Last answer: " +
        cardProgress.lastAnswer +
        "<br>" +

        "Interval: " +
        formatInterval(
            cardProgress.interval
        ) +
        "<br>" +

        "Next review: " +
        formatDate(
            cardProgress.due
        );
}


// ========================================
// REVIEW A CARD
// ========================================

function reviewCard(choice) {

    if (!currentCard) {

        return;
    }


    const progress =
        getProgress();


    const id =
        currentCard.id;


    // ------------------------------------
    // Create progress record
    // ------------------------------------

    if (!progress[id]) {

        progress[id] = {

            interval: 0,

            repetitions: 0,

            lastAnswer: null,

            due: null
        };
    }


    const cardProgress =
        progress[id];


    // ------------------------------------
    // Choose interval
    // ------------------------------------

    if (choice === "mistake") {

        cardProgress.interval =
            0;
    }


    else if (choice === "hard") {

        cardProgress.interval =
            30 * 60 * 1000;
    }


    else if (choice === "good") {

        cardProgress.interval =
            24 * 60 * 60 * 1000;
    }


    else if (choice === "easy") {

        cardProgress.interval =
            7 * 24 * 60 * 60 * 1000;
    }


    // ------------------------------------
    // Update history
    // ------------------------------------

    cardProgress.repetitions += 1;

    cardProgress.lastAnswer =
        choice;


    // ------------------------------------
    // Calculate due date
    // ------------------------------------

    cardProgress.due =
        Date.now() +
        cardProgress.interval;


    // ------------------------------------
    // Save
    // ------------------------------------

    saveProgress(progress);


    // ------------------------------------
    // Find another card
    // ------------------------------------

    showNextCard();
}


// ========================================
// REVIEW BUTTONS
// ========================================

document.getElementById(
    "mistakeButton"
).addEventListener(
    "click",
    function () {

        reviewCard("mistake");
    }
);


document.getElementById(
    "hardButton"
).addEventListener(
    "click",
    function () {

        reviewCard("hard");
    }
);


document.getElementById(
    "goodButton"
).addEventListener(
    "click",
    function () {

        reviewCard("good");
    }
);


document.getElementById(
    "easyButton"
).addEventListener(
    "click",
    function () {

        reviewCard("easy");
    }
);


// ========================================
// START APP
// ========================================

loadCards();
