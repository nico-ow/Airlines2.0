// === ELEMENT REFERENCES ===
const steps = document.querySelectorAll(".step");
const progressSteps = document.querySelectorAll(".progress-step");
const bookingForm = document.getElementById("bookingForm");
const flightsList = document.getElementById("flightsList");
const returnDiv = document.getElementById("returnDiv");
const flightType = document.getElementById("flightType");
const summaryCard = document.getElementById("summaryCard");
const toast = document.getElementById("toast");

let currentStep = 0;
let selectedFlight = null;
let bookingData = {};

// === SHOW CURRENT STEP ===
function showStep(stepIndex) {
  steps.forEach((step, i) => {
    step.classList.toggle("active", i === stepIndex);
    progressSteps[i].classList.toggle("active", i <= stepIndex);
  });
}

// === FLIGHT TYPE TOGGLE ===
flightType.addEventListener("change", () => {
  returnDiv.style.display = flightType.value === "round" ? "block" : "none";
});

// === STEP 1: HANDLE BOOKING FORM SUBMIT ===
bookingForm.addEventListener("submit", (e) => {
  e.preventDefault();

  bookingData = {
    from: document.getElementById("from").value.trim(),
    to: document.getElementById("to").value.trim(),
    depart: document.getElementById("departDate").value,
    return: document.getElementById("returnDate")?.value || "",
    passengers: parseInt(document.getElementById("numPassengers").value) || 1,
    flightType: flightType.value,
  };

  // ✅ Basic validation
  if (!bookingData.from || !bookingData.to) {
    alert("Please select both Origin and Destination.");
    return;
  }

  // ✅ New validation for round trip
  if (bookingData.flightType === "round" && !bookingData.return) {
    alert("Please select a return date for round-trip flights.");
    return;
  }

  currentStep = 1;
  showStep(currentStep);
  generateDynamicFlights();
});


// === STEP 2: DYNAMIC FLIGHT GENERATION WITH PROMOS ===
function generateDynamicFlights() {
  flightsList.innerHTML = "";

  const flightCount = Math.floor(Math.random() * 4) + 3; // 3–6 flights
  const basePrice = 2000 + Math.random() * 2000;
  const airlines = ["PAL", "Cebu Pacific", "AirAsia", "SkyJet"];
  const times = ["06:30 AM", "09:00 AM", "11:45 AM", "02:15 PM", "04:30 PM", "07:00 PM"];
  const promos = ["VIP", "Saver", "Economy", "Business", "Promo Fare", "Premium", "Seat Sale", "Super Saver"];

  const flights = [];

  for (let i = 0; i < flightCount; i++) {
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const flightNo = `${airline.split(" ")[0].toUpperCase()} ${Math.floor(Math.random() * 900 + 100)}`;
    const time = times[Math.floor(Math.random() * times.length)];
    const promo = promos[Math.floor(Math.random() * promos.length)];

    // Base price with promo adjustments
    let price = Math.floor(basePrice + Math.random() * 1200);
    if (promo === "Saver" || promo === "Seat Sale" || promo === "Promo Fare") price *= 0.85;
    if (promo === "VIP" || promo === "Premium" || promo === "Business") price *= 1.25;
    price = Math.floor(price);

    flights.push({
      flightNo,   
      from: bookingData.from,
      to: bookingData.to,
      time,
      price,
      promo,
    });
  }

  if (flights.length === 0) {
    flightsList.innerHTML = `<p style="text-align:center; color:#fff;">No available flights for this route.</p>`;
    return;
  }

  flights.forEach((flight) => {
    const div = document.createElement("div");
    div.classList.add("flight-card");
    div.innerHTML = `
      <div>
        <strong>${flight.flightNo}</strong> — ${flight.from} ✈ ${flight.to}<br>
        <small>${flight.time}</small>
        <span class="promo-tag">${flight.promo}</span>
      </div>
      <div><strong>₱${flight.price.toLocaleString()}</strong></div>
    `;

    div.addEventListener("click", () => {
      document.querySelectorAll(".flight-card").forEach(c => c.classList.remove("selected"));
      div.classList.add("selected");
      selectedFlight = flight;
      goToPassengerStep();
    });

    flightsList.appendChild(div);
  });
}

// === STEP 3: PASSENGER INFO ===
function goToPassengerStep() {
  if (!selectedFlight) return alert("Please select a flight.");

  currentStep = 2;
  showStep(currentStep);

  const passengerForms = document.getElementById("passengerForms");
  passengerForms.innerHTML = "";

  for (let i = 1; i <= bookingData.passengers; i++) {
    const box = document.createElement("div");
    box.classList.add("passenger-box");
    box.innerHTML = `
      <h4>Passenger ${i}</h4>
      <div class="form-row">
        <div class="form-group">
          <label>Full Name</label>
          <input type="text" required>
        </div>
        <div class="form-group">
          <label>Age</label>
          <input type="number" min="1"  required>
        </div>
      </div>
    `;
    passengerForms.appendChild(box);
  }
}

// === STEP 4: SUMMARY ===
document.getElementById("nextPassengerBtn").addEventListener("click", () => {
  // Validate passenger forms
  const passengerBoxes = document.querySelectorAll(".passenger-box");
  let allFilled = true;

  passengerBoxes.forEach(box => {
    const nameInput = box.querySelector('input[type="text"]');
    const ageInput = box.querySelector('input[type="number"]');
    if (!nameInput.value.trim() || !ageInput.value.trim()) {
      allFilled = false;
      nameInput.classList.add("input-error");
      ageInput.classList.add("input-error");
    } else {
      nameInput.classList.remove("input-error");
      ageInput.classList.remove("input-error");
    }
  });

  if (!allFilled) {
    alert("Please fill out all passenger information before proceeding.");
    return;
  }

  currentStep = 3;
  showStep(currentStep);

  summaryCard.innerHTML = `
    <p><strong>From:</strong> ${bookingData.from}</p>
    <p><strong>To:</strong> ${bookingData.to}</p>
    <p><strong>Departure:</strong> ${bookingData.depart}</p>
    <p><strong>Return:</strong> ${bookingData.return}</p>
    <p><strong>Passengers:</strong> ${bookingData.passengers}</p>
    <p><strong>Flight:</strong> ${selectedFlight.flightNo}</p>
    <p><strong>Promo:</strong> ${selectedFlight.promo}</p>
    <p><strong>Price:</strong> ₱${selectedFlight.price.toLocaleString()}</p>
  `;
});

// === STEP BACK BUTTONS ===
document.querySelectorAll(".prev").forEach(btn => {
  btn.addEventListener("click", () => {
    currentStep = Math.max(0, currentStep - 1);
    showStep(currentStep);
  });
});

document.getElementById("homeBtn").addEventListener("click", function() {
  window.location.href = "index.html";
  window.alert("Thank you!");
});


// === BOOKING TOAST ===
document.getElementById("bookNow").addEventListener("click", () => {
  toast.textContent = "Booking Successful!";
  toast.classList.add("show");

  // Hide the toast and return to the beginning
  setTimeout(() => {
    toast.classList.remove("show");

    // Reset all data and return to Step 1
    selectedFlight = null;
    bookingData = {};
    bookingForm.reset();
    flightsList.innerHTML = "";
    document.getElementById("passengerForms").innerHTML = "";
    document.getElementById("summaryCard").innerHTML = "";

    currentStep = 0;
    showStep(currentStep);
  }, 800);
});
