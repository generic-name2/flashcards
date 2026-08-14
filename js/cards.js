// ========================================
// CARDS
// ========================================


export function getCardStatus(
    card,
    progress
) {

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


export function isLearningCard(
    card,
    progress
) {

    return (
        getCardStatus(
            card,
            progress
        ) === "learning"
    );

}


export function isGraduatedCard(
    card,
    progress
) {

    return (
        getCardStatus(
            card,
            progress
        ) === "graduated"
    );

}


export function isStudyingCard(
    card,
    progress
) {

    const status =
        getCardStatus(
            card,
            progress
        );


    return (
        status === "learning" ||
        status === "graduated"
    );

}


export function isNewCard(
    card,
    progress
) {

    return (
        getCardStatus(
            card,
            progress
        ) === "new"
    );

}


// ========================================
// TAG FILTER
// ========================================

export function cardMatchesTags(
    card,
    selectedTags,
    filterMode
) {

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
// TAG LIST
// ========================================

export function getAllTags(cards) {

    const tagSet =
        new Set();


    cards.forEach(
        function(card) {

            (
                card.tags || []
            ).forEach(
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


// ========================================
// UNIQUE ID
// ========================================

export function createCardId(cards) {

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
