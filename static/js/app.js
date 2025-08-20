const appRoot = document.body; // has class "app"
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

let started = false;

// --- FORM HANDLING START ---
let pendingFormIntent = null;
let pendingFormFields = [];

// Define dropdown options for static fields
const dropdownOptions = {
  house: ['daya', 'karunya', 'sathya', 'vidya'],
  class: ['1','2','3','4','5','6','7','8','9','10','11','12'],
  section: ['A','B','C','D','E','F','G']
};

function createFormField(field, form) {
  const label = document.createElement('label');
  label.textContent = field.charAt(0).toUpperCase() + field.slice(1) + ': ';
  label.style.marginRight = '10px';
  label.style.display = 'inline-block';
  label.style.width = '90px';

  let input;

  // Check if field should be a dropdown (static dropdowns)
  if (dropdownOptions[field]) {
    input = document.createElement('select');
    input.name = field;

    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = `Select ${field}`;
    input.appendChild(defaultOption);

    // Add options from dropdownOptions
    dropdownOptions[field].forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option;
      optionElement.textContent = option.charAt(0).toUpperCase() + option.slice(1);
      input.appendChild(optionElement);
    });
  } else {
    // Create regular input for other fields
    input = document.createElement('input');
    input.type = field === 'marks' ? 'number' : 'text';
    input.name = field;
  }

  // Common styling
  input.required = false;  // all fields optional
  input.style.marginBottom = '8px';
  input.style.marginRight = '5px';
  input.style.padding = '6px 8px';
  input.style.borderRadius = '5px';
  input.style.border = '1.2px solid #bbb';
  input.style.width = 'calc(100% - 110px)';

  form.appendChild(label);
  form.appendChild(input);
  form.appendChild(document.createElement('br'));
}

// Helper to add a dropdown with given options for dynamic name list
function addDropdown(field, options, form) {
  const label = document.createElement('label');
  label.textContent = field.charAt(0).toUpperCase() + field.slice(1) + ': ';
  label.style.marginRight = '10px';
  label.style.display = 'inline-block';
  label.style.width = '90px';

  const select = document.createElement('select');
  select.name = field;

  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = `Select ${field}`;
  select.appendChild(defaultOption);

  options.forEach(option => {
    const opt = document.createElement('option');
    opt.value = option;
    opt.textContent = option;
    select.appendChild(opt);
  });

  select.style.marginBottom = '8px';
  select.style.marginRight = '5px';
  select.style.padding = '6px 8px';
  select.style.borderRadius = '5px';
  select.style.border = '1.2px solid #bbb';
  select.style.width = 'calc(100% - 110px)';

  form.appendChild(label);
  form.appendChild(select);
  form.appendChild(document.createElement('br'));
}

function createForm(fields, intent) {
  const formDiv = document.createElement('div');
  formDiv.classList.add('message', 'bot');
  formDiv.style.marginTop = '10px';

  const form = document.createElement('form');
  form.id = 'action-form';

  if (intent === 'modify_marks' || intent === 'get_marks') {
    // Fetch student names dynamically from backend
    fetch('/api/student_names')
      .then(res => res.json())
      .then(data => {
        const names = data.names;
        addDropdown('name', names, form);
        // Add other fields excluding 'name'
        fields.filter(field => field !== 'name').forEach(field => {
          createFormField(field, form);
        });

        appendFormAndHandle(formDiv, form, fields, intent);
      })
      .catch(() => {
        // fallback: create all fields without dynamic dropdown
        fields.forEach(field => {
          createFormField(field, form);
        });
        appendFormAndHandle(formDiv, form, fields, intent);
      });
  } else {
    // For other intents, create normal form fields
    fields.forEach(field => {
      createFormField(field, form);
    });
    appendFormAndHandle(formDiv, form, fields, intent);
  }
}

function appendFormAndHandle(formDiv, form, fields, intent) {
  const submit = document.createElement('button');
  submit.textContent = 'Submit';
  submit.type = 'submit';
  submit.style.marginTop = '8px';
  submit.style.marginBottom = '3px';
  submit.style.padding = '8px 22px';
  submit.style.backgroundColor = "#3949ab";
  submit.style.color = "white";
  submit.style.border = "none";
  submit.style.borderRadius = "20px";
  submit.style.cursor = "pointer";
  form.appendChild(submit);

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = {};
    fields.forEach(field => {
      if (form.elements[field]) {
        formData[field] = form.elements[field].value;
      } else {
        formData[field] = null;
      }
    });
    formDiv.remove();

    appendMessage("Submitting details...", "bot");

    let response = await fetch('/api/submit_form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        intent: intent,
        form: formData
      })
    });

    let data = await response.json();
    appendMessage(data.response, "bot");
  });

  formDiv.appendChild(form);
  chatMessages.appendChild(formDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
// --- FORM HANDLING END ---

function appendMessage(text, sender) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', sender);
  msgDiv.textContent = text;
  chatMessages.appendChild(msgDiv);

  // Scroll to bottom
  const chatWindow = document.getElementById('chat-window');
  chatWindow.scrollTop = chatWindow.scrollHeight;

  // Transition to started UI
  startConversationUIOnce();
}

