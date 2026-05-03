const chatBox = document.getElementById("chatBox");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const statusText = document.getElementById("status");

let answers = {};
let displayAnswers = {};
let step = 0;

/* ─── Brand Metadata with inline SVG logos ────────────────── */
const brandMeta = {
  "Maruti":        { label: "Maruti",         mark: "S"    },
  "Hyundai":       { label: "Hyundai",        mark: "H"    },
  "Honda":         { label: "Honda",          mark: "H"    },
  "Tata":          { label: "Tata",           mark: "T"    },
  "Toyota":        { label: "Toyota",         mark: "T"    },
  "Mahindra":      { label: "Mahindra",       mark: "M"    },
  "Ford":          { label: "Ford",           mark: "F"    },
  "Volkswagen":    { label: "Volkswagen",     mark: "VW"   },
  "Skoda":         { label: "Skoda",          mark: "S"    },
  "BMW":           { label: "BMW",            mark: "BMW"  },
  "Audi":          { label: "Audi",           mark: "OOOO" },
  "Mercedes-Benz": { label: "Mercedes-Benz", mark: "MB"   },
  "Jeep":          { label: "Jeep",           mark: "J"    },
  "Land":          { label: "Land Rover",     mark: "LR"   },
  "Porsche":       { label: "Porsche",        mark: "P"    },
  "Volvo":         { label: "Volvo",          mark: "V"    },
  "Bentley":       { label: "Bentley",        mark: "B"    },
  "Lamborghini":   { label: "Lamborghini",    mark: "L"    },
  "Other":         { label: "Other",          mark: "···"  }
};

/* ─── Questions Flow ──────────────────────────────────────── */
const questions = [
  {
    key: "Brand",
    text: "Great! Which brand is your car?",
    options: ["Maruti", "Hyundai", "Honda", "Tata", "Toyota", "Mahindra", "Ford", "Volkswagen", "Skoda", "BMW", "Audi", "Mercedes-Benz", "Jeep", "Land", "Porsche", "Volvo", "Bentley", "Lamborghini", "Other"]
  },
  {
    key: "Year",
    text: "Perfect. What year was it manufactured?",
    options: ["2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015", "2014", "2013", "2012", "2010 or older"]
  },
  {
    key: "Fuel_Type",
    text: "Great choice! What fuel type does it use?",
    options: ["Petrol", "Diesel", "CNG", "LPG", "Electric"]
  },
  {
    key: "Transmission",
    text: "Nice. Manual or Automatic?",
    options: ["Manual", "Automatic"]
  },
  {
    key: "Owner_Type",
    text: "Understood. Which ownership is this?",
    options: ["First Owner", "Second Owner", "Third Owner", "Fourth+ Owner"]
  },
  {
    key: "Kilometers_Driven",
    text: "Noted. Approximately how many kilometres has it been driven?",
    options: ["Under 20,000 km", "20,000 - 50,000 km", "50,000 - 1,00,000 km", "1,00,000 - 2,00,000 km", "Over 2,00,000 km"]
  },
  {
    key: "Engine",
    text: "Thanks. What is the engine displacement in CC? For example: 1200, 1500, 2000",
    options: []
  },
  {
    key: "Power",
    text: "Good to know. What is the engine power in BHP? For example: 80, 100, 150",
    options: []
  },
  {
    key: "Mileage",
    text: "Excellent. What is the mileage in km/l? For example: 18, 21, 25",
    options: []
  },
  {
    key: "Location",
    text: "Almost there! Which city is the car located in?",
    options: ["Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad", "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Kochi", "Coimbatore"]
  },
  {
    key: "Seats",
    text: "Last one. How many seats does it have?",
    options: ["2", "4", "5", "6", "7", "8", "9", "10"]
  }
];

/* ─── Helpers ─────────────────────────────────────────────── */
function scrollBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

function addBotMessage(text) {
  const row = document.createElement("div");
  row.className = "bot-row";
  row.innerHTML = `
    <div class="avatar">CV</div>
    <div class="bot-message">${text}</div>
  `;
  chatBox.appendChild(row);
  scrollBottom();
}

