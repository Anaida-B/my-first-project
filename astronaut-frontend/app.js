// ===========================
// API BASE URLS
// ===========================
const API = {
  astronauts: "http://localhost:3000/api/astronauts",
  missions: "http://localhost:3000/api/missions",
  assignments: "http://localhost:3000/api/mission-assignments",
  vitals: "http://localhost:3000/api/vitals",
  anomalies: "http://localhost:3000/api/anomalies",
  tasks: "http://localhost:3000/api/tasks"
};

// ===========================
// Helpers
// ===========================
function toggleCardMenu(event) {
  const menu = event.target.nextElementSibling;
  menu.classList.toggle("hidden");
  event.stopPropagation();
}

// Render astronaut card with photo fallback
function renderAstronautCard(a) {
  const photo = a.photoUrl
    ? `<img src="${a.photoUrl}" alt="${a.name}" class="astronaut-photo">`
    : `<img src="https://via.placeholder.com/150?text=No+Photo" alt="No photo" class="astronaut-photo">`;

  return `
    <div class="card">
      ${photo}
      <p><strong>Name:</strong> ${a.name}</p>
      <p><strong>Gender:</strong> ${a.gender}</p>
      <p><strong>Age:</strong> ${a.age}</p>
      <p><strong>Nationality:</strong> ${a.nationality}</p>
      <p><strong>Specialization:</strong> ${a.specialization}</p>
    </div>
  `;
}

// ===========================
// Astronauts
// ===========================
async function loadAstronauts() {
  try {
    const res = await fetch(API.astronauts);
    const data = await res.json();
    const container = document.getElementById("astronaut-list");
    if (!container) return;

    container.innerHTML = data.length
      ? data.map(renderAstronautCard).join("")
      : `<div class="empty">No astronauts yet</div>`;
  } catch (err) {
    console.error("Error fetching astronauts:", err);
  }
}

function setupAstronautForm() {
  const form = document.getElementById("astronaut-form");
  if (!form) return;

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const astronaut = {
      name: form.name.value,
      gender: form.gender.value,
      age: form.age.value,
      nationality: form.nationality.value,
      specialization: form.specialization.value,
      photoUrl: form.photoUrl.value || null
    };
    await fetch(API.astronauts, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(astronaut)
    });
    form.reset();
    loadAstronauts();
    loadDashboard();
  });
}

// ===========================
// Missions
// ===========================
async function loadMissions() {
  try {
    const res = await fetch(API.missions);
    const data = await res.json();
    const container = document.getElementById("mission-list");
    if (!container) return;

    container.innerHTML = data.length
      ? data.map(m => `
        <div class="card" data-id="${m._id}">
          <div class="card-menu">
            <button class="menu-btn" onclick="toggleCardMenu(event)">⋮</button>
            <div class="menu-options hidden">
              <button onclick="editMission('${m._id}')">Update</button>
              <button onclick="deleteMission('${m._id}')">Delete</button>
            </div>
          </div>
          <p><strong>Mission ID:</strong> ${m.missionId}</p>
          <p><strong>Name:</strong> ${m.name}</p>
          <p><strong>Type:</strong> ${m.missionType}</p>
          <p><strong>Spacecraft:</strong> ${m.spacecraftName}</p>
          <p><strong>Start Date:</strong> ${new Date(m.startDate).toLocaleDateString()}</p>
          <p><strong>End Date:</strong> ${new Date(m.endDate).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${m.status}</p>
        </div>
      `).join("")
      : `<div class="empty">No missions yet</div>`;
  } catch (err) {
    console.error("Error fetching missions:", err);
  }
}
document.addEventListener("click", e => {
  // Toggle menu
  if (e.target.classList.contains("menu-btn")) {
    const menu = e.target.closest(".card-menu");
    menu.classList.toggle("active");
    return;
  }

  // Close menu if clicked elsewhere
  document.querySelectorAll(".card-menu").forEach(m => m.classList.remove("active"));
});


