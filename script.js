let cards = [];

let currentCard = null;

let editingCardId = null;

let sentenceVisible = false;

let answerVisible = false;

let selectedTags = [];

let filterMode = "OR";


// ========================================
// SETTINGS
// ========================================

const LEARNING_LIMIT = 20;

let studyMode = "study";

let includeNewInReview = false;

let previewNewCards = false;


// ========================================
// LOAD
// ========================================

async function loadCards() {

    const response =
        await fetch("cards.json");

    const defaultCards =
        await response.json();


    const savedCards =
        localStorage.getItem(
            "flashcardCards"
        );


    if (savedCards) {

        cards =
            JSON.parse(savedCards);

    } else {

        cards =
            defaultCards;

        saveCards();
    }


    migrateProgress();

    createTagButtons();

    renderCardManager();

    createStudyControls();

    showNextCard();
}


// ========================================
// SAVE CARDS
// ========================================

function saveCards() {

    localStorage.setItem(
        "flashcardCards",
        JSON.stringify(cards)
    );
}


// ========================================
// PROGRESS
// ========================================

function getProgress() {

    const saved =
        localStorage.getItem(
            "flashcardProgress"
        );


    return saved
        ? JSON.parse(saved)
        : {};
}


function saveProgress(progress) {

    localStorage.setItem(
        "flashcardProgress",
        JSON.stringify(progress)
    );
}


// ========================================
// MIGRATE OLD PROGRESS
// ========================================

function migrateProgress() {

    const progress =
        getProgress();

    let changed = false;


    Object.keys(progress).forEach(
        function(id) {

            const p =
                progress[id];


            if (!p.status) {

                if (
                    p.lastAnswer === "easy"
                ) {

                    p.status =
                        "graduated";

                } else {

                    p.status =
                        "learning";

                }


                changed = true;
            }

        }
    );


    if (changed) {

        saveProgress(progress);

    }
}


// ========================================
// CARD STATUS
// ========================================

function getCardStatus(card) {

    const progress =
        getProgress();


    const p =
        progress[card.id];


    if (!p) {

        return "new";
    }


    if (
        p.status === "graduated" ||
        p.lastAnswer === "easy"
    ) {

        return "graduated";
    }


    return "learning";
}


function isLearningCard(card) {

    return (
        getCardStatus(card) ===
        "learning"
    );
}


function isGraduatedCard(card) {

    return (
        getCardStatus(card) ===
        "graduated"
    );
}


function isStudyingCard(card) {

    const status =
        getCardStatus(card);


    return (
        status === "learning" ||
        status === "graduated"
    );
}


function isNewCard(card) {

    return (
        getCardStatus(card) ===
        "new"
    );
}


// ========================================
// POOLS
// ========================================

function getLearningCards() {

    return cards.filter(
        function(card) {

            return (
                cardMatchesTags(card) &&
                isLearningCard(card)
            );

        }
    );
}


function getStudyingCards() {

    return cards.filter(
        function(card) {

            return (
                cardMatchesTags(card) &&
                isStudyingCard(card)
            );

        }
    );
}


function getNewCards() {

    return cards.filter(
        function(card) {

            return (
                cardMatchesTags(card) &&
                isNewCard(card)
            );

        }
    );
}


function getDueCards() {

    const progress =
        getProgress();

    const now =
        Date.now();


    return getStudyingCards()
        .filter(
            function(card) {

                const p =
                    progress[card.id];


                return (
                    p &&
                    p.due <= now
                );

            }
        );
}


// ========================================
// FILL LEARNING POOL
// ========================================

function fillLearningPool() {

    const progress =
        getProgress();


    const learningCards =
        getLearningCards();


    let slots =
        LEARNING_LIMIT -
        learningCards.length;


    if (slots <= 0) {

        return;

    }


    const newCards =
        getNewCards();


    for (
        let i = 0;
        i < slots &&
        i < newCards.length;
        i++
    ) {

        const card =
            newCards[i];


        progress[card.id] = {

            interval: 0,

            repetitions: 0,

            lastAnswer: null,

            streak: 0,

            due: Date.now(),

            status: "learning"

        };

    }


    saveProgress(progress);
}


