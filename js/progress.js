// ========================================
// PROGRESS / SRS
// ========================================

import {
    getProgress,
    saveProgress
} from "./storage.js";


// ========================================
// MIGRATION
// ========================================

export function migrateProgress() {

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
// CREATE PROGRESS
// ========================================

export function createProgress() {

    return {

        interval: 0,

        repetitions: 0,

        lastAnswer: null,

        streak: 0,

        due: Date.now(),

        status: "learning"

    };

}


// ========================================
// INTERVAL
// ========================================

export function calculateInterval(
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
// REVIEW CARD
// ========================================

export function reviewCardProgress(
    card,
    choice
) {

    const progress =
        getProgress();


    const id =
        card.id;


    if (!progress[id]) {

        progress[id] =
            createProgress();

    }


    const p =
        progress[id];


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


    if (
        choice === "easy"
    ) {

        p.status =
            "graduated";

    } else {

        p.status =
            "learning";

    }


    saveProgress(
        progress
    );

}


// ========================================
// DUE
// ========================================

export function getDueCards(
    cards,
    cardMatches
) {

    const progress =
        getProgress();


    const now =
        Date.now();


    return cards.filter(
        function(card) {

            if (
                !cardMatches(card)
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
// FORMAT
// ========================================

export function formatInterval(ms) {

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


export function formatDate(timestamp) {

    if (!timestamp) {

        return "Not scheduled";

    }


    return new Date(
        timestamp
    ).toLocaleString();

}
