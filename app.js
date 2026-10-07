
const app = document.getElementById("app");

const state = {
  screen: "menu",
  questions: [],
  currentIndex: 0,
  selections: new Map(),
  submitted: false,
};

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function startRun() {
  state.screen = "quiz";
  state.questions = shuffle(QUESTION_BANK);
  state.currentIndex = 0;
  state.selections = new Map();
  state.submitted = false;
  render();
}

function exitRun() {
  state.screen = "menu";
  state.questions = [];
  state.currentIndex = 0;
  state.selections = new Map();
  state.submitted = false;
  render();
}

function getCurrentQuestion() {
  return state.questions[state.currentIndex];
}

function getCurrentSelection() {
  const question = getCurrentQuestion();
  if (!state.selections.has(question.id)) {
    state.selections.set(question.id, new Set());
  }
  return state.selections.get(question.id);
}

function toggleAnswer(answerIndex) {
  if (state.submitted) return;

  const selection = getCurrentSelection();

  if (selection.has(answerIndex)) {
    selection.delete(answerIndex);
  } else {
    selection.add(answerIndex);
  }

  renderQuestion();
}

function submitAnswer() {
  const selection = getCurrentSelection();

  if (selection.size === 0) {
    const notice = document.getElementById("notice");
    if (notice) notice.textContent = "Wähle mindestens eine Antwort aus.";
    return;
  }

  state.submitted = true;
  renderQuestion();
}

function nextQuestion() {
  if (!state.submitted) return;

  if (state.currentIndex >= state.questions.length - 1) {
    state.screen = "results";
    render();
    return;
  }

  state.currentIndex += 1;
  state.submitted = false;
  renderQuestion();
}

function renderMenu() {
  app.innerHTML = `
    <section class="screen menu-screen">
      <h1 class="brand">Skinner Box</h1>
      <button class="primary-button" id="new-run" type="button">New Run</button>
    </section>
  `;

  document.getElementById("new-run").addEventListener("click", startRun);
}

function renderQuestion() {
  const question = getCurrentQuestion();
  const selection = getCurrentSelection();

  app.innerHTML = `
    <section class="screen quiz-screen">
      <header class="quiz-topbar">
        <div class="progress-text">${state.currentIndex + 1} / ${state.questions.length}</div>
        <button class="exit-button" id="exit-run" type="button">Exit</button>
      </header>

      <div class="question-wrap">
        <h2 class="question">${escapeHtml(question.question)}</h2>

        <div class="answers" id="answers"></div>

        <div class="quiz-actions">
          ${
            state.submitted
              ? '<button class="primary-button" id="continue" type="button">Continue</button>'
              : '<button class="primary-button" id="submit" type="button">Submit</button>'
          }
        </div>

        <div class="notice" id="notice" aria-live="polite">
          ${state.submitted ? "Antwort gespeichert. Für diese Probeklausur liegt kein Antwortschlüssel vor." : ""}
        </div>
      </div>
    </section>
  `;

  const answers = document.getElementById("answers");

  question.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-button";
    button.setAttribute("aria-pressed", selection.has(index) ? "true" : "false");

    if (selection.has(index)) button.classList.add("selected");
    if (state.submitted) button.classList.add("locked");

    button.innerHTML = `<span class="answer-letter">${String.fromCharCode(65 + index)}</span>${escapeHtml(answer)}`;

    if (!state.submitted) {
      button.addEventListener("click", () => toggleAnswer(index));
    }

    answers.appendChild(button);
  });

  document.getElementById("exit-run").addEventListener("click", exitRun);

  if (state.submitted) {
    document.getElementById("continue").addEventListener("click", nextQuestion);
  } else {
    document.getElementById("submit").addEventListener("click", submitAnswer);
  }
}

function renderResults() {
  app.innerHTML = `
    <section class="screen results-screen">
      <p class="result-number">${state.questions.length}</p>
      <p class="result-label">Fragen abgeschlossen</p>

      <div class="result-actions">
        <button class="primary-button" id="new-run" type="button">New Run</button>
        <button class="secondary-button" id="main-menu" type="button">Main Menu</button>
      </div>
    </section>
  `;

  document.getElementById("new-run").addEventListener("click", startRun);
  document.getElementById("main-menu").addEventListener("click", exitRun);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function render() {
  if (state.screen === "menu") renderMenu();
  if (state.screen === "quiz") renderQuestion();
  if (state.screen === "results") renderResults();
}

render();