function appendTable(records, fields) {
  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.style.marginBottom = '15px';

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  fields.forEach(field => {
    const th = document.createElement('th');
    th.textContent = field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ');
    th.style.borderBottom = '2px solid #3949ab';
    th.style.padding = '8px';
    th.style.textAlign = 'left';
    th.style.color = '#1a237e';
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  records.forEach(rec => {
    const tr = document.createElement('tr');
    fields.forEach(field => {
      const td = document.createElement('td');
      td.textContent = rec[field] ?? '';
      td.style.padding = '8px';
      td.style.borderBottom = '1px solid #ddd';
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', 'bot');
  msgDiv.appendChild(table);
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function startConversationUIOnce() {
  if (started) return;
  appRoot.classList.add('started');
  started = true;
}

async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  appendMessage(message, 'user');
  userInput.value = '';
  userInput.disabled = true;
  sendBtn.disabled = true;

  try {
    const response = await fetch('/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      appendMessage('Error: Server did not respond properly.', 'bot');
    } else {
      const data = await response.json();
      appendMessage(data.response ?? 'No response.', 'bot');

      if (data.require_form) {
        createForm(data.required_fields, data.intent);
      } else if (data.records && data.record_fields) {
        appendTable(data.records, data.record_fields);
      }
    }
  } catch (err) {
    appendMessage('Error: Could not connect to server.', 'bot');
  } finally {
    userInput.disabled = false;
    sendBtn.disabled = false;
    userInput.focus();
  }
}

// Events
sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage();
});

// Focus on load
window.addEventListener('load', () => userInput.focus());

// Features and their descriptions/images (placeholder images)
const tutorialFeatures = {
  'insert a record': {
    desc: 'Use this to add a new student record. Fill out the form and submit.',
    example: 'Example: "Insert a record"',
    img: 'static/img/insert_placeholder.png', // Replace with real image later
  },
  'show all records': {
    desc: 'View all student entries and their details.',
    example: 'Example: "Show all records"',
    img: 'static/img/allrecords_placeholder.png',
  },
  'update marks': {
    desc: 'Update the marks for any student.',
    example: 'Example: "Update marks for John"',
    img: 'static/img/updatemarks_placeholder.png',
  },
  'get student marks': {
    desc: 'Fetch marks of a specific student.',
    example: 'Example: "Get marks for Sarah"',
    img: 'static/img/getmarks_placeholder.png',
  },
  'delete a record': {
    desc: 'Remove a student record from the database.',
    example: 'Example: "Delete student Priya"',
    img: 'static/img/delete_placeholder.png'
  },
  'class statistics': {
    desc: 'Get averages, rankings, or fail lists for your class.',
    example: 'Example: "Show class average", "Show top 3 students"',
    img: 'static/img/classstats_placeholder.png'
  },
  // Add more features if needed!
};

// Show tutorial button after chat starts
function showTutorialBtn() {
  document.getElementById('tutorial-btn').style.display = 'block';
}

// After your startConversationUIOnce(), add:
function startConversationUIOnce() {
  if (started) return;
  appRoot.classList.add('started');
  started = true;
  showTutorialBtn();
}

// Tutorial modal logic
const tutorialBtn = document.getElementById('tutorial-btn');
const tutorialModal = document.getElementById('tutorial-modal');
const tutorialContent = document.getElementById('tutorial-content');

tutorialBtn.addEventListener('click', showTutorialMain);

function showTutorialMain() {
  tutorialModal.classList.remove('hidden');
  tutorialContent.innerHTML = `
    <button id="close-modal" title="Close">&times;</button>
    <h2>Welcome to AskGrade!</h2>
    <p>AskGrade makes managing student records easy and intuitive.<br>
    You can add, update, delete, and view records with simple messages.<br>
    Try typing your questions or click a feature below for a quick tutorial!</p>
    <img src="static/img/mainmenu_placeholder.png" alt="Main menu example"><br>
    <select id="feature-select">
      <option value="">-- Select a feature --</option>
      ${Object.keys(tutorialFeatures).map(f => `<option value="${f}">${f.charAt(0).toUpperCase() + f.slice(1)}</option>`).join('')}
    </select><br>
    <button id="show-feature-btn">Show Feature Tutorial</button>
  `;
  document.getElementById('close-modal').onclick = hideTutorial;
  document.getElementById('show-feature-btn').onclick = handleFeatureSelect;
}

function handleFeatureSelect() {
  const select = document.getElementById('feature-select');
  const chosen = select.value;
  if (!chosen || !tutorialFeatures[chosen]) return;
  const feature = tutorialFeatures[chosen];
  tutorialContent.innerHTML = `
    <button id="close-modal" title="Close">&times;</button>
    <h2>${chosen.charAt(0).toUpperCase() + chosen.slice(1)}</h2>
    <p>${feature.desc}</p>
    <img src="${feature.img}" alt="Feature tutorial image">
    <p style="margin:18px 0 10px 0"><strong>${feature.example}</strong></p>
    <button id="back-btn" style="background:#222945;color:#00c9d9; border:none;padding:7px 15px;font-size:16px;border-radius:8px;margin-top:6px">Back to Menu</button>
  `;
  document.getElementById('close-modal').onclick = hideTutorial;
  document.getElementById('back-btn').onclick = showTutorialMain;
}

function hideTutorial() {
  tutorialModal.classList.add('hidden');
}

