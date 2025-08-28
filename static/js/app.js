/**
 * AskGrade Chat Interface - Optimized and Refactored
 * A student record management system with conversational UI
 */

// ============================================================================
// CONSTANTS AND CONFIGURATION
// ============================================================================

const CONFIG = {
  // API endpoints
  ENDPOINTS: {
    QUERY: '/api/query',
    SUBMIT_FORM: '/api/submit_form',
    STUDENT_NAMES: '/api/student_names'
  },
  
  // Form field options for dropdowns
  DROPDOWN_OPTIONS: {
    house: ['daya', 'karunya', 'sathya', 'vidya'],
    class: ['1','2','3','4','5','6','7','8','9','10','11','12'],
    section: ['A', 'B', 'C', 'D', 'E', 'F', 'G']
  },
  
  // UI styling constants
  STYLES: {
    LABEL_WIDTH: '90px',
    INPUT_WIDTH: 'calc(100% - 110px)',
    BUTTON_COLOR: '#3949ab',
    BORDER_COLOR: '#bbb'
  }
};

// Tutorial feature definitions
const TUTORIAL_FEATURES = {
  'insert a record': { 
    desc: 'Add a new student record.', 
    example: 'Example: "Insert a record"', 
    img: 'static/img/insert_placeholder.png' 
  },
  'show all records': { 
    desc: 'View all student entries.', 
    example: 'Example: "Show all records"', 
    img: 'static/img/allrecords_placeholder.png' 
  },
  'update marks': { 
    desc: 'Update marks for a student.', 
    example: 'Example: "Update marks for John"', 
    img: 'static/img/updatemarks_placeholder.png' 
  },
  'get student marks': { 
    desc: "Fetch a student's marks.", 
    example: 'Example: "Get marks for Sarah"', 
    img: 'static/img/getmarks_placeholder.png' 
  },
  'delete a record': { 
    desc: 'Delete a student record.', 
    example: 'Example: "Delete student Priya"', 
    img: 'static/img/delete_placeholder.png' 
  },
  'class statistics': { 
    desc: 'View averages, rankings, or fail lists.', 
    example: 'Example: "Show class average"', 
    img: 'static/img/classstats_placeholder.png' 
  }
};

// ============================================================================
// DOM ELEMENTS AND STATE
// ============================================================================

class AppState {
  constructor() {
    // Cache DOM elements
    this.elements = {
      appRoot: document.body,
      chatMessages: document.getElementById('chat-messages'),
      chatWindow: document.getElementById('chat-window'),
      userInput: document.getElementById('user-input'),
      sendBtn: document.getElementById('send-btn'),
      tutorialBtn: document.getElementById('tutorial-btn'),
      tutorialModal: document.getElementById('tutorial-modal'),
      tutorialContent: document.getElementById('tutorial-content')
    };
    
    // Application state
    this.isStarted = false;
    
    this.initializeEventListeners();
  }
  
  initializeEventListeners() {
    const { sendBtn, userInput, tutorialBtn } = this.elements;
    
    // Message sending events
    sendBtn.addEventListener('click', () => this.sendMessage());
    userInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
    
    // Tutorial events
    tutorialBtn.addEventListener('click', () => this.showTutorialMain());
    
    // Focus input when page loads
    window.addEventListener('load', () => userInput.focus());
  }
  
