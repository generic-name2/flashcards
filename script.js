let cards = [];

let currentCard = null;

let sentenceVisible = false;

let answerVisible = false;


// ========================================
// TAG FILTER STATE
// ========================================

let selectedTags = [];

let filterMode = "OR";


// ========================================
// LOAD CARDS
// ========================================

async function loadCards() {

    const response =
        await fetch("cards.json");

    cards =
        await response.json();


    createTagButtons();

    showNextCard();
}


// ========================================
// GET ALL TAGS
// ========================================

function getAllTags() {

    const tagSet =
        new Set();


    cards.forEach(function(card) {

        if (!card.tags) {
            return;
        }


        card.tags.forEach(function(tag) {

            tagSet.add(tag);

        });

    });


    return Array.from(tagSet).sort();
}


// ========================================
// CREATE TAG BUTTONS
// ========================================

function createTagButtons() {

    const container =
        document.getElementById(
            "tagButtons"
        );


    container.innerHTML = "";


    // All button

    const allButton =
        document.createElement("button");


    allButton.textContent =
        "All";


    allButton.className =
        "tag-button selected";


    allButton.id =
        "allTagButton";


    allButton.addEventListener(
        "click",
        function() {

            selectedTags = [];

            updateTagButtons();

            showNextCard();

        }
    );


    container.appendChild(
        allButton
    );


    // Individual tags

    const tags =
        getAllTags();


    tags.forEach(function(tag) {

        const button =
            document.createElement(
                "button"
            );


        button.textContent =
            tag;


        button.className =
            "tag-button";


        button.dataset.tag =
            tag;


        button.addEventListener(
            "click",
            function() {

                toggleTag(tag);

            }
        );


        container.appendChild(
            button
        );

    });
}


// ========================================
// TOGGLE TAG
// ========================================

function toggleTag(tag) {

    const index =
        selectedTags.indexOf(tag);


    if (index === -1) {

        selectedTags.push(tag);

    } else {

        selectedTags.splice(index, 1);

    }


    updateTagButtons();

    showNextCard();
}


// ========================================
// UPDATE TAG BUTTONS
// ========================================

function updateTagButtons() {

    const allButton =
        document.getElementById(
            "allTagButton"
        );


    // No tags selected = All

    if (selectedTags.length === 0) {

        allButton.classList.add(
            "selected"
        );

    } else {

        allButton.classList.remove(
            "selected"
        );
    }


    // Individual tags

    document
        .querySelectorAll(".tag-button")
        .forEach(function(button) {

            const tag =
                button.dataset.tag;


            if (
                tag &&
                selectedTags.includes(tag)
            ) {

                button.classList.add(
                    "selected"
                );

            } else if (tag) {

                button.classList.remove(
                    "selected"
                );
            }

        });
}


// ========================================
// FILTER CARDS BY TAG
// ========================================

function cardMatchesTags(card) {

    // No filter

    if (selectedTags.length === 0) {

        return true;
    }


    const cardTags =
        card.tags || [];


    // OR mode:
    // card needs at least one tag

    if (filterMode === "OR") {

        return selectedTags.some(
            function(tag) {

                return cardTags.includes(
                    tag
                );

            }
        );
    }


    // AND mode:
    // card needs every tag

    return selectedTags.every(
        function(tag) {

            return cardTags.includes(
                tag
            );

        }
    );
}


// ========================================
// GET PROGRESS
// ========================================

function getProgress() {

    const saved =
        localStorage.getItem(
            "flashcardProgress"
        );


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


    return cards.filter(
        function(card) {


            // First apply tag filter

            if (!cardMatchesTags(card)) {

                return false;
            }


            const cardProgress =
                progress[card.id];


            // New card

            if (!cardProgress) {

                return true;
            }


            // Reviewed card

            return (
                cardProgress.due <= now
            );

        }
    );
}


// ========================================
// COUNT NEW CARDS
// ========================================

function getNewCards() {

    const progress =
        getProgress();


    return cards.filter(
        function(card) {

            return (
                cardMatchesTags(card) &&
                !progress[card.id]
            );

        }
    );
}


// ========================================
// COUNT DUE CARDS
// ========================================

function getDueCards() {

    const progress =
        getProgress();


    const now =
        Date.now();


    return cards.filter(
        function(card) {

            if (
                !cardMatchesTags(card)
            ) {

                return false;
            }


            const cardProgress =
                progress[card.id];


            if (!cardProgress) {

                return false;
            }


            return (
                cardProgress.due <= now
            );

        }
    );
}


// ========================================
// SHOW NEXT CARD
// ========================================

function showNextCard() {

    const availableCards =
        getAvailableCards();


    updateStudyInfo();


    if (
        availableCards.length === 0
    ) {

        showNothingDue();

        return;
    }


    const randomIndex =
        Math.floor(
            Math.random() *
            availableCards.length
        );


    displayCard(
        availableCards[randomIndex]
    );
}


// ========================================
// DISPLAY CARD
// ========================================

