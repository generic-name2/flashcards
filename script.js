let cards = [];

let currentCard = null;

let editingCardId = null;

let sentenceVisible = false;

let answerVisible = false;

let selectedTags = [];

let filterMode = "OR";


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


    createTagButtons();

    renderCardManager();

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
// TAGS
// ========================================

function getAllTags() {

    const tagSet =
        new Set();


    cards.forEach(function(card) {

        (card.tags || []).forEach(
            function(tag) {

                tagSet.add(tag);

            }
        );

    });


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


    allButton.textContent = "All";

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
        selectedTags.indexOf(tag);


    if (index === -1) {

        selectedTags.push(tag);

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
                    selectedTags.includes(tag)
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


    if (filterMode === "OR") {

        return selectedTags.some(
            function(tag) {

                return tags.includes(tag);

            }
        );
    }


    return selectedTags.every(
        function(tag) {

            return tags.includes(tag);

        }
    );
}


// ========================================
// SCHEDULER
// ========================================

function getAvailableCards() {

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


            const p =
                progress[card.id];


            if (!p) {

                return true;
            }


            return p.due <= now;

        }
    );
}


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


function getDueCards() {

    const progress =
        getProgress();

    const now =
        Date.now();


    return cards.filter(
        function(card) {

            const p =
                progress[card.id];


            return (
                cardMatchesTags(card) &&
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


function showNothingDue() {

    currentCard = null;


    document.getElementById(
        "word"
    ).textContent =
        "Nothing due right now";


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


    document.getElementById(
        "reviewButtons"
    ).classList.toggle(
        "hidden",
        !answerVisible || !currentCard
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


    document.getElementById(
        "studyInfo"
    ).innerHTML =

        "<strong>" +
        filterText +
        "</strong><br>" +

        "New: " +
        getNewCards().length +

        " · Due: " +
        getDueCards().length +

        " · Available: " +
        getAvailableCards().length;
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
            "<br>Reviews: 0" +
            "<br>Last answer: None" +
            "<br>Interval: 0 minutes" +
            "<br>Next review: Not scheduled";


        return;
    }


    info.innerHTML =

        "Last answer: <strong>" +
        p.lastAnswer +
        "</strong><br>" +

        "Next review: <strong>" +
        formatDate(p.due) +
        "</strong>";


    debug.innerHTML =

        "Card ID: " +
        currentCard.id +

        "<br>Reviews: " +
        p.repetitions +

        "<br>Last answer: " +
        p.lastAnswer +

        "<br>Interval: " +
        formatInterval(p.interval) +

        "<br>Next review: " +
        formatDate(p.due);
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


    if (!progress[id]) {

        progress[id] = {

            interval: 0,

            repetitions: 0,

            lastAnswer: null,

            due: null

        };
    }


    const p =
        progress[id];


    if (choice === "mistake") {

        p.interval = 0;

    }


    if (choice === "hard") {

        p.interval =
            30 * 60 * 1000;

    }


    if (choice === "good") {

        p.interval =
            24 * 60 * 60 * 1000;

    }


    if (choice === "easy") {

        p.interval =
            7 * 24 * 60 * 60 * 1000;

    }


    p.repetitions += 1;

    p.lastAnswer = choice;

    p.due =
        Date.now() +
        p.interval;


    saveProgress(progress);

    showNextCard();
}


// ========================================
// FORMAT
// ========================================

function formatInterval(ms) {

    const minutes =
        Math.round(ms / 60000);


    if (minutes < 60) {

        return minutes +
            " minute(s)";
    }


    const hours =
        Math.round(minutes / 60);


    if (hours < 24) {

        return hours +
            " hour(s)";
    }


    return Math.round(
        hours / 24
    ) + " day(s)";
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
            (card.tags || []).join(
                ", "
            );

    } else {

        editingCardId = null;


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


    editingCardId = null;

    clearEditor();

    document.getElementById(
        "editorMessage"
    ).textContent = "";
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

                return card.id === id;

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

                    deleteCard(card.id);

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

                return c.id === id;

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

                return c.id !== id;

            }
        );


    saveCards();


    // Remove its review history too

    const progress =
        getProgress();


    delete progress[id];


    saveProgress(progress);


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

        reviewCard("mistake");

    };


document.getElementById(
    "hardButton"
).onclick =
    function() {

        reviewCard("hard");

    };


document.getElementById(
    "goodButton"
).onclick =
    function() {

        reviewCard("good");

    };


document.getElementById(
    "easyButton"
).onclick =
    function() {

        reviewCard("easy");

    };


// ========================================
// FILTER MODE
// ========================================

document.getElementById(
    "orButton"
).onclick =
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

    };


document.getElementById(
    "andButton"
).onclick =
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
                cards: cards
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


                    selectedTags = [];


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


                    saveProgress(data);


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

    };


// ========================================
// START
// ========================================

loadCards();
