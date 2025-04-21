const startBtn = document.getElementById("start-btn");
const loadingScreen = document.getElementById("loading-indicator");
const quizScreen = document.getElementById("quiz-screen");
const questionEl = document.getElementById("question");
const answersContainer = document.getElementById("answers");
const cocktailImage = document.getElementById("cocktail-image");
const feedback = document.getElementById("feedback");
const feedbackText = document.getElementById("feedback-text");
const nextBtn = document.getElementById("next-btn");
const resultsScreen = document.getElementById("results-screen");
const scoreEl = document.getElementById("score");
const totalQuestionsEl = document.getElementById("total-questions");
const restartBtn = document.getElementById("restart-btn");

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let wrongAnswers = [];

const TOTAL_QUESTIONS = 10;

startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showResults();
  }
});
restartBtn.addEventListener("click", () => {
  window.location.reload();
});

function startQuiz() {
  startBtn.parentElement.classList.add("hidden");
  loadingScreen.classList.remove("hidden");
  fetchQuestions();
}

async function fetchQuestions() {
  try {
    const promises = [];
    for (let i = 0; i < TOTAL_QUESTIONS; i++) {
      promises.push(fetch("https://www.thecocktaildb.com/api/json/v1/1/random.php").then(res => res.json()));
    }

    const results = await Promise.all(promises);
    questions = results.map(data => {
      const drink = data.drinks[0];
      const correct = drink.strDrink;
      const options = new Set([correct]);

      while (options.size < 4) {
        const randomDrink = results[Math.floor(Math.random() * results.length)].drinks[0];
        options.add(randomDrink.strDrink);
      }

      return {
        question: `Which cocktail is shown in the image?`,
        image: drink.strDrinkThumb,
        correctAnswer: correct,
        options: shuffleArray([...options]),
      };
    });

    loadingScreen.classList.add("hidden");
    quizScreen.classList.remove("hidden");
    showQuestion();
  } catch (err) {
    console.error("Failed to load quiz questions.", err);
    loadingScreen.innerHTML = "<p>Failed to load quiz questions. Please try again.</p>";
  }
}

function showQuestion() {
  const q = questions[currentQuestionIndex];
  questionEl.textContent = q.question;
  cocktailImage.src = q.image;
  answersContainer.innerHTML = "";

  q.options.forEach(option => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.classList.add("btn", "answer-btn");
    btn.addEventListener("click", () => checkAnswer(option));
    answersContainer.appendChild(btn);
  });

  feedback.classList.add("hidden");
}

function checkAnswer(selected) {
  const current = questions[currentQuestionIndex];
  const isCorrect = selected === current.correctAnswer;

  if (isCorrect) {
    score++;
    feedbackText.textContent = "Correct! 🍹";
  } else {
    feedbackText.textContent = `Wrong! The correct answer was: ${current.correctAnswer}`;
    wrongAnswers.push({
      question: current.question,
      correct: current.correctAnswer,
      selected,
      image: current.image,
    });
  }

  feedback.classList.remove("hidden");
}

function showResults() {
  quizScreen.classList.add("hidden");
  resultsScreen.classList.remove("hidden");
  scoreEl.textContent = score;
  totalQuestionsEl.textContent = questions.length;

  const wrongContainer = document.getElementById("wrong-answers");
  wrongContainer.innerHTML = "";

  wrongAnswers.forEach(item => {
    const div = document.createElement("div");
    div.classList.add("wrong-answer");

    div.innerHTML = `
      <img src="${item.image}" alt="Cocktail" class="small-img">
      <p><strong>Question:</strong> ${item.question}</p>
      <p><strong>Your Answer:</strong> ${item.selected}</p>
      <p><strong>Correct Answer:</strong> ${item.correct}</p>
    `;

    wrongContainer.appendChild(div);
  });
}

function shuffleArray(array) {
  return array
    .map(val => ({ val, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ val }) => val);
}