function displayCard(card) {

    currentCard =
        card;


    document.getElementById("word")
        .textContent =
        currentCard.word;


    document.getElementById("sentence")
        .textContent =
        currentCard.sentence;


    document.getElementById("answer")
        .textContent =
        currentCard.translation;


    document.getElementById(
        "sentenceTranslation"
    ).textContent =
        currentCard.sentence_translation;


    sentenceVisible = false;

    answerVisible = false;


    updateDisplay();

    updateProgressDisplay();


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
// STUDY INFORMATION
// ========================================

function updateStudyInfo() {

    const newCards =
        getNewCards();


    const dueCards =
        getDueCards();


    const availableCards =
        getAvailableCards();


    const studyInfo =
        document.getElementById(
            "studyInfo"
        );


    let filterText =
        "All cards";


    if (
        selectedTags.length > 0
    ) {

        filterText =
            selectedTags.join(
                filterMode === "OR"
                    ? " OR "
                    : " AND "
            );

    }


    studyInfo.innerHTML =

        "<strong>" +
        filterText +
        "</strong><br>" +

        "New: " +
        newCards.length +
        " · Due: " +
        dueCards.length +
        " · Available: " +
        availableCards.length;
}


// ========================================
// UPDATE DISPLAY
// ========================================

function updateDisplay() {

    const sentence =
        document.getElementById(
            "sentence"
        );


    const answer =
        document.getElementById(
            "answer"
        );


    const sentenceTranslation =
        document.getElementById(
            "sentenceTranslation"
        );


    // Question sentence

    if (sentenceVisible) {

        sentence.classList.remove(
            "hidden"
        );

    } else {

        sentence.classList.add(
            "hidden"
        );
    }


    // Answer word

    if (answerVisible) {

        answer.classList.remove(
            "hidden"
        );

    } else {

        answer.classList.add(
            "hidden"
        );
    }


    // Answer sentence

    if (
        sentenceVisible &&
        answerVisible
    ) {

        sentenceTranslation
            .classList.remove(
                "hidden"
            );

    } else {

        sentenceTranslation
            .classList.add(
                "hidden"
            );
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


    // Review buttons

    if (
        answerVisible &&
        currentCard
    ) {

        document.getElementById(
            "reviewButtons"
        ).classList.remove(
            "hidden"
        );

    } else {

        document.getElementById(
            "reviewButtons"
        ).classList.add(
            "hidden"
        );
    }
}


// ========================================
// SENTENCE BUTTON
// ========================================

document.getElementById(
    "sentenceButton"
).addEventListener(
    "click",
    function() {

        if (!currentCard) {

            return;
        }


        sentenceVisible =
            !sentenceVisible;


        updateDisplay();
    }
);


// ========================================
// ANSWER BUTTON
// ========================================

document.getElementById(
    "answerButton"
).addEventListener(
    "click",
    function() {

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

function formatInterval(
    milliseconds
) {

    const minutes =
        Math.round(
            milliseconds / 60000
        );


    if (minutes < 60) {

        return (
            minutes +
            " minute(s)"
        );
    }


    const hours =
        Math.round(
            minutes / 60
        );


    if (hours < 24) {

        return (
            hours +
            " hour(s)"
        );
    }


    const days =
        Math.round(
            hours / 24
        );


    return (
        days +
        " day(s)"
    );
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


    if (!currentCard) {

        return;
    }


    const id =
        currentCard.id;


    const cardProgress =
        progress[id];


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
// REVIEW CARD
// ========================================

function reviewCard(choice) {

    if (!currentCard) {

        return;
    }


    const progress =
        getProgress();


    const id =
        currentCard.id;


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


    if (
        choice === "mistake"
    ) {

        cardProgress.interval =
            0;

    }


    else if (
        choice === "hard"
    ) {

        cardProgress.interval =
            30 * 60 * 1000;

    }


    else if (
        choice === "good"
    ) {

        cardProgress.interval =
            24 * 60 * 60 * 1000;

    }


    else if (
        choice === "easy"
    ) {

        cardProgress.interval =
            7 * 24 * 60 * 60 * 1000;

    }


    cardProgress.repetitions += 1;

    cardProgress.lastAnswer =
        choice;


    cardProgress.due =
        Date.now() +
        cardProgress.interval;


    saveProgress(progress);


    showNextCard();
}


// ========================================
// REVIEW BUTTONS
// ========================================

document.getElementById(
    "mistakeButton"
).addEventListener(
    "click",
    function() {

        reviewCard("mistake");

    }
);


document.getElementById(
    "hardButton"
).addEventListener(
    "click",
    function() {

        reviewCard("hard");

    }
);


document.getElementById(
    "goodButton"
).addEventListener(
    "click",
    function() {

        reviewCard("good");

    }
);


document.getElementById(
    "easyButton"
).addEventListener(
    "click",
    function() {

        reviewCard("easy");

    }
);


// ========================================
// OR / AND MODE
// ========================================

document.getElementById(
    "orButton"
).addEventListener(
    "click",
    function() {

        filterMode = "OR";


        document.getElementById(
            "orButton"
        ).classList.add(
            "active"
        );


        document.getElementById(
            "andButton"
        ).classList.remove(
            "active"
        );


        showNextCard();
    }
);


document.getElementById(
    "andButton"
).addEventListener(
    "click",
    function() {

        filterMode = "AND";


        document.getElementById(
            "andButton"
        ).classList.add(
            "active"
        );


        document.getElementById(
            "orButton"
        ).classList.remove(
            "active"
        );


        showNextCard();
    }
);


// ========================================
// START APP
// ========================================

loadCards();