  startConversationUI() {
    if (this.isStarted) return;
    
    this.elements.appRoot.classList.add('started');
    this.elements.tutorialBtn.style.display = 'block';
    this.isStarted = true;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

class Utils {
  /**
   * Capitalize headers by replacing underscores with spaces and capitalizing words
   * @param {string} str - The string to capitalize
   * @returns {string} Capitalized string
   */
  static capitalizeHeader(str) {
    return str.replace(/_/g, ' ')
             .split(' ')
             .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
             .join(' ');
  }
  
  /**
   * Capitalize the first letter of a string
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  static capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  /**
   * Scroll chat to bottom
   */
  static scrollChatToBottom(chatWindow, chatMessages) {
    chatWindow.scrollTop = chatMessages.scrollHeight;
  }
  
  /**
   * Toggle element disabled state
   * @param {HTMLElement[]} elements - Elements to toggle
   * @param {boolean} disabled - Whether to disable
   */
  static toggleDisabled(elements, disabled) {
    elements.forEach(el => el.disabled = disabled);
  }
}

// ============================================================================
// FORM HANDLING
// ============================================================================

class FormHandler {
  /**
   * Create a styled label element
   * @param {string} text - Label text
   * @returns {HTMLLabelElement} Styled label
   */
  static createLabel(text) {
    const label = document.createElement('label');
    label.textContent = `${Utils.capitalize(text)}: `;
    
    Object.assign(label.style, {
      marginRight: '10px',
      display: 'inline-block',
      width: CONFIG.STYLES.LABEL_WIDTH
    });
    
    return label;
  }
  
  /**
   * Apply common styles to form inputs
   * @param {HTMLElement} element - Element to style
   */
  static styleFormInput(element) {
    Object.assign(element.style, {
      marginBottom: '8px',
      marginRight: '5px',
      padding: '6px 8px',
      borderRadius: '5px',
      border: `1.2px solid ${CONFIG.STYLES.BORDER_COLOR}`,
      width: CONFIG.STYLES.INPUT_WIDTH
    });
  }
  
  /**
   * Create appropriate input field based on field type
   * @param {string} field - Field name
   * @returns {HTMLElement} Input element (input or select)
   */
  static createInputField(field) {
    const options = CONFIG.DROPDOWN_OPTIONS[field];
    
    if (options) {
      return this.createSelectField(field, options);
    }
    
    return this.createTextInput(field);
  }
  
  /**
   * Create a select dropdown field
   * @param {string} field - Field name
   * @param {string[]} options - Options for dropdown
   * @returns {HTMLSelectElement} Select element
   */
  static createSelectField(field, options) {
    const select = document.createElement('select');
    select.name = field;
    
    const optionElements = [
      `<option value="">Select ${field}</option>`,
      ...options.map(opt => 
        `<option value="${opt}">${Utils.capitalize(opt)}</option>`
      )
    ];
    
    select.innerHTML = optionElements.join('');
    this.styleFormInput(select);
    
    return select;
  }
  
  /**
   * Create a text/number input field
   * @param {string} field - Field name
   * @returns {HTMLInputElement} Input element
   */
  static createTextInput(field) {
    const input = document.createElement('input');
    input.type = field === 'marks' ? 'number' : 'text';
    input.name = field;
    
    this.styleFormInput(input);
    
    return input;
  }
  
  /**
   * Create dynamic dropdown with fetched options
   * @param {string} field - Field name
   * @param {string[]} options - Options array
   * @returns {HTMLSelectElement} Select element
   */
  static createDynamicDropdown(field, options) {
    const select = document.createElement('select');
    select.name = field;
    
    const optionElements = [
      `<option value="">Select ${field}</option>`,
      ...options.map(opt => `<option value="${opt}">${opt}</option>`)
    ];
    
    select.innerHTML = optionElements.join('');
    this.styleFormInput(select);
    
    return select;
  }
  
  /**
   * Create and append form to chat
   * @param {string[]} fields - Required fields
   * @param {string} intent - Form intent
   * @param {HTMLElement} chatMessages - Chat messages container
   */
  static async createForm(fields, intent, chatMessages) {
    const formContainer = this.createFormContainer();
    const form = document.createElement('form');
    form.id = 'action-form';
    
    // Handle forms that need dynamic name dropdown
    const needsDynamicNames = ['modify_marks', 'get_marks', 'delete_student'];
    
    if (needsDynamicNames.includes(intent)) {
      await this.addFieldsWithDynamicNames(form, fields, intent);
    } else {
      this.addStaticFields(form, fields);
    }
    
    this.attachSubmitHandler(form, formContainer, fields, intent, chatMessages);
    
    formContainer.appendChild(form);
    chatMessages.appendChild(formContainer);
    Utils.scrollChatToBottom(app.elements.chatWindow, chatMessages);
  }
  
  /**
   * Create form container div
   * @returns {HTMLDivElement} Form container
   */
  static createFormContainer() {
    const formDiv = document.createElement('div');
    formDiv.classList.add('message', 'bot');
    formDiv.style.marginTop = '10px';
    return formDiv;
  }
  
  /**
   * Add fields with dynamic name dropdown
   * @param {HTMLFormElement} form - Form element
   * @param {string[]} fields - Field names
   * @param {string} intent - Form intent
   */
  static async addFieldsWithDynamicNames(form, fields, intent) {
    try {
      const response = await fetch(CONFIG.ENDPOINTS.STUDENT_NAMES);
      const data = await response.json();
      const nameDropdown = this.createDynamicDropdown('name', data.names);
      
      // Add name dropdown if needed
      if (fields.includes('name')) {
        form.append(
          this.createLabel('name'), 
          nameDropdown, 
          document.createElement('br')
        );
      }
      
      // Add other fields
      this.addStaticFields(form, fields.filter(f => f !== 'name'));
      
    } catch (error) {
      console.error('Failed to fetch student names:', error);
      this.addStaticFields(form, fields); // Fallback to static fields
    }
  }
  
  /**
   * Add static form fields
   * @param {HTMLFormElement} form - Form element
   * @param {string[]} fields - Field names
   */
  static addStaticFields(form, fields) {
    fields.forEach(field => {
      form.append(
        this.createLabel(field),
        this.createInputField(field),
        document.createElement('br')
      );
    });
  }
  
  /**
   * Attach submit handler to form
   * @param {HTMLFormElement} form - Form element
   * @param {HTMLDivElement} container - Form container
   * @param {string[]} fields - Field names
   * @param {string} intent - Form intent
   * @param {HTMLElement} chatMessages - Chat messages container
   */
  static attachSubmitHandler(form, container, fields, intent, chatMessages) {
    const submitBtn = this.createSubmitButton();
    form.appendChild(submitBtn);
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleFormSubmit(form, container, fields, intent, chatMessages);
    });
  }
  
