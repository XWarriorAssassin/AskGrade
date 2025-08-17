const appRoot = document.body; // has class "app"
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

let started = false;

// --- FORM HANDLING START ---
let pendingFormIntent = null;
let pendingFormFields = [];

function createForm(fields, intent) {
  const formDiv = document.createElement('div');
  formDiv.classList.add('message', 'bot');
  formDiv.style.marginTop = '10px';

  const form = document.createElement('form');
  form.id = 'action-form';

  fields.forEach(field => {
    const label = document.createElement('label');
    label.textContent = field.charAt(0).toUpperCase() + field.slice(1) + ': ';
    label.style.marginRight = '10px';
    label.style.display = 'inline-block';
    label.style.width = '90px';

    const input = document.createElement('input');
    input.name = field;
    input.type = field === 'marks' ? 'number' : 'text';
    input.required = false;  // All fields optional
    input.style.marginBottom = '8px';
    input.style.marginRight = '5px';
    input.style.padding = '6px 8px';
    input.style.borderRadius = '5px';
    input.style.border = '1.2px solid #bbb';
    input.style.width = 'calc(100% - 110px)';

    form.appendChild(label);
    form.appendChild(input);
    form.appendChild(document.createElement('br'));
  });

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
      formData[field] = form.elements[field].value;
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
