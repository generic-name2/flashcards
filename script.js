// ========================================
// MAIN
// ========================================

import {
    getProgress,
    saveCards,
    loadSavedCards,
    downloadJSON
} from "./js/storage.js";

import {
    migrateProgress
} from "./js/progress.js";

import {
    getAllTags,
    cardMatchesTags,
    createCardId
} from "./js/cards.js";

import {
    displayCard,
    showNothingDue,
    toggleSentence,
    toggleAnswer,
    updateProgressDisplay
} from "./js/ui.js";

import {
    getStudyMode,
    setStudyMode,
    getIncludeNew,
    setIncludeNew,
    resetReviewCycle,
    fillLearningPool,
    getAvailableCards,
    getDueCards,
    getLearningCards,
    getStudyingCards,
    getNewCards,
    getNextReviewCard,
    evaluateCard
} from "./js/study.js";


// ========================================
// STATE
// ========================================

let cards = [];

let currentCard = null;

let editingCardId = null;

let selectedTags = [];

let filterMode = "OR";


// ========================================
// LOAD
// ========================================

async function loadCards() {

    const response =
        await fetch(
            "cards.json"
        );


    const defaultCards =
        await response.json();


    const savedCards =
        loadSavedCards();


    if (savedCards) {

        cards =
            savedCards;

    } else {

        cards =
            defaultCards;

        saveCards(cards);

    }


    migrateProgress();

    createTagButtons();

    renderCardManager();

    setupMenus();

    setupFlashcardButtons();

    setupDataButtons();

    setupEditorButtons();

    setupFilterButtons();

    setupReviewButtons();

    loadTheme();

    showNextCard();

}


// ========================================
// NEXT CARD
// ========================================

function showNextCard() {

    const mode =
        getStudyMode();


    updateDueCounter();


    if (
        mode === "study"
    ) {

        fillLearningPool(
            cards,
            selectedTags,
            filterMode
        );


        const available =
            getAvailableCards(
                cards,
                selectedTags,
                filterMode
            );


        if (
            available.length === 0
        ) {

            currentCard = null;

            showNothingDue(
                "Nothing due right now 🎉"
            );

            updateNextDue();

            return;

        }


        const index =
            Math.floor(
                Math.random() *
                available.length
            );


        currentCard =
            available[index];


        displayCard(
            currentCard,
            getStudyMode()
        );


        updateStudyInfo();

        return;

    }


    const card =
        getNextReviewCard(
            cards,
            selectedTags,
            filterMode
        );


    if (!card) {

        currentCard = null;

        showNothingDue(
            "No cards to review"
        );

        updateNextDue();

        return;

    }


    currentCard =
        card;


    displayCard(
        currentCard,
        getStudyMode()
    );


    updateStudyInfo();

}


// ========================================
// EVALUATE
// ========================================

function reviewCard(
    choice
) {

    if (!currentCard) {

        return;

    }


    evaluateCard(
        currentCard,
        choice
    );


    currentCard = null;


    showNextCard();

}


// ========================================
// SKIP
// ========================================

function skipCurrentCard() {

    if (
        !currentCard ||
        getStudyMode() !== "review"
    ) {

        return;

    }


    currentCard = null;

    showNextCard();

}


// ========================================
// DUE COUNTER
// ========================================

function updateDueCounter() {

    const due =
        getDueCards(
            cards,
            selectedTags,
            filterMode
        );


    document.getElementById(
        "dueCounter"
    ).textContent =
        "Due " +
        due.length;

}


// ========================================
// NEXT DUE
// ========================================

function updateNextDue() {

    const progress =
        getProgress();


    const now =
        Date.now();


    let nextTimestamp =
        null;


    cards.forEach(
        function(card) {

            if (
                !cardMatchesTags(
                    card,
                    selectedTags,
                    filterMode
                )
            ) {

                return;

            }


            const p =
                progress[card.id];


            if (
                !p ||
                p.due <= now
            ) {

                return;

            }


            if (
                nextTimestamp === null ||
                p.due < nextTimestamp
            ) {

                nextTimestamp =
                    p.due;

            }

        }
    );


    const element =
        document.getElementById(
            "nextDueInfo"
        );


    if (
        nextTimestamp === null
    ) {

        element.innerHTML =
            "";

        return;

    }


    element.innerHTML =

        "Next due: <strong>" +
        new Date(
            nextTimestamp
        ).toLocaleString() +
        "</strong>";

}