function setupMissionForm() {
  const form = document.getElementById("mission-form");
  if (!form) return;

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const mission = {
      missionId: form.missionId.value,
      name: form.name.value,
      missionType: form.missionType.value,
      spacecraftName: form.spacecraftName.value,
      startDate: form.startDate.value,
      endDate: form.endDate.value,
      status: form.status.value
    };
    await fetch(API.missions, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mission)
    });
    form.reset();
    loadMissions();
    loadDashboard();
  });
}

// ✳️ UPDATE MISSION
async function editMission(id) {
  try {
    const res = await fetch(`${API.missions}/${id}`);
    const mission = await res.json();
    const form = document.getElementById("mission-form");

    // Fill form with current data
    form.missionId.value = mission.missionId;
    form.name.value = mission.name;
    form.missionType.value = mission.missionType;
    form.spacecraftName.value = mission.spacecraftName;
    form.startDate.value = mission.startDate.split("T")[0];
    form.endDate.value = mission.endDate.split("T")[0];
    form.status.value = mission.status;

    // Open the modal
    toggleModal(true);

    // Temporarily override submit for update
    form.onsubmit = async e => {
      e.preventDefault();
      const updated = {
        missionId: form.missionId.value,
        name: form.name.value,
        missionType: form.missionType.value,
        spacecraftName: form.spacecraftName.value,
        startDate: form.startDate.value,
        endDate: form.endDate.value,
        status: form.status.value
      };

      const res = await fetch(`${API.missions}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });

      if (!res.ok) {
        const err = await res.text();
        alert("Failed to update mission: " + err);
        return;
      }

      toggleModal(false);
      form.reset();
      loadMissions();
      loadDashboard();
      setupMissionForm(); // restore add behavior
      alert("Mission updated successfully!");
    };
  } catch (err) {
    console.error("Error editing mission:", err);
  }
}

// ✳️ DELETE MISSION
async function deleteMission(id) {
  if (!confirm("Are you sure you want to delete this mission?")) return;

  try {
    const res = await fetch(`${API.missions}/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.text();
      alert("Failed to delete mission: " + err);
      return;
    }
    loadMissions();
    loadDashboard();
  } catch (err) {
    console.error("Error deleting mission:", err);
  }
}


// ===========================
// Mission Assignments
// ===========================

async function loadAssignments() {
  try {
    const res = await fetch(API.assignments);
    const data = await res.json();
    const container = document.getElementById("assignment-list");
    if (!container) return;

    if (!data.length) {
      container.innerHTML = `<div class="empty">No assignments found.</div>`;
      return;
    }

    container.innerHTML = data.map(a => {
  const astronautName = a.astronautId?.name || a.astronautId;
  const missionName = a.missionId?.name || a.missionId;

  return `
    <div class="card" data-id="${a._id}">
      <div class="card-menu">
        <button class="menu-btn">⋮</button>
        <div class="menu-content">
          <button class="edit-assignment-btn">Update</button>
          <button class="delete-assignment-btn">Delete</button>
        </div>
      </div>
      <div class="name">Assignment ID: ${a.assignmentId}</div>
      <div class="meta"><strong>Astronaut:</strong> ${astronautName}</div>
      <div class="meta"><strong>Mission:</strong> ${missionName}</div>
    </div>
  `;
}).join("");

  } catch (err) {
    console.error("Error fetching assignments:", err);
  }
}

function setupAssignmentForm() {
  const form = document.getElementById("assignment-form");
  if (!form) return;

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const assignment = {
      assignmentId: form.assignmentId.value,
      astronautId: form.astronautId.value,
      missionId: form.missionId.value
    };

    try {
      await fetch(API.assignments, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(assignment)
      });
      form.reset();
      toggleModal(false);
      loadAssignments();
    } catch (err) {
      console.error("Error adding assignment:", err);
    }
  });
}


