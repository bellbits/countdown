const MAX_EVENTS = 10;
const colors = [
  "#e74c3c", "#3498db", "#2ecc71", "#9b59b6", "#f39c12",
  "#1abc9c", "#e67e22", "#34495e", "#d35400", "#7f8c8d"
];

let events = [];

const addBtn = document.getElementById("addBtn");
const countdowns = document.getElementById("countdowns");

async function loadEvents() {
  const res = await fetch("/api/events");
  events = await res.json();
  renderEvents();
}

async function saveEvents() {
  await fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(events)
  });
}

function renderEvents() {
  countdowns.innerHTML = "";

  events.forEach((event, index) => {
    const card = document.createElement("div");
    card.className = "countdown";
    card.style.background = colors[index % colors.length];
    card.draggable = true;
    card.dataset.index = index;

    card.innerHTML = `
      <button class="delete-btn">✕</button>
      <h3>${event.description}</h3>
      <div class="time" id="time-${index}"></div>
    `;

    card.querySelector(".delete-btn").onclick = async () => {
      events.splice(index, 1);
      await saveEvents();
      renderEvents();
    };

    setupDrag(card);
    countdowns.appendChild(card);
  });

  addBtn.disabled = events.length >= MAX_EVENTS;
}

function setupDrag(card) {
  card.addEventListener("dragstart", e => {
    e.dataTransfer.setData("text/plain", card.dataset.index);
  });

  card.addEventListener("dragover", e => e.preventDefault());

  card.addEventListener("drop", async e => {
    const from = +e.dataTransfer.getData("text/plain");
    const to = +card.dataset.index;
    if (from === to) return;

    const moved = events.splice(from, 1)[0];
    events.splice(to, 0, moved);

    await saveEvents();
    renderEvents();
  });
}

addBtn.onclick = async () => {
  const desc = description.value.trim();
  if (!desc || !date.value || !time.value) return;

  events.push({
    description: desc,
    date: new Date(`${date.value}T${time.value}`).toISOString()
  });

  await saveEvents();
  renderEvents();

  description.value = date.value = time.value = "";
};

function updateCountdowns() {
  const now = new Date();
  events.forEach((event, i) => {
    const el = document.getElementById(`time-${i}`);
    if (!el) return;

    const diff = new Date(event.date) - now;
    if (diff <= 0) {
      el.textContent = "Started!";
      return;
    }

    const d = Math.floor(diff / 86400000);
    const h = Math.floor(diff / 3600000) % 24;
    const m = Math.floor(diff / 60000) % 60;

    el.textContent = `${d}d ${h}h ${m}m`;
  });
}

loadEvents();
setInterval(updateCountdowns, 1000);