// ========================================
// STUDY INFO
// ========================================

function updateStudyInfo() {

    const progress =
        getProgress();


    const learning =
        getLearningCards(
            cards,
            progress,
            selectedTags,
            filterMode
        ).length;


    const studying =
        getStudyingCards(
            cards,
            progress,
            selectedTags,
            filterMode
        ).length;


    const newCards =
        getNewCards(
            cards,
            progress,
            selectedTags,
            filterMode
        ).length;


    const due =
        getDueCards(
            cards,
            selectedTags,
            filterMode
        ).length;


    const mode =
        getStudyMode() === "study"
            ? "Study Due"
            : "Review All";


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


    document.getElementById(
        "studyInfo"
    ).innerHTML =

        "<strong>" +
        mode +
        "</strong><br>" +

        filterText +
        "<br>" +

        "Learning: " +
        learning +

        " / 20 · Studying: " +
        studying +

        " · New: " +
        newCards +

        " · Due: " +
        due;

}


// ========================================
// TAGS
// ========================================

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


    allButton.onclick =
        function() {

            selectedTags = [];

            resetReviewCycle();

            updateTagButtons();

            showNextCard();

        };


    container.appendChild(
        allButton
    );


    getAllTags(cards).forEach(
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


    resetReviewCycle();

    updateTagButtons();

    showNextCard();

}


function updateTagButtons() {

    document.querySelector(
        "#tagButtons button:first-child"
    ).classList.toggle(
        "selected",
        selectedTags.length === 0
    );


    document
        .querySelectorAll(
            ".tag-button"
        )
        .forEach(
            function(button) {

                if (
                    !button.dataset.tag
                ) {

                    return;

                }


                button.classList.toggle(
                    "selected",
                    selectedTags.includes(
                        button.dataset.tag
                    )
                );

            }
        );

}


// ========================================
// CARD EDITOR
// ========================================

function openEditor(card = null) {

    const form =
        document.getElementById(
            "editorForm"
        );


    form.classList.remove(
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
            ).join(", ");


        document.getElementById(
            "audioInput"
        ).value =
            card.audio || "";


        document.getElementById(
            "imageInput"
        ).value =
            card.image || "";

    } else {

        editingCardId =
            null;

        clearEditor();

    }

}


function clearEditor() {

    [
        "wordInput",
        "translationInput",
        "sentenceInput",
        "sentenceTranslationInput",
        "tagsInput",
        "audioInput",
        "imageInput"
    ].forEach(
        function(id) {

            document.getElementById(
                id
            ).value = "";

        }
    );

}


function closeEditor() {

    document.getElementById(
        "editorForm"
    ).classList.add(
        "hidden"
    );


    editingCardId =
        null;


    clearEditor();

}


function saveCardFromEditor() {

    const word =
        document.getElementById(
            "wordInput"
        ).value.trim();


    const translation =
        document.getElementById(
            "translationInput"
        ).value.trim();


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
            tag => tag.trim()
        )
        .filter(
            tag => tag.length > 0
        );


    const audio =
        document.getElementById(
            "audioInput"
        ).value.trim();


    const image =
        document.getElementById(
            "imageInput"
        ).value.trim();


    if (editingCardId) {

        const card =
            cards.find(
                c =>
                    c.id ===
                    editingCardId
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

            card.audio =
                audio;

            card.image =
                image;

        }

    } else {

        cards.push({

            id:
                createCardId(cards),

            word:
                word,

            translation:
                translation,

            sentence:
                sentence,

            sentence_translation:
                sentenceTranslation,

            tags:
                tags,

            audio:
                audio,

            image:
                image

        });

    }


    saveCards(cards);

    createTagButtons();

    renderCardManager();

    closeEditor();

    resetReviewCycle();

    showNextCard();

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


            item.innerHTML =

                "<div class='manager-word'>" +
                escapeHTML(card.word) +
                "</div>" +

                "<div class='manager-translation'>" +
                escapeHTML(card.translation) +
                "</div>";


            if (
                card.tags &&
                card.tags.length
            ) {

                item.innerHTML +=

                    "<div class='manager-tags'>" +
                    escapeHTML(
                        card.tags.join(" · ")
                    ) +
                    "</div>";

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


            buttons.appendChild(edit);

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


function escapeHTML(text) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text || "";


    return div.innerHTML;

}