  /**
   * Create styled submit button
   * @returns {HTMLButtonElement} Submit button
   */
  static createSubmitButton() {
    const submitBtn = document.createElement('button');
    submitBtn.textContent = 'Submit';
    submitBtn.type = 'submit';
    
    Object.assign(submitBtn.style, {
      marginTop: '8px',
      padding: '8px 22px',
      backgroundColor: CONFIG.STYLES.BUTTON_COLOR,
      color: '#fff',
      border: 'none',
      borderRadius: '20px',
      cursor: 'pointer'
    });
    
    return submitBtn;
  }
  
  /**
   * Handle form submission
   * @param {HTMLFormElement} form - Form element
   * @param {HTMLDivElement} container - Form container
   * @param {string[]} fields - Field names
   * @param {string} intent - Form intent
   * @param {HTMLElement} chatMessages - Chat messages container
   */
  static async handleFormSubmit(form, container, fields, intent, chatMessages) {
    // Extract form data
    const formData = Object.fromEntries(
      fields.map(field => [field, form.elements[field]?.value || null])
    );
    
    // Remove form and show loading message
    container.remove();
    MessageHandler.appendMessage("Submitting details...", "bot", chatMessages, app.elements.chatWindow);
    
    try {
      const response = await fetch(CONFIG.ENDPOINTS.SUBMIT_FORM, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent, form: formData })
      });
      
      const data = await response.json();
      MessageHandler.appendMessage(data.response, "bot", chatMessages, app.elements.chatWindow);
      
    } catch (error) {
      console.error('Form submission error:', error);
      MessageHandler.appendMessage("Error: Could not submit form.", "bot", chatMessages, app.elements.chatWindow);
    }
  }
}

// ============================================================================
// MESSAGE HANDLING
// ============================================================================

