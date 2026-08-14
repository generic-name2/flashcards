// ========================================
// MEDIA
// ========================================


export function displayMedia(card) {

    const image =
        document.getElementById(
            "cardImage"
        );


    const audioContainer =
        document.getElementById(
            "audioContainer"
        );


    const audioButton =
        document.getElementById(
            "audioButton"
        );


    // ================================
    // IMAGE
    // ================================

    if (
        card.image &&
        card.image.trim()
    ) {

        image.src =
            card.image;

        image.alt =
            card.word || "Flashcard image";

        image.classList.remove(
            "hidden"
        );

    } else {

        image.src = "";

        image.classList.add(
            "hidden"
        );

    }


    // ================================
    // AUDIO
    // ================================

    if (
        card.audio &&
        card.audio.trim()
    ) {

        audioContainer.classList.remove(
            "hidden"
        );


        audioButton.onclick =
            function() {

                const audio =
                    new Audio(
                        card.audio
                    );


                audio.play()
                    .catch(
                        function() {

                            console.log(
                                "Could not play audio."
                            );

                        }
                    );

            };

    } else {

        audioContainer.classList.add(
            "hidden"
        );

    }

}