// ========================================
// AVAILABLE CARDS
// ========================================

function getAvailableCards() {

    const progress =
        getProgress();

    const now =
        Date.now();


    return getStudyingCards()
        .filter(
            function(card) {

                const p =
                    progress[card.id];


                return (
                    p &&
                    p.due <= now
                );

            }
        );
}


// ========================================
// NEXT CARD
// ========================================

function showNextCard() {

    if (
        studyMode === "study"
    ) {

        fillLearningPool();

        updateStudyInfo();


        const available =
            getAvailableCards();


        if (
            available.length === 0
        ) {

            showNothingDue();

            return;
        }


        const index =
            Math.floor(
                Math.random() *
                available.length
            );


        displayCard(
            available[index]
        );


        return;
    }


    showNextReviewCard();
}


// ========================================
// REVIEW ALL
// ========================================

function showNextReviewCard() {

    updateStudyInfo();


    let reviewCards =
        getStudyingCards();


    if (
        includeNewInReview
    ) {

        reviewCards =
            reviewCards.concat(
                getNewCards()
            );

    }


    if (
        reviewCards.length === 0
    ) {

        showNothingDue();

        return;
    }


    const index =
        Math.floor(
            Math.random() *
            reviewCards.length
        );


    displayCard(
        reviewCards[index]
    );
}


// ========================================
// DISPLAY
// ========================================

function displayCard(card) {

    currentCard =
        card;


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
        card.translation;


    document.getElementById(
        "sentenceTranslation"
    ).textContent =
        card.sentence_translation || "";


    sentenceVisible = false;

    answerVisible = false;


    updateDisplay();

    updateProgressDisplay();


    document.getElementById(
        "reviewButtons"
    ).classList.add(
        "hidden"
    );
}


// ========================================
// NOTHING DUE
// ========================================

function showNothingDue() {

    currentCard = null;


    document.getElementById(
        "word"
    ).textContent =
        studyMode === "study"
            ? "Nothing due right now"
            : "No cards to review";


    document.getElementById(
        "sentence"
    ).textContent = "";


    document.getElementById(
        "answer"
    ).textContent = "";


    document.getElementById(
        "sentenceTranslation"
    ).textContent = "";


    [
        "sentence",
        "answer",
        "sentenceTranslation",
        "reviewButtons"
    ].forEach(
        function(id) {

            document.getElementById(
                id
            ).classList.add(
                "hidden"
            );

        }
    );


    document.getElementById(
        "progressInfo"
    ).innerHTML = "";
}


// ========================================
// DISPLAY STATE
// ========================================

function updateDisplay() {

    document.getElementById(
        "sentence"
    ).classList.toggle(
        "hidden",
        !sentenceVisible
    );


    document.getElementById(
        "answer"
    ).classList.toggle(
        "hidden",
        !answerVisible
    );


    document.getElementById(
        "sentenceTranslation"
    ).classList.toggle(
        "hidden",
        !(
            sentenceVisible &&
            answerVisible
        )
    );


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


    const isPreview =
        currentCard &&
        isNewCard(currentCard) &&
        studyMode === "review" &&
        includeNewInReview &&
        previewNewCards;


    document.getElementById(
        "reviewButtons"
    ).classList.toggle(
        "hidden",
        !answerVisible ||
        !currentCard ||
        isPreview
    );
}


// ========================================
// STUDY INFO
// ========================================