class MessageHandler {
  /**
   * Append a text message to chat
   * @param {string} text - Message text
   * @param {string} sender - Message sender ('user' or 'bot')
   * @param {HTMLElement} chatMessages - Messages container
   * @param {HTMLElement} chatWindow - Chat window for scrolling
   */
  static appendMessage(text, sender, chatMessages, chatWindow) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    messageDiv.textContent = text;
    
    chatMessages.appendChild(messageDiv);
    Utils.scrollChatToBottom(chatWindow, chatMessages);
    
    // Start conversation UI on first message
    app.startConversationUI();
  }
  
  /**
   * Append a data table to chat
   * @param {Object[]} records - Data records
   * @param {string[]} fields - Field names for columns
   * @param {HTMLElement} chatMessages - Messages container
   * @param {HTMLElement} chatWindow - Chat window for scrolling
   */
  static appendTable(records, fields, chatMessages, chatWindow) {
    const table = this.createTable(records, fields);
    
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', 'bot');
    messageDiv.appendChild(table);
    
    chatMessages.appendChild(messageDiv);
    Utils.scrollChatToBottom(chatWindow, chatMessages);
  }
  
  /**
   * Create HTML table from data
   * @param {Object[]} records - Data records
   * @param {string[]} fields - Field names
   * @returns {HTMLTableElement} Table element
   */
  static createTable(records, fields) {
    const table = document.createElement('table');
    table.style.cssText = 'width:100%;border-collapse:collapse;margin-bottom:15px;';
    
    const headerRow = this.createTableHeader(fields);
    const bodyRows = this.createTableBody(records, fields);
    
    table.innerHTML = `
      <thead>${headerRow}</thead>
      <tbody>${bodyRows}</tbody>
    `;
    
    return table;
  }
  
  /**
   * Create table header HTML
   * @param {string[]} fields - Field names
   * @returns {string} Header HTML
   */
  static createTableHeader(fields) {
    const headerCells = fields.map(field => {
      const displayName = Utils.capitalizeHeader(field);
      return `<th style="border-bottom:2px solid #3949ab;padding:8px;text-align:left;color:#1a237e;">${displayName}</th>`;
    });
    
    return `<tr>${headerCells.join('')}</tr>`;
  }
  
  /**
   * Create table body HTML
   * @param {Object[]} records - Data records
   * @param {string[]} fields - Field names
   * @returns {string} Body HTML
   */
  static createTableBody(records, fields) {
    return records.map(record => {
      const cells = fields.map(field => {
        const value = record[field] ?? '';
        return `<td style="padding:8px;border-bottom:1px solid #ddd;">${value}</td>`;
      });
      
      return `<tr>${cells.join('')}</tr>`;
    }).join('');
  }
}

// ============================================================================
// API COMMUNICATION
// ============================================================================

class ApiClient {
  /**
   * Send message query to server
   * @param {string} message - User message
   * @returns {Promise<Object>} API response
   */
  static async sendQuery(message) {
    const response = await fetch(CONFIG.ENDPOINTS.QUERY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }
}

// ============================================================================
// TUTORIAL SYSTEM
// ============================================================================

class TutorialManager {
  constructor(elements) {
    this.elements = elements;
  }
  
  /**
   * Show main tutorial screen
   */
  showTutorialMain() {
    const { tutorialModal, tutorialContent } = this.elements;
    
    tutorialModal.classList.remove('hidden');
    tutorialContent.innerHTML = this.createMainTutorialHTML();
    
    // Attach event listeners
    document.getElementById('close-modal').onclick = () => this.hideTutorial();
    document.getElementById('show-feature-btn').onclick = () => this.handleFeatureSelect();
  }
  
  /**
   * Create main tutorial HTML
   * @returns {string} Tutorial HTML
   */
  createMainTutorialHTML() {
    const featureOptions = Object.keys(TUTORIAL_FEATURES)
      .map(feature => `<option value="${feature}">${Utils.capitalize(feature)}</option>`)
      .join('');
    
    return `
      <button id="close-modal" title="Close">&times;</button>
      <h2>Welcome to AskGrade!</h2>
      <p>Manage student records easily with simple commands.</p>
      <img src="static/img/mainmenu_placeholder.png" alt="Main menu example"><br>
      <select id="feature-select">
        <option value="">-- Select a feature --</option>
        ${featureOptions}
      </select><br>
      <button id="show-feature-btn">Show Feature Tutorial</button>
    `;
  }
  
