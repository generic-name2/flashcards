// ========================================
// UI
// ========================================

import {
    formatDate,
    formatInterval
} from "./progress.js";

import {
    displayMedia
} from "./media.js";


let sentenceVisible = false;

let answerVisible = false;


// ========================================
// RESET VISIBILITY
// ========================================

export function resetCardVisibility() {

    sentenceVisible = false;

    answerVisible = false;

}


// ========================================
// DISPLAY CARD
// ========================================

export function displayCard(
    card,
    studyMode
) {

    resetCardVisibility();


    document.getElementById(
        "word"
    ).textContent =
        card.word;


    document.getElementById(
        "sentence"
    ).textContent =
        card.sentence || "";


    document.getElementById(
        "answer"
    ).textContent =
        card.translation || "";


    document.getElementById(
        "sentenceTranslation"
    ).textContent =
        card.sentence_translation || "";


    displayMedia(card);


    updateDisplay(
        studyMode
    );


    updateProgressDisplay(
        card
    );

}


// ========================================
// UPDATE DISPLAY
// ========================================

export function updateDisplay(
    studyMode
) {

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


    const sentenceButton =
        document.getElementById(
            "sentenceButton"
        );


    const answerButton =
        document.getElementById(
            "answerButton"
        );


    const reviewButtons =
        document.getElementById(
            "reviewButtons"
        );


    const skipButton =
        document.getElementById(
            "skipButton"
        );


    // ========================================
    // SENTENCE
    // ========================================

    sentence.classList.toggle(
        "hidden",
        !sentenceVisible
    );


    // ========================================
    // ANSWER
    // ========================================

    answer.classList.toggle(
        "hidden",
        !answerVisible
    );


    // ========================================
    // SENTENCE TRANSLATION
    // ========================================

    sentenceTranslation.classList.toggle(
        "hidden",
        !(
            sentenceVisible &&
            answerVisible
        )
    );


    // ========================================
    // SENTENCE BUTTON
    // ========================================

    sentenceButton.textContent =
        sentenceVisible
            ? "Hide Sentence"
            : "Show Sentence";


    // ========================================
    // ANSWER BUTTON
    // ========================================

    answerButton.textContent =
        answerVisible
            ? "Hide Answer"
            : "Show Answer";


    // ========================================
    // EVALUATION BUTTONS
    // ========================================

    if (
        answerVisible
    ) {

        reviewButtons.classList.remove(
            "hidden"
        );

    } else {

        reviewButtons.classList.add(
            "hidden"
        );

    }


    // ========================================
    // SKIP BUTTON
    // ========================================

    if (
        skipButton
    ) {

        if (
            answerVisible &&
            studyMode === "review"
        ) {

            skipButton.classList.remove(
                "hidden"
            );

        } else {

            skipButton.classList.add(
                "hidden"
            );

        }

    }

}


// ========================================
// TOGGLE SENTENCE
// ========================================

export function toggleSentence() {

    sentenceVisible =
        !sentenceVisible;


    updateDisplay();

}


// ========================================
// TOGGLE ANSWER
// ========================================

export function toggleAnswer() {

    answerVisible =
        !answerVisible;


    updateDisplay();

}


// ========================================
// PROGRESS DISPLAY
// ========================================

export function updateProgressDisplay(
    card
) {

    const info =
        document.getElementById(
            "progressInfo"
        );


    const debug =
        document.getElementById(
            "debugInfo"
        );


    if (!card) {

        info.innerHTML = "";

        return;

    }


    const progress =
        JSON.parse(
            localStorage.getItem(
                "flashcardProgress"
            ) || "{}"
        );


    const p =
        progress[card.id];


    if (!p) {

        info.innerHTML =
            "New card";


        debug.innerHTML =

            "Card ID: " +
            card.id +

            "<br>Status: New" +

            "<br>Reviews: 0" +

            "<br>Last answer: None" +

            "<br>Streak: 0" +

            "<br>Interval: 0 minutes" +

            "<br>Next review: Not scheduled";


        return;

    }


    const status =
        p.status === "graduated"
            ? "Graduated / Studying"
            : "Learning";


    info.innerHTML =

        "Status: <strong>" +
        status +
        "</strong><br>" +

        "Last answer: <strong>" +
        p.lastAnswer +
        "</strong><br>" +

        "Streak: <strong>" +
        p.streak +
        "</strong><br>" +

        "Next review: <strong>" +
        formatDate(p.due) +
        "</strong>";


    debug.innerHTML =

        "Card ID: " +
        card.id +

        "<br>Status: " +
        status +

        "<br>Reviews: " +
        p.repetitions +

        "<br>Last answer: " +
        p.lastAnswer +

        "<br>Current streak: " +
        p.streak +

        "<br>Interval: " +
        formatInterval(p.interval) +

        "<br>Next review: " +
        formatDate(p.due);

}


// ========================================
// NOTHING DUE
// ========================================

export function showNothingDue(
    message
) {

    document.getElementById(
        "word"
    ).textContent =
        message;


    document.getElementById(
        "sentence"
    ).classList.add(
        "hidden"
    );


    document.getElementById(
        "answer"
    ).classList.add(
        "hidden"
    );


    document.getElementById(
        "sentenceTranslation"
    ).classList.add(
        "hidden"
    );


    document.getElementById(
        "reviewButtons"
    ).classList.add(
        "hidden"
    );


    const skipButton =
        document.getElementById(
            "skipButton"
        );


    if (
        skipButton
    ) {

        skipButton.classList.add(
            "hidden"
        );

    }


    document.getElementById(
        "cardImage"
    ).classList.add(
        "hidden"
    );


    document.getElementById(
        "audioContainer"
    ).classList.add(
        "hidden"
    );


    document.getElementById(
        "progressInfo"
    ).innerHTML = "";

}