function deleteCard(id) {

    const card =
        cards.find(
            c =>
                c.id === id
        );


    if (!card) {

        return;

    }


    if (
        !confirm(
            'Delete "' +
            card.word +
            '"?'
        )
    ) {

        return;

    }


    cards =
        cards.filter(
            c =>
                c.id !== id
        );


    saveCards(cards);


    const progress =
        getProgress();


    delete progress[id];

    localStorage.setItem(
        "flashcardProgress",
        JSON.stringify(progress)
    );


    resetReviewCycle();

    createTagButtons();

    renderCardManager();

    showNextCard();

}


// ========================================
// MENUS
// ========================================

const panels = {

    data:
        document.getElementById(
            "dataPanel"
        ),

    cards:
        document.getElementById(
            "cardsPanel"
        ),

    tags:
        document.getElementById(
            "tagsPanel"
        ),

    review:
        document.getElementById(
            "reviewPanel"
        ),

    info:
        document.getElementById(
            "infoPanel"
        )

};


let openPanel = null;


function closeAllPanels() {

    Object.values(
        panels
    ).forEach(
        panel =>
            panel.classList.add(
                "hidden"
            )
    );


    document.querySelectorAll(
        ".option-bar button"
    ).forEach(
        button =>
            button.classList.remove(
                "active"
            )
    );


    openPanel =
        null;

}


function togglePanel(
    name,
    buttonId
) {

    if (
        openPanel === name
    ) {

        closeAllPanels();

        return;

    }


    closeAllPanels();


    panels[name].classList.remove(
        "hidden"
    );


    document.getElementById(
        buttonId
    ).classList.add(
        "active"
    );


    openPanel =
        name;

}


function setupMenus() {

    document.getElementById(
        "dataMenuButton"
    ).onclick =
        () =>
            togglePanel(
                "data",
                "dataMenuButton"
            );


    document.getElementById(
        "cardsMenuButton"
    ).onclick =
        () =>
            togglePanel(
                "cards",
                "cardsMenuButton"
            );


    document.getElementById(
        "tagsMenuButton"
    ).onclick =
        () =>
            togglePanel(
                "tags",
                "tagsMenuButton"
            );


    document.getElementById(
        "reviewMenuButton"
    ).onclick =
        () =>
            togglePanel(
                "review",
                "reviewMenuButton"
            );


    document.getElementById(
        "infoMenuButton"
    ).onclick =
        () => {

            updateStudyInfo();

            updateProgressDisplay(
                currentCard
            );

            togglePanel(
                "info",
                "infoMenuButton"
            );

        };

}

// ========================================
// UPDATE REVIEW BUTTONS
// ========================================
function updateModeButtons() {

    const studyButton =
        document.getElementById(
            "studyModeButton"
        );


    const reviewButton =
        document.getElementById(
            "reviewAllButton"
        );


    const mode =
        getStudyMode();


    studyButton.classList.toggle(
        "active",
        mode === "study"
    );


    reviewButton.classList.toggle(
        "active",
        mode === "review"
    );

}
// ========================================
// REVIEW CONTROLS
// ========================================

