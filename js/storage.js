// ========================================
// STORAGE
// ========================================


export function getProgress() {

    const saved =
        localStorage.getItem(
            "flashcardProgress"
        );


    return saved
        ? JSON.parse(saved)
        : {};

}


export function saveProgress(progress) {

    localStorage.setItem(
        "flashcardProgress",
        JSON.stringify(progress)
    );

}


export function saveCards(cards) {

    localStorage.setItem(
        "flashcardCards",
        JSON.stringify(cards)
    );

}


export function loadSavedCards() {

    const saved =
        localStorage.getItem(
            "flashcardCards"
        );


    return saved
        ? JSON.parse(saved)
        : null;

}


export function downloadJSON(
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