function updateStudyInfo() {

    let filterText =
        "All cards";


    if (
        selectedTags.length
    ) {

        filterText =
            selectedTags.join(
                filterMode === "OR"
                    ? " OR "
                    : " AND "
            );

    }


    const learningCount =
        getLearningCards().length;


    const studyingCount =
        getStudyingCards().length;


    const newCount =
        getNewCards().length;


    const dueCount =
        getDueCards().length;


    let modeText =
        studyMode === "study"
            ? "Study"
            : "Review All";


    let html =

        "<strong>" +
        modeText +
        "</strong><br>" +

        filterText +
        "<br>" +

        "Learning: " +
        learningCount +
        " / " +
        LEARNING_LIMIT +

        " · Studying: " +
        studyingCount +

        " · New: " +
        newCount +

        " · Due: " +
        dueCount;


    if (
        studyMode === "review" &&
        includeNewInReview
    ) {

        html +=
            "<br>New cards included" +
            (
                previewNewCards
                    ? " · Preview only"
                    : " · Evaluation on"
            );

    }


    document.getElementById(
        "studyInfo"
    ).innerHTML =
        html;
}


// ========================================
// PROGRESS DISPLAY
// ========================================

function updateProgressDisplay() {

    const info =
        document.getElementById(
            "progressInfo"
        );


    const debug =
        document.getElementById(
            "debugInfo"
        );


    if (!currentCard) {
        return;
    }


    const progress =
        getProgress();


    const p =
        progress[currentCard.id];


    if (!p) {

        info.innerHTML =
            "New card";


        debug.innerHTML =
            "Card ID: " +
            currentCard.id +
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
        currentCard.id +

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
// SRS
// ========================================

function calculateInterval(
    answer,
    streak
) {

    if (
        answer === "mistake"
    ) {

        return 0;

    }


    if (
        answer === "hard"
    ) {

        const effectiveStreak =
            Math.min(
                streak,
                10
            );


        return (
            5 *
            effectiveStreak *
            60 *
            1000
        );

    }


    if (
        answer === "good"
    ) {

        const effectiveStreak =
            Math.min(
                streak,
                10
            );


        return (
            effectiveStreak *
            24 *
            60 *
            60 *
            1000
        );

    }


    if (
        answer === "easy"
    ) {

        return (
            streak *
            7 *
            24 *
            60 *
            60 *
            1000
        );

    }


    return 0;
}


// ========================================
// REVIEW
// ========================================

function reviewCard(choice) {

    if (!currentCard) {
        return;
    }


    const progress =
        getProgress();


    const id =
        currentCard.id;


    /*
     * A New card can be visible in
     * Review All preview mode.
     *
     * In that mode, evaluation is disabled.
     */

    if (
        !progress[id]
    ) {

        if (
            studyMode === "review" &&
            previewNewCards
        ) {

            showNextReviewCard();

            return;
        }


        /*
         * Normally a New card should already
         * have been activated by fillLearningPool.
         *
         * This is a safety fallback.
         */

        progress[id] = {

            interval: 0,

            repetitions: 0,

            lastAnswer: null,

            streak: 0,

            due: Date.now(),

            status: "learning"

        };

    }


    const p =
        progress[id];


    /*
     * Same answer = increase streak.
     * Different answer = restart at 1.
     */

    if (
        p.lastAnswer === choice
    ) {

        p.streak += 1;

    } else {

        p.streak = 1;

    }


    p.interval =
        calculateInterval(
            choice,
            p.streak
        );


    p.repetitions += 1;

    p.lastAnswer =
        choice;


    p.due =
        Date.now() +
        p.interval;


    /*
     * Easy graduates the card from
     * Learning into the continuing
     * Studying pool.
     */

    if (
        choice === "easy"
    ) {

        p.status =
            "graduated";

    } else {

        p.status =
            "learning";

    }


    saveProgress(progress);


    /*
     * In normal Study mode, filling the
     * learning pool here means that when
     * a card graduates, a New card can
     * immediately replace it.
     */

    if (
        studyMode === "study"
    ) {

        fillLearningPool();

    }


    showNextCard();
}


// ========================================
// FORMAT
// ========================================

function formatInterval(ms) {

    const minutes =
        Math.round(
            ms / 60000
        );


    if (
        minutes < 60
    ) {

        return (
            minutes +
            " minute(s)"
        );

    }


    const hours =
        Math.round(
            minutes / 60
        );


    if (
        hours < 24
    ) {

        return (
            hours +
            " hour(s)"
        );

    }


    return (
        Math.round(
            hours / 24
        ) +
        " day(s)"
    );
}


function formatDate(timestamp) {

    if (!timestamp) {

        return "Not scheduled";

    }


    return new Date(
        timestamp
    ).toLocaleString();
}


// ========================================
// STUDY CONTROLS
// ========================================

function createStudyControls() {

    if (
        document.getElementById(
            "studyControls"
        )
    ) {

        return;

    }


    const studyInfo =
        document.getElementById(
            "studyInfo"
        );


    const container =
        document.createElement(
            "div"
        );


    container.id =
        "studyControls";


    container.style.marginTop =
        "12px";


    container.style.display =
        "flex";


    container.style.flexDirection =
        "column";


    container.style.gap =
        "8px";


    // Study button

    const studyButton =
        document.createElement(
            "button"
        );


    studyButton.textContent =
        "🧠 Study Due";


    studyButton.onclick =
        function() {

            studyMode =
                "study";


            updateStudyControls();

            showNextCard();

        };


    studyButton.id =
        "studyModeButton";


    container.appendChild(
        studyButton
    );


    // Review All button

    const reviewButton =
        document.createElement(
            "button"
        );


    reviewButton.textContent =
        "📚 Review All";


    reviewButton.onclick =
        function() {

            studyMode =
                "review";


            updateStudyControls();

            showNextCard();

        };


    reviewButton.id =
        "reviewAllButton";


    container.appendChild(
        reviewButton
    );


    // Include New checkbox

    const newLabel =
        document.createElement(
            "label"
        );


    const newCheckbox =
        document.createElement(
            "input"
        );


    newCheckbox.type =
        "checkbox";


    newCheckbox.id =
        "includeNewCheckbox";


    newCheckbox.checked =
        includeNewInReview;


    newCheckbox.onchange =
        function() {

            includeNewInReview =
                newCheckbox.checked;


            updateStudyControls();

            showNextCard();

        };


    newLabel.appendChild(
        newCheckbox
    );


    newLabel.appendChild(
        document.createTextNode(
            " Include New cards in Review All"
        )
    );


    container.appendChild(
        newLabel
    );


    // Preview-only checkbox

    const previewLabel =
        document.createElement(
            "label"
        );


    const previewCheckbox =
        document.createElement(
            "input"
        );


    previewCheckbox.type =
        "checkbox";


    previewCheckbox.id =
        "previewNewCheckbox";


    previewCheckbox.checked =
        previewNewCards;


    previewCheckbox.onchange =
        function() {

            previewNewCards =
                previewCheckbox.checked;


            updateStudyControls();

            showNextCard();

        };


    previewLabel.appendChild(
        previewCheckbox
    );


    previewLabel.appendChild(
        document.createTextNode(
            " Preview New cards without evaluating"
        )
    );


    container.appendChild(
        previewLabel
    );


    studyInfo.parentNode.insertBefore(
        container,
        studyInfo.nextSibling
    );


    updateStudyControls();
}


function updateStudyControls() {

    const studyButton =
        document.getElementById(
            "studyModeButton"
        );


    const reviewButton =
        document.getElementById(
            "reviewAllButton"
        );


    const includeCheckbox =
        document.getElementById(
            "includeNewCheckbox"
        );


    const previewCheckbox =
        document.getElementById(
            "previewNewCheckbox"
        );


    if (!studyButton) {

        return;

    }


    studyButton.disabled =
        studyMode === "study";


    reviewButton.disabled =
        studyMode === "review";


    includeCheckbox.disabled =
        studyMode !== "review";


    previewCheckbox.disabled =
        studyMode !== "review" ||
        !includeNewInReview;


    updateStudyInfo();
}


// ========================================
// TAGS
// ========================================

function getAllTags() {

    const tagSet =
        new Set();


    cards.forEach(
        function(card) {

            (card.tags || [])
                .forEach(
                    function(tag) {

                        tagSet.add(tag);

                    }
                );

        }
    );


    return Array.from(
        tagSet
    ).sort();
}


function createTagButtons() {

    const container =
        document.getElementById(
            "tagButtons"
        );


    container.innerHTML = "";


    const allButton =
        document.createElement(
            "button"
        );


    allButton.textContent =
        "All";


    allButton.className =
        "tag-button selected";


    allButton.id =
        "allTagButton";


    allButton.onclick =
        function() {

            selectedTags = [];

            updateTagButtons();

            showNextCard();

        };


    container.appendChild(
        allButton
    );


    getAllTags().forEach(
        function(tag) {

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


            button.onclick =
                function() {

                    toggleTag(tag);

                };


            container.appendChild(
                button
            );

        }
    );
}


function toggleTag(tag) {

    const index =
        selectedTags.indexOf(
            tag
        );


    if (
        index === -1
    ) {

        selectedTags.push(
            tag
        );

    } else {

        selectedTags.splice(
            index,
            1
        );

    }


    updateTagButtons();

    showNextCard();
}


function updateTagButtons() {

    const allButton =
        document.getElementById(
            "allTagButton"
        );


    allButton.classList.toggle(
        "selected",
        selectedTags.length === 0
    );


    document
        .querySelectorAll(
            ".tag-button"
        )
        .forEach(
            function(button) {

                const tag =
                    button.dataset.tag;


                if (!tag) {

                    return;

                }


                button.classList.toggle(
                    "selected",
                    selectedTags.includes(
                        tag
                    )
                );

            }
        );
}


// ========================================
// FILTER
// ========================================

function cardMatchesTags(card) {

    if (
        selectedTags.length === 0
    ) {

        return true;

    }


    const tags =
        card.tags || [];


    if (
        filterMode === "OR"
    ) {

        return selectedTags.some(
            function(tag) {

                return tags.includes(
                    tag
                );

            }
        );

    }


    return selectedTags.every(
        function(tag) {

            return tags.includes(
                tag
            );

        }
    );
}


// ========================================
// EDITOR
// ========================================

const editorForm =
    document.getElementById(
        "editorForm"
    );


function openEditor(card = null) {

    editorForm.classList.remove(
        "hidden"
    );


    if (card) {

        editingCardId =
            card.id;


        document.getElementById(
            "wordInput"
        ).value =
            card.word || "";


        document.getElementById(
            "translationInput"
        ).value =
            card.translation || "";


        document.getElementById(
            "sentenceInput"
        ).value =
            card.sentence || "";


        document.getElementById(
            "sentenceTranslationInput"
        ).value =
            card.sentence_translation || "";


        document.getElementById(
            "tagsInput"
        ).value =
            (
                card.tags || []
            ).join(
                ", "
            );

    } else {

        editingCardId =
            null;


        clearEditor();

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function clearEditor() {

    document.getElementById(
        "wordInput"
    ).value = "";


    document.getElementById(
        "translationInput"
    ).value = "";


    document.getElementById(
        "sentenceInput"
    ).value = "";


    document.getElementById(
        "sentenceTranslationInput"
    ).value = "";


    document.getElementById(
        "tagsInput"
    ).value = "";
}


function closeEditor() {

    editorForm.classList.add(
        "hidden"
    );


    editingCardId =
        null;


    clearEditor();


    document.getElementById(
        "editorMessage"
    ).textContent =
        "";
}


// ========================================
// SAVE CARD FROM EDITOR
// ========================================

function saveCardFromEditor() {

    const word =
        document.getElementById(
            "wordInput"
        ).value.trim();


    const translation =
        document.getElementById(
            "translationInput"
        ).value.trim();


    const sentence =
        document.getElementById(
            "sentenceInput"
        ).value.trim();


    const sentenceTranslation =
        document.getElementById(
            "sentenceTranslationInput"
        ).value.trim();


    const tags =
        document.getElementById(
            "tagsInput"
        ).value
        .split(",")
        .map(
            function(tag) {

                return tag.trim();

            }
        )
        .filter(
            function(tag) {

                return tag.length > 0;

            }
        );


    if (!word) {

        alert(
            "Please enter a word."
        );

        return;

    }


    if (!translation) {

        alert(
            "Please enter a translation."
        );

        return;

    }


    if (editingCardId) {

        const card =
            cards.find(
                function(c) {

                    return (
                        c.id ===
                        editingCardId
                    );

                }
            );


        if (card) {

            card.word =
                word;


            card.translation =
                translation;


            card.sentence =
                sentence;


            card.sentence_translation =
                sentenceTranslation;


            card.tags =
                tags;

        }

    } else {

        const newCard = {

            id:
                createCardId(),

            word:
                word,

            translation:
                translation,

            sentence:
                sentence,

            sentence_translation:
                sentenceTranslation,

            tags:
                tags

        };


        cards.push(
            newCard
        );

    }


    saveCards();


    createTagButtons();

    renderCardManager();

    closeEditor();

    showNextCard();
}


// ========================================
// CREATE UNIQUE ID
// ========================================

function createCardId() {

    let id;


    do {

        id =
            "card_" +
            Date.now() +
            "_" +
            Math.random()
                .toString(36)
                .substring(2, 8);

    } while (
        cards.some(
            function(card) {

                return (
                    card.id === id
                );

            }
        )
    );


    return id;
}


// ========================================
// CARD MANAGER
// ========================================

function renderCardManager() {

    const manager =
        document.getElementById(
            "cardManager"
        );


    manager.innerHTML = "";


    const title =
        document.createElement(
            "div"
        );


    title.className =
        "panel-title";


    title.textContent =
        cards.length +
        " card(s)";


    manager.appendChild(
        title
    );


    cards.forEach(
        function(card) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "manager-card";


            const word =
                document.createElement(
                    "div"
                );


            word.className =
                "manager-word";


            word.textContent =
                card.word;


            item.appendChild(
                word
            );


            const translation =
                document.createElement(
                    "div"
                );


            translation.className =
                "manager-translation";


            translation.textContent =
                card.translation;


            item.appendChild(
                translation
            );


            if (
                card.tags &&
                card.tags.length
            ) {

                const tags =
                    document.createElement(
                        "div"
                    );


                tags.className =
                    "manager-tags";


                tags.textContent =
                    card.tags.join(
                        " · "
                    );


                item.appendChild(
                    tags
                );

            }


            const buttons =
                document.createElement(
                    "div"
                );


            buttons.className =
                "manager-buttons";


            const edit =
                document.createElement(
                    "button"
                );


            edit.textContent =
                "✏️ Edit";


            edit.onclick =
                function() {

                    openEditor(card);

                };


            buttons.appendChild(
                edit
            );


            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.textContent =
                "🗑️ Delete";


            deleteButton.onclick =
                function() {

                    deleteCard(
                        card.id
                    );

                };


            buttons.appendChild(
                deleteButton
            );


            item.appendChild(
                buttons
            );


            manager.appendChild(
                item
            );

        }
    );
}


// ========================================
// DELETE CARD
// ========================================

function deleteCard(id) {

    const card =
        cards.find(
            function(c) {

                return (
                    c.id === id
                );

            }
        );


    if (!card) {

        return;

    }


    const confirmed =
        confirm(
            'Delete "' +
            card.word +
            '"?'
        );


    if (!confirmed) {

        return;

    }


    cards =
        cards.filter(
            function(c) {

                return (
                    c.id !== id
                );

            }
        );


    saveCards();


    const progress =
        getProgress();


    delete progress[id];


    saveProgress(
        progress
    );


    createTagButtons();

    renderCardManager();

    showNextCard();
}


// ========================================
// EDITOR BUTTONS
// ========================================

document.getElementById(
    "addCardButton"
).onclick =
    function() {

        openEditor();

    };


document.getElementById(
    "saveCardButton"
).onclick =
    function() {

        saveCardFromEditor();

    };


document.getElementById(
    "cancelEditButton"
).onclick =
    function() {

        closeEditor();

    };


// ========================================
// FLASHCARD BUTTONS
// ========================================

document.getElementById(
    "sentenceButton"
).onclick =
    function() {

        if (!currentCard) {

            return;

        }


        sentenceVisible =
            !sentenceVisible;


        updateDisplay();

    };


document.getElementById(
    "answerButton"
).onclick =
    function() {

        if (!currentCard) {

            return;

        }


        answerVisible =
            !answerVisible;


        updateDisplay();

    };


// ========================================
// REVIEW BUTTONS
// ========================================

document.getElementById(
    "mistakeButton"
).onclick =
    function() {

        reviewCard(
            "mistake"
        );

    };


document.getElementById(
    "hardButton"
).onclick =
    function() {

        reviewCard(
            "hard"
        );

    };


document.getElementById(
    "goodButton"
).onclick =
    function() {

        reviewCard(
            "good"
        );

    };


document.getElementById(
    "easyButton"
).onclick =
    function() {

        reviewCard(
            "easy"
        );

    };


// ========================================
// FILTER MODE
// ========================================

document.getElementById(
    "orButton"
).onclick =
    function() {

        filterMode =
            "OR";


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

    };


document.getElementById(
    "andButton"
).onclick =
    function() {

        filterMode =
            "AND";


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

    };


// ========================================
// DOWNLOAD
// ========================================

function downloadJSON(
    filename,
    data
) {

    const json =
        JSON.stringify(
            data,
            null,
            2
        );


    const blob =
        new Blob(
            [json],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        filename;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );
}


// ========================================
// EXPORT CARDS
// ========================================

document.getElementById(
    "exportCardsButton"
).onclick =
    function() {

        downloadJSON(
            "my_flashcards.json",
            {
                cards:
                    cards
            }
        );

    };


// ========================================
// EXPORT PROGRESS
// ========================================

document.getElementById(
    "exportProgressButton"
).onclick =
    function() {

        downloadJSON(
            "my_progress.json",
            getProgress()
        );

    };


// ========================================
// IMPORT CARDS
// ========================================

document.getElementById(
    "importCardsButton"
).onclick =
    function() {

        document.getElementById(
            "cardsFileInput"
        ).click();

    };


document.getElementById(
    "cardsFileInput"
).onchange =
    function(event) {

        const file =
            event.target.files[0];


        if (!file) {

            return;

        }


        const reader =
            new FileReader();


        reader.onload =
            function(e) {

                try {

                    const data =
                        JSON.parse(
                            e.target.result
                        );


                    if (
                        !data.cards ||
                        !Array.isArray(
                            data.cards
                        )
                    ) {

                        alert(
                            "Invalid flashcard file."
                        );

                        return;

                    }


                    cards =
                        data.cards;


                    saveCards();


                    selectedTags =
                        [];


                    createTagButtons();

                    renderCardManager();

                    showNextCard();


                    alert(
                        "Cards imported successfully."
                    );


                } catch {

                    alert(
                        "Could not read the flashcard file."
                    );

                }

            };


        reader.readAsText(
            file
        );

    };


// ========================================
// IMPORT PROGRESS
// ========================================

document.getElementById(
    "importProgressButton"
).onclick =
    function() {

        document.getElementById(
            "progressFileInput"
        ).click();

    };


document.getElementById(
    "progressFileInput"
).onchange =
    function(event) {

        const file =
            event.target.files[0];


        if (!file) {

            return;

        }


        const reader =
            new FileReader();


        reader.onload =
            function(e) {

                try {

                    const data =
                        JSON.parse(
                            e.target.result
                        );


                    if (
                        typeof data !==
                        "object"
                    ) {

                        alert(
                            "Invalid progress file."
                        );

                        return;

                    }


                    saveProgress(
                        data
                    );


                    migrateProgress();


                    showNextCard();


                    alert(
                        "Progress imported successfully."
                    );


                } catch {

                    alert(
                        "Could not read the progress file."
                    );

                }

            };


        reader.readAsText(
            file
        );

    };


// ========================================
// START
// ========================================

loadCards();