function setupReviewButtons() {

    document.getElementById(
        "studyModeButton"
    ).onclick =
        function() {

            setStudyMode(
                "study"
            );

            updateModeButtons();
            
            resetReviewCycle();

            showNextCard();

        };


    document.getElementById(
        "reviewAllButton"
    ).onclick =
        function() {

            setStudyMode(
                "review"
            );

            updateModeButtons();
            
            resetReviewCycle();

            showNextCard();

        };


    const checkbox =
        document.getElementById(
            "includeNewCheckbox"
        );


    checkbox.checked =
        getIncludeNew();


    checkbox.onchange =
        function() {

            setIncludeNew(
                checkbox.checked
            );

            resetReviewCycle();

            showNextCard();

        };
    updateModeButtons();

}



// ========================================
// FLASHCARD BUTTONS
// ========================================

function setupFlashcardButtons() {

    document.getElementById(
        "sentenceButton"
    ).onclick =
        toggleSentence;


    document.getElementById(
        "answerButton"
    ).onclick =
        toggleAnswer;


    document.getElementById(
        "mistakeButton"
    ).onclick =
        () =>
            reviewCard(
                "mistake"
            );


    document.getElementById(
        "hardButton"
    ).onclick =
        () =>
            reviewCard(
                "hard"
            );


    document.getElementById(
        "goodButton"
    ).onclick =
        () =>
            reviewCard(
                "good"
            );


    document.getElementById(
        "easyButton"
    ).onclick =
        () =>
            reviewCard(
                "easy"
            );


    document.getElementById(
        "skipButton"
    ).onclick =
        skipCurrentCard;

}


// ========================================
// EDITOR
// ========================================

function setupEditorButtons() {

    document.getElementById(
        "addCardButton"
    ).onclick =
        () =>
            openEditor();


    document.getElementById(
        "saveCardButton"
    ).onclick =
        saveCardFromEditor;


    document.getElementById(
        "cancelEditButton"
    ).onclick =
        closeEditor;

}


// ========================================
// FILTERS
// ========================================

function setupFilterButtons() {

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


            resetReviewCycle();

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


            resetReviewCycle();

            showNextCard();

        };

}


// ========================================
// DATA BUTTONS
// ========================================

function setupDataButtons() {

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


    document.getElementById(
        "exportProgressButton"
    ).onclick =
        function() {

            downloadJSON(
                "my_progress.json",
                getProgress()
            );

        };


    document.getElementById(
        "importCardsButton"
    ).onclick =
        () =>
            document.getElementById(
                "cardsFileInput"
            ).click();


    document.getElementById(
        "importProgressButton"
    ).onclick =
        () =>
            document.getElementById(
                "progressFileInput"
            ).click();


    document.getElementById(
        "cardsFileInput"
    ).onchange =
        importCards;


    document.getElementById(
        "progressFileInput"
    ).onchange =
        importProgress;

}


function importCards(event) {

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


                saveCards(cards);

                selectedTags = [];

                resetReviewCycle();

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


    reader.readAsText(file);

}


function importProgress(event) {

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


                saveProgress(data);

                migrateProgress();

                resetReviewCycle();

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


    reader.readAsText(file);

}


// ========================================
// DARK MODE
// ========================================

function loadTheme() {

    const saved =
        localStorage.getItem(
            "flashcardTheme"
        );


    if (
        saved === "light"
    ) {

        document.body.classList.add(
            "light-mode"
        );

    } else {

        document.body.classList.remove(
            "light-mode"
        );

    }


    updateThemeButton();

}


function updateThemeButton() {

    const button =
        document.getElementById(
            "darkModeButton"
        );


    const light =
        document.body.classList.contains(
            "light-mode"
        );


    button.textContent =
        light
            ? "☀️"
            : "🌙";


    button.title =
        light
            ? "Switch to dark mode"
            : "Switch to light mode";

}


function setupTheme() {

    document.getElementById(
        "darkModeButton"
    ).onclick =
        function() {

            document.body.classList.toggle(
                "light-mode"
            );


            const light =
                document.body.classList.contains(
                    "light-mode"
                );


            localStorage.setItem(
                "flashcardTheme",
                light
                    ? "light"
                    : "dark"
            );


            updateThemeButton();

        };

}


// ========================================
// START
// ========================================

setupTheme();

loadCards();