// ===========================
// Vital Logs
// ===========================
function renderVitalCard(log) {
  return `
    <div class="card">
      <div class="name">Astronaut: ${log.astronautId}</div>
      <div class="meta">Mission: ${log.missionId}</div>
      <div class="meta">HR: ${log.heartRate || "N/A"} | BP: ${log.bloodPressure || "N/A"}</div>
      <div class="meta">Temp: ${log.temperature || "N/A"}°F | O₂: ${log.oxygenLevel || "N/A"}%</div>
      <div class="badge">Stress: ${log.stressLevel || "N/A"}</div>
    </div>
  `;
}

async function loadVitalLogs() {
  try {
    const res = await fetch(API.vitals);
    const data = await res.json();
    const container = document.getElementById("vital-log-list");
    if (!container) return;

    container.innerHTML = data.length
      ? data.map(renderVitalCard).join("")
      : `<div class="empty">No vital logs yet</div>`;
  } catch (err) {
    console.error("Error fetching vital logs:", err);
  }
}



// ===========================
// Anomalies
// ===========================
async function loadAnomalies() {
  try {
    const res = await fetch(API.anomalies);
    const data = await res.json();
    const container = document.getElementById("anomaly-list");
    if (!container) return;

    container.innerHTML = data.map(a => {
      const logInfo = a.logId
        ? `HR: ${a.logId.heartRate}, BP: ${a.logId.bloodPressure}, Temp: ${a.logId.temperature}`
        : a.logId;
      return `
        <div class="card">
          <p><strong>Anomaly ID:</strong> ${a._id}</p>
          <p><strong>Vital Log:</strong> ${logInfo}</p>
          <p><strong>Detection Source:</strong> ${a.detectionSource}</p>
          <p><strong>Type:</strong> ${a.anomalyType}</p>
          <p><strong>Severity:</strong> ${a.severityLevel}</p>
          <p><strong>Response:</strong> ${a.responseAction}</p>
          <p><strong>Detected At:</strong> ${new Date(a.detectionTime).toLocaleString()}</p>
        </div>
      `;
    }).join("");
  } catch (err) {
    console.error("Error fetching anomalies:", err);
  }
}

function setupAnomalyForm() {
  const form = document.getElementById("anomaly-form");
  if (!form) return;

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const anomaly = {
      logId: form.logId.value,
      detectionSource: form.detectionSource.value,
      anomalyType: form.anomalyType.value,
      severityLevel: form.severityLevel.value,
      responseAction: form.responseAction.value
    };
    await fetch(API.anomalies, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(anomaly)
    });
    form.reset();
    loadAnomalies();
  });
}

// ===========================
// Tasks (updated to match astronaut/missions style)
// ===========================
function renderTaskCard(task) {
  return `
    <div class="card">
      <p><strong>Task Name:</strong> ${task.taskName}</p>
      <p><strong>Task ID:</strong> ${task.taskID}</p>
      <p><strong>Type:</strong> ${task.taskType}</p>
      <p><strong>Scheduled Start:</strong> ${new Date(task.scheduledStartTime).toLocaleString()}</p>
      <p><strong>Estimated Duration:</strong> ${task.estimatedDuration} minutes</p>
    </div>
  `;
}

async function loadTasks() {
  try {
    const res = await fetch(API.tasks);
    const data = await res.json();
    const container = document.getElementById("task-list");
    if (!container) return;

    container.innerHTML = data.length
      ? data.map(renderTaskCard).join("")
      : `<div class="empty">No tasks yet</div>`;
  } catch (err) {
    console.error("Error fetching tasks:", err);
  }
}

function setupTaskForm() {
  const form = document.getElementById("task-form");
  if (!form) return;

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const task = {
      taskID: form.taskID.value,
      taskName: form.taskName.value,
      taskType: form.taskType.value,
      scheduledStartTime: form.scheduledStartTime.value,
      estimatedDuration: form.estimatedDuration.value
    };
    await fetch(API.tasks, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task)
    });
    form.reset();
    loadTasks();
    loadDashboard();
  });
}