function addUserMessage(text) {
  const row = document.createElement("div");
  row.className = "user-row";
  row.innerHTML = `<div class="user-message">${text}</div>`;
  chatBox.appendChild(row);
  scrollBottom();
}

/* ─── Build option buttons ────────────────────────────────── */
function addOptions(options) {
  if (!options.length) return;

  const question = questions[step];
  const box = document.createElement("div");
  box.className = "options";
  if (question.key === "Brand") {
    box.classList.add("brand-options");
  }

  options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option-btn";

    if (question.key === "Brand") {
      const meta = brandMeta[option] || { label: option, mark: option.slice(0, 1) };

      button.classList.add("brand-btn");
      button.setAttribute("aria-label", meta.label);

      /* Brand logo: use inline SVG from BRAND_LOGOS if available */
      const logoContainer = document.createElement("span");
      logoContainer.className = "brand-logo-wrap";

      if (typeof BRAND_LOGOS !== "undefined" && BRAND_LOGOS[option]) {
        logoContainer.innerHTML = BRAND_LOGOS[option];
      } else {
        /* Fallback to text emblem */
        const slug = option.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        logoContainer.className = `brand-emblem brand-${slug || "other"}`;
        logoContainer.textContent = meta.mark;
      }

      button.appendChild(logoContainer);

      const label = document.createElement("span");
      label.className = "brand-label";
      label.textContent = meta.label;
      button.appendChild(label);

      button.onclick = () => handleAnswer(option, meta.label);
    } else {
      button.textContent = option;
      button.onclick = () => handleAnswer(option);
    }

    box.appendChild(button);
  });

  chatBox.appendChild(box);
  scrollBottom();
}

/* ─── Question Flow ───────────────────────────────────────── */
function askQuestion() {
  if (step >= questions.length) {
    getPrediction();
    return;
  }

  const question = questions[step];
  addBotMessage(question.text);
  addOptions(question.options);
  userInput.placeholder = question.options.length ? "Choose an option or type your answer..." : "Type your answer...";
}

function handleAnswer(answer, displayAnswer = answer) {
  const question = questions[step];
  answers[question.key] = answer;
  displayAnswers[question.key] = displayAnswer;
  addUserMessage(displayAnswer);
  step++;
  setTimeout(askQuestion, 350);
}

/* ─── Prediction ──────────────────────────────────────────── */
async function getPrediction() {
  addBotMessage("Based on everything you've shared, here's my estimate for your car:");

  try {
    const response = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(answers)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "Prediction failed");
    }

    addBotMessage(`
      <div class="result-card">
        <p>Estimated market value</p>
        <div class="price">${data.formatted_price}</div>
        <p>Confidence range: ${data.range}</p>
        <p>${displayAnswers.Brand || answers.Brand} - ${displayAnswers.Year || answers.Year} - ${displayAnswers.Fuel_Type || answers.Fuel_Type} - ${displayAnswers.Transmission || answers.Transmission}</p>
        <p>${displayAnswers.Owner_Type || answers.Owner_Type} - ${displayAnswers.Location || answers.Location} - ${displayAnswers.Seats || answers.Seats} seats</p>
        <p>Model confidence</p>
        <strong>${data.confidence}</strong>
      </div>
    `);
  } catch (error) {
    addBotMessage(`Prediction failed: ${error.message}. Please check your Flask terminal.`);
  }
}

/* ─── Form Submit ─────────────────────────────────────────── */
chatForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const value = userInput.value.trim();
  if (!value) return;

  userInput.value = "";
  handleAnswer(value);
});

/* ─── Init ────────────────────────────────────────────────── */
async function startChat() {
  try {
    const response = await fetch("/options");
    const appOptions = await response.json();

    if (appOptions.best_model_name && appOptions.r2_score) {
      statusText.textContent = "Online";
      statusText.title = `${appOptions.best_model_name} R2=${appOptions.r2_score}`;
    }

    setTimeout(askQuestion, 500);
  } catch (error) {
    statusText.textContent = "Offline";
    statusText.title = "Model options not loaded";
  }
}

startChat();
