const noticeDateInput = document.querySelector("#notice-date");
const noticeLengthInput = document.querySelector("#notice-length");
const countModeInputs = document.querySelectorAll("input[name='count-mode']");
const employeeNameInput = document.querySelector("#employee-name");
const managerNameInput = document.querySelector("#manager-name");
const roleTitleInput = document.querySelector("#role-title");

const lastDayEl = document.querySelector("#last-day");
const resultNoteEl = document.querySelector("#result-note");
const givenDateEl = document.querySelector("#given-date");
const noticeWindowEl = document.querySelector("#notice-window");
const countingMethodEl = document.querySelector("#counting-method");
const nextDayEl = document.querySelector("#next-day");
const letterOutputEl = document.querySelector("#letter-output");
const copySummaryButton = document.querySelector("#copy-summary");
const copyLetterButton = document.querySelector("#copy-letter");
const copyStatusEl = document.querySelector("#copy-status");
const letterStatusEl = document.querySelector("#letter-status");

const longFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric"
});

const shortFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric"
});

function toLocalDate(value) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function isBusinessDay(date) {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

function addBusinessDays(date, days) {
  let current = new Date(date);
  let added = 0;
  while (added < days) {
    current = addDays(current, 1);
    if (isBusinessDay(current)) added += 1;
  }
  return current;
}

function getCountMode() {
  return document.querySelector("input[name='count-mode']:checked").value;
}

function getCalculation() {
  const start = toLocalDate(noticeDateInput.value);
  if (!start) return null;

  const weeks = Number(noticeLengthInput.value);
  const mode = getCountMode();
  const days = mode === "business" ? weeks * 5 : weeks * 7;
  const lastDay = mode === "business" ? addBusinessDays(start, days) : addDays(start, days);
  const nextDay = addDays(lastDay, 1);

  return {
    start,
    days,
    weeks,
    mode,
    lastDay,
    nextDay,
    methodLabel: mode === "business" ? "Business days" : "Calendar days"
  };
}

function buildLetter(calculation) {
  const managerName = managerNameInput.value.trim() || "Manager";
  const employeeName = employeeNameInput.value.trim() || "Your Name";
  const roleTitle = roleTitleInput.value.trim();
  const roleLine = roleTitle ? ` from my role as ${roleTitle}` : "";

  if (!calculation) {
    return `Dear ${managerName},\n\nPlease accept this letter as formal notice of my resignation. I will confirm my final working day after reviewing the transition timeline.\n\nThank you for the opportunity and support.\n\nSincerely,\n${employeeName}`;
  }

  return `Dear ${managerName},\n\nPlease accept this letter as formal notice of my resignation${roleLine}. My final working day will be ${longFormatter.format(calculation.lastDay)}.\n\nI appreciate the opportunity to work with the team and will do my best to support a smooth transition before my last day.\n\nSincerely,\n${employeeName}`;
}

function updateCalculator() {
  const calculation = getCalculation();

  if (!calculation) {
    lastDayEl.textContent = "-";
    resultNoteEl.textContent = "Choose a notice date to begin.";
    givenDateEl.textContent = "-";
    noticeWindowEl.textContent = "-";
    countingMethodEl.textContent = "Calendar";
    nextDayEl.textContent = "-";
    letterOutputEl.textContent = buildLetter(null);
    return;
  }

  lastDayEl.textContent = shortFormatter.format(calculation.lastDay);
  resultNoteEl.textContent = `${longFormatter.format(calculation.lastDay)} is the estimated final work date.`;
  givenDateEl.textContent = shortFormatter.format(calculation.start);
  noticeWindowEl.textContent = `${calculation.weeks} ${calculation.weeks === 1 ? "week" : "weeks"} / ${calculation.days} days`;
  countingMethodEl.textContent = calculation.methodLabel;
  nextDayEl.textContent = shortFormatter.format(calculation.nextDay);
  letterOutputEl.textContent = buildLetter(calculation);
}

async function copyText(text, statusEl) {
  try {
    await navigator.clipboard.writeText(text);
    statusEl.textContent = "Copied.";
  } catch {
    statusEl.textContent = "Copy failed. Select the text and copy manually.";
  }
  window.setTimeout(() => {
    statusEl.textContent = "";
  }, 2200);
}

function buildSummary() {
  const calculation = getCalculation();
  if (!calculation) return "No notice date selected.";
  return [
    `Notice given: ${longFormatter.format(calculation.start)}`,
    `Estimated last working day: ${longFormatter.format(calculation.lastDay)}`,
    `Notice period: ${calculation.weeks} ${calculation.weeks === 1 ? "week" : "weeks"} / ${calculation.days} days`,
    `Counting method: ${calculation.methodLabel}`
  ].join("\n");
}

function setDefaultDate() {
  const today = new Date();
  noticeDateInput.value = toInputValue(today);
}

[noticeDateInput, noticeLengthInput, employeeNameInput, managerNameInput, roleTitleInput].forEach((input) => {
  input.addEventListener("input", updateCalculator);
});

countModeInputs.forEach((input) => {
  input.addEventListener("change", updateCalculator);
});

copySummaryButton.addEventListener("click", () => copyText(buildSummary(), copyStatusEl));
copyLetterButton.addEventListener("click", () => copyText(letterOutputEl.textContent, letterStatusEl));

setDefaultDate();
updateCalculator();