  /**
   * Handle feature selection and show specific tutorial
   */
  handleFeatureSelect() {
    const selectedFeature = document.getElementById('feature-select').value;
    
    if (!selectedFeature || !TUTORIAL_FEATURES[selectedFeature]) {
      return;
    }
    
    const feature = TUTORIAL_FEATURES[selectedFeature];
    this.elements.tutorialContent.innerHTML = this.createFeatureTutorialHTML(selectedFeature, feature);
    
    // Attach event listeners
    document.getElementById('close-modal').onclick = () => this.hideTutorial();
    document.getElementById('back-btn').onclick = () => this.showTutorialMain();
  }
  
  /**
   * Create feature-specific tutorial HTML
   * @param {string} featureName - Feature name
   * @param {Object} feature - Feature data
   * @returns {string} Feature tutorial HTML
   */
  createFeatureTutorialHTML(featureName, feature) {
    return `
      <button id="close-modal" title="Close">&times;</button>
      <h2>${Utils.capitalize(featureName)}</h2>
      <p>${feature.desc}</p>
      <img src="${feature.img}" alt="Feature tutorial image">
      <p><strong>${feature.example}</strong></p>
      <button id="back-btn" style="background:#222945;color:#00c9d9;border:none;padding:7px 15px;font-size:16px;border-radius:8px;margin-top:6px">Back</button>
    `;
  }
  
  /**
   * Hide tutorial modal
   */
  hideTutorial() {
    this.elements.tutorialModal.classList.add('hidden');
  }
}

// ============================================================================
// MAIN APPLICATION
// ============================================================================

class ChatApplication extends AppState {
  constructor() {
    super();
    this.tutorialManager = new TutorialManager(this.elements);
  }
  
  /**
   * Send user message and handle response
   */
  async sendMessage() {
    const { userInput, sendBtn, chatMessages, chatWindow } = this.elements;
    const message = userInput.value.trim();
    
    if (!message) return;
    
    // Add user message and clear input
    MessageHandler.appendMessage(message, 'user', chatMessages, chatWindow);
    userInput.value = '';
    
    // Disable inputs during processing
    Utils.toggleDisabled([userInput, sendBtn], true);
    
    try {
      const data = await ApiClient.sendQuery(message);
      
      // Handle different response types
      await this.handleResponse(data, chatMessages, chatWindow);
      
    } catch (error) {
      console.error('Send message error:', error);
      MessageHandler.appendMessage('Error: Could not connect to server.', 'bot', chatMessages, chatWindow);
      
    } finally {
      // Re-enable inputs and focus
      Utils.toggleDisabled([userInput, sendBtn], false);
      userInput.focus();
    }
  }
  
  /**
   * Handle different types of API responses
   * @param {Object} data - API response data
   * @param {HTMLElement} chatMessages - Messages container
   * @param {HTMLElement} chatWindow - Chat window
   */
  async handleResponse(data, chatMessages, chatWindow) {
    // Always show the response message
    if (data.response) {
      MessageHandler.appendMessage(data.response, 'bot', chatMessages, chatWindow);
    }
    
    // Handle form requirement
    if (data.require_form && data.required_fields) {
      await FormHandler.createForm(data.required_fields, data.intent, chatMessages);
    }
    
    // Handle data table display
    if (data.records && data.record_fields) {
      MessageHandler.appendTable(data.records, data.record_fields, chatMessages, chatWindow);
    }
  }
  
  /**
   * Show main tutorial screen
   */
  showTutorialMain() {
    this.tutorialManager.showTutorialMain();
  }
}

// ============================================================================
// APPLICATION INITIALIZATION
// ============================================================================

// Initialize application when DOM is ready
let app;

document.addEventListener('DOMContentLoaded', () => {
  app = new ChatApplication();
});