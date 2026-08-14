// ========================================
// STUDY / REVIEW
// ========================================

import {
    getProgress,
    saveProgress
} from "./storage.js";

import {
    isLearningCard,
    isStudyingCard,
    isNewCard,
    cardMatchesTags
} from "./cards.js";

import {
    reviewCardProgress
} from "./progress.js";


export const LEARNING_LIMIT = 20;


let studyMode = "study";

let includeNewInReview = false;

let reviewCycle = [];

let reviewCyclePosition = 0;


// ========================================
// SETTINGS
// ========================================

export function getStudyMode() {

    return studyMode;

}


export function setStudyMode(mode) {

    studyMode =
        mode;

}


export function getIncludeNew() {

    return includeNewInReview;

}


export function setIncludeNew(value) {

    includeNewInReview =
        value;

}


export function resetReviewCycle() {

    reviewCycle = [];

    reviewCyclePosition = 0;

}


export function getReviewCyclePosition() {

    return reviewCyclePosition;

}


export function getReviewCycleLength() {

    return reviewCycle.length;

}


// ========================================
// POOLS
// ========================================

export function getLearningCards(
    cards,
    progress,
    selectedTags,
    filterMode
) {

    return cards.filter(
        function(card) {

            return (
                cardMatchesTags(
                    card,
                    selectedTags,
                    filterMode
                ) &&
                isLearningCard(
                    card,
                    progress
                )
            );

        }
    );

}


export function getStudyingCards(
    cards,
    progress,
    selectedTags,
    filterMode
) {

    return cards.filter(
        function(card) {

            return (
                cardMatchesTags(
                    card,
                    selectedTags,
                    filterMode
                ) &&
                isStudyingCard(
                    card,
                    progress
                )
            );

        }
    );

}


export function getNewCards(
    cards,
    progress,
    selectedTags,
    filterMode
) {

    return cards.filter(
        function(card) {

            return (
                cardMatchesTags(
                    card,
                    selectedTags,
                    filterMode
                ) &&
                isNewCard(
                    card,
                    progress
                )
            );

        }
    );

}


export function getDueCards(
    cards,
    selectedTags,
    filterMode
) {

    const progress =
        getProgress();


    const now =
        Date.now();


    return cards.filter(
        function(card) {

            if (
                !cardMatchesTags(
                    card,
                    selectedTags,
                    filterMode
                )
            ) {

                return false;

            }


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
// LEARNING POOL
// ========================================

export function fillLearningPool(
    cards,
    selectedTags,
    filterMode
) {

    const progress =
        getProgress();


    const learningCards =
        getLearningCards(
            cards,
            progress,
            selectedTags,
            filterMode
        );


    let slots =
        LEARNING_LIMIT -
        learningCards.length;


    if (
        slots <= 0
    ) {

        return;

    }


    const newCards =
        getNewCards(
            cards,
            progress,
            selectedTags,
            filterMode
        );


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
// AVAILABLE
// ========================================

export function getAvailableCards(
    cards,
    selectedTags,
    filterMode
) {

    const progress =
        getProgress();


    const now =
        Date.now();


    return getStudyingCards(
        cards,
        progress,
        selectedTags,
        filterMode
    ).filter(
        function(card) {

            return (
                progress[card.id].due <=
                now
            );

        }
    );

}


// ========================================
// SHUFFLE
// ========================================

function shuffleArray(array) {

    const result =
        array.slice();


    for (
        let i =
            result.length - 1;

        i > 0;

        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            result[i],
            result[j]
        ] =
        [
            result[j],
            result[i]
        ];

    }


    return result;

}


// ========================================
// REVIEW CYCLE
// ========================================

function createReviewCycle(
    cards,
    selectedTags,
    filterMode
) {

    const progress =
        getProgress();


    let reviewCards =
        getStudyingCards(
            cards,
            progress,
            selectedTags,
            filterMode
        );


    if (
        includeNewInReview
    ) {

        reviewCards =
            reviewCards.concat(
                getNewCards(
                    cards,
                    progress,
                    selectedTags,
                    filterMode
                )
            );

    }


    reviewCycle =
        shuffleArray(
            reviewCards
        );


    reviewCyclePosition = 0;

}


// ========================================
// NEXT REVIEW CARD
// ========================================

export function getNextReviewCard(
    cards,
    selectedTags,
    filterMode
) {

    if (
        reviewCycle.length === 0
    ) {

        createReviewCycle(
            cards,
            selectedTags,
            filterMode
        );

    }


    if (
        reviewCyclePosition >=
        reviewCycle.length
    ) {

        createReviewCycle(
            cards,
            selectedTags,
            filterMode
        );

    }


    if (
        reviewCycle.length === 0
    ) {

        return null;

    }


    const card =
        reviewCycle[
            reviewCyclePosition
        ];


    reviewCyclePosition += 1;


    /*
     * If a card was deleted or no longer
     * matches the current Review All
     * settings, skip it.
     */

    if (
        !cardMatchesTags(
            card,
            selectedTags,
            filterMode
        )
    ) {

        return getNextReviewCard(
            cards,
            selectedTags,
            filterMode
        );

    }


    const progress =
        getProgress();


    if (
        !isStudyingCard(
            card,
            progress
        ) &&
        !(
            includeNewInReview &&
            isNewCard(
                card,
                progress
            )
        )
    ) {

        return getNextReviewCard(
            cards,
            selectedTags,
            filterMode
        );

    }


    return card;

}


// ========================================
// REVIEW
// ========================================

export function evaluateCard(
    card,
    choice
) {

    reviewCardProgress(
        card,
        choice
    );

}


// ========================================
// SKIP
// ========================================

export function skipCard() {

    /*
     * Nothing is changed.
     *
     * The card was already consumed
     * from the current cycle.
     */

}