// ===========================
// Dashboard
// ===========================
async function loadDashboard() {
  try {
    const [astronautRes, missionRes, taskRes] = await Promise.all([
      fetch(API.astronauts),
      fetch(API.missions),
      fetch(API.tasks)
    ]);

    const astronauts = await astronautRes.json();
    const missions = await missionRes.json();
    const tasks = await taskRes.json();

    const container = document.getElementById("dashboard");
    if (!container) return;

    container.innerHTML = `
      <div class="card">
        <h3>Astronauts</h3>
        <p>${astronauts.length}</p>
      </div>
      <div class="card">
        <h3>Missions</h3>
        <p>${missions.length}</p>
      </div>
      <div class="card">
        <h3>Tasks</h3>
        <p>${tasks.length}</p>
      </div>
    `;
  } catch (err) {
    console.error("Error loading dashboard:", err);
  }
}

// ===========================
// Init (run on every page)
// ===========================
document.addEventListener("DOMContentLoaded", () => {

  // ====== ASTRONAUTS ======
  if (document.getElementById("astronaut-list")) {
    loadAstronauts();
    setupAstronautForm();

    document.getElementById("astronaut-list").addEventListener("click", async e => {
      const card = e.target.closest(".card");
      if (!card) return;

      const menu = card.querySelector(".menu");

      if (e.target.classList.contains("dots")) {
        menu.classList.toggle("show");
      }

      if (e.target.classList.contains("delete-btn")) {
        const id = card.dataset.id;
        if (confirm("Are you sure you want to delete this astronaut?")) {
          await fetch(`${API.astronauts}/${id}`, { method: "DELETE" });
          loadAstronauts();
          loadDashboard();
        }
      }

      if (e.target.classList.contains("update-btn")) {
        const id = card.dataset.id;
        const astronaut = await fetch(`${API.astronauts}/${id}`).then(r => r.json());

        const form = document.getElementById("astronaut-form");
        form.name.value = astronaut.name;
        form.gender.value = astronaut.gender;
        form.age.value = astronaut.age;
        form.nationality.value = astronaut.nationality;
        form.specialization.value = astronaut.specialization;
        form.photoUrl.value = astronaut.photoUrl || "";

        form.onsubmit = async e => {
          e.preventDefault();
          const updated = {
            name: form.name.value,
            gender: form.gender.value,
            age: form.age.value,
            nationality: form.nationality.value,
            specialization: form.specialization.value,
            photoUrl: form.photoUrl.value || null
          };
          await fetch(`${API.astronauts}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated)
          });
          form.reset();
          loadAstronauts();
          loadDashboard();
          setupAstronautForm(); // restore normal POST
        };
      }
    });
  }

  // ====== MISSIONS ======
  if (document.getElementById("mission-list")) {
    loadMissions();
    setupMissionForm();
  }

  // ====== ASSIGNMENTS ======
  if (document.getElementById("assignment-list")) {
    loadAssignments();
    setupAssignmentForm();
  }

  // ====== VITAL LOGS ======
  if (document.getElementById("vital-log-list")) {
    loadVitalLogs();
    //setupVitalLogForm();
  }

  // ====== ANOMALIES ======
  if (document.getElementById("anomaly-list")) {
    loadAnomalies();
    setupAnomalyForm();
  }

  // ====== TASKS ======
  if (document.getElementById("task-list")) {
    loadTasks();
    setupTaskForm();
  }

  // ====== DASHBOARD ======
  if (document.getElementById("dashboard")) {
    loadDashboard();
  }

  // ====== CLOSE DROPDOWN MENUS WHEN CLICKING OUTSIDE ======
  document.addEventListener("click", e => {
    document.querySelectorAll(".menu.show").forEach(menu => {
      if (!menu.contains(e.target) && !menu.previousElementSibling.contains(e.target)) {
        menu.classList.remove("show");
      }
    });
  });
});



