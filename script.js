const answerButton = document.getElementById("answerButton");
const answer = document.getElementById("answer");

answerButton.addEventListener("click", function () {

    answer.classList.toggle("hidden");

    if (answer.classList.contains("hidden")) {
        answerButton.textContent = "Show Answer";
    } else {
        answerButton.textContent = "Hide Answer";
    }

});
