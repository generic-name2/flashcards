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

    showRandomCard();
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
// SHOW RANDOM CARD
// ========================================

function showRandomCard() {

    const randomIndex =
        Math.floor(
            Math.random() * cards.length
        );

    currentCard =
        cards[randomIndex];


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

    document.getElementById("sentenceTranslation")
        .textContent =
        currentCard.sentence_translation;


    // Reset visibility

    sentenceVisible = false;

    answerVisible = false;


    updateDisplay();

    updateProgressDisplay();


    // Hide review buttons

    document.getElementById("reviewButtons")
        .classList.add("hidden");
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


    // Question sentence

    if (sentenceVisible) {

        sentence.classList.remove("hidden");

    } else {

        sentence.classList.add("hidden");
    }


    // Answer word

    if (answerVisible) {

        answer.classList.remove("hidden");

    } else {

        answer.classList.add("hidden");
    }


    // Answer sentence

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


    // Button labels

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


    // Review buttons appear
    // when answer is visible

    if (answerVisible) {

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

        return minutes + " minute(s)";
    }


    const hours =
        Math.round(minutes / 60);


    if (hours < 24) {

        return hours + " hour(s)";
    }


    const days =
        Math.round(hours / 24);


    return days + " day(s)";
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


    const id =
        currentCard.id;


    const cardProgress =
        progress[id];


    const progressInfo =
        document.getElementById(
            "progressInfo"
        );


    const debugInfo =
        document.getElementById(
            "debugInfo"
        );


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
        formatDate(cardProgress.due) +
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

    const progress =
        getProgress();


    const id =
        currentCard.id;


    // Create progress record
    // if this is the first review

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


    // ====================================
    // CHOOSE INTERVAL
    // ====================================

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


    // ====================================
    // UPDATE HISTORY
    // ====================================

    cardProgress.repetitions += 1;

    cardProgress.lastAnswer =
        choice;


    // ====================================
    // CALCULATE DUE DATE
    // ====================================

    const now =
        Date.now();


    cardProgress.due =
        now +
        cardProgress.interval;


    // Save everything

    saveProgress(progress);


    // ====================================
    // SHOW NEXT CARD
    // ====================================

    showRandomCard();
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
