// Get references to DOM elements
const languageSelect = document.getElementById('languageSelect');
const appTitle = document.getElementById('appTitle');
const appHeading = document.getElementById('appHeading');
const disclaimerTitle = document.getElementById('disclaimerTitle');
const disclaimerText = document.getElementById('disclaimerText');
const symptomsLabel = document.getElementById('symptomsLabel');
const symptomsInput = document.getElementById('symptoms');
const getDiagnosisBtn = document.getElementById('getDiagnosisBtn');
const diagnosisResultOutput = document.getElementById('diagnosisResultOutput');
const diagnosisResultContent = document.getElementById('diagnosisResultContent');
const errorOutput = document.getElementById('errorOutput');
const errorMessage = document.getElementById('errorMessage');
const diagnosisBtnText = document.getElementById('diagnosisBtnText');
const diagnosisHeading = document.getElementById('diagnosisHeading');
const errorTitle = document.getElementById('errorTitle');

// Text content for different languages
const translations = {
    en: {
        appTitle: 'Medical Assistant App',
        appHeading: 'Medical Assistant App',
        disclaimerTitle: 'Disclaimer:',
        disclaimerText: 'This app is for informational purposes only and should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare professional for any health concerns.',
        symptomsLabel: 'Enter Symptoms and Observations:',
        symptomsPlaceholder: "e.g., 'Fever, cough, sore throat, body aches, headache, fatigue for 3 days.'",
        getDiagnosisBtn: 'Get Differential Diagnosis',
        getDiagnosisLoading: 'Getting Diagnosis...',
        diagnosisHeading: 'Diagnosis & Treatment Suggestions:',
        errorTitle: 'Error:',
        errorMessageGeneric: 'Could not get a response. Please try again or rephrase your input.',
        errorMessageNetwork: 'An error occurred while fetching the response. Please check your network connection and try again.'
    },
    el: {
        appTitle: 'Ιατρικός Βοηθός Εφαρμογή',
        appHeading: 'Εφαρμογή Ιατρικού Βοηθού',
        disclaimerTitle: 'Αποποίηση Ευθύνης:',
        disclaimerText: 'Αυτή η εφαρμογή προορίζεται μόνο για ενημερωτικούς σκοπούς και δεν πρέπει να χρησιμοποιηθεί ως υποκατάστατο επαγγελματικής ιατρικής συμβουλής, διάγνωσης ή θεραπείας. Πάντα να συμβουλεύεστε έναν εξειδικευμένο επαγγελματία υγείας για οποιεσδήποτε ανησυχίες για την υγεία.',
        symptomsLabel: 'Εισαγάγετε Συμπτώματα και Παρατηρήσεις:',
        symptomsPlaceholder: "π.χ., 'Πυρετός, βήχας, πονόλαιμος, μυϊκοί πόνοι, πονοκέφαλος, κόπωση για 3 ημέρες.'",
        getDiagnosisBtn: 'Λήψη Διαφορικής Διάγνωσης',
        getDiagnosisLoading: 'Λήψη Διάγνωσης...',
        diagnosisHeading: 'Προτάσεις Διάγνωσης & Θεραπείας:',
        errorTitle: 'Σφάλμα:',
        errorMessageGeneric: 'Δεν ήταν δυνατή η λήψη απάντησης. Παρακαλώ δοκιμάστε ξανά ή αναδιατυπώστε την εισαγωγή σας.',
        errorMessageNetwork: 'Παρουσιάστηκε σφάλμα κατά τη λήψη της απάντησης. Ελέγξτε τη σύνδεσή σας στο δίκτυο και δοκιμάστε ξανά.'
    }
};

let currentLanguage = 'en'; // Default language

// Function to update all UI text based on the selected language
function updateUI(lang) {
    appTitle.textContent = translations[lang].appTitle;
    appHeading.textContent = translations[lang].appHeading;
    disclaimerTitle.textContent = translations[lang].disclaimerTitle;
    disclaimerText.textContent = translations[lang].disclaimerText;
    symptomsLabel.textContent = translations[lang].symptomsLabel;
    symptomsInput.placeholder = translations[lang].symptomsPlaceholder;
    diagnosisBtnText.innerHTML = translations[lang].getDiagnosisBtn;
    diagnosisHeading.textContent = translations[lang].diagnosisHeading;
    errorTitle.textContent = translations[lang].errorTitle;

    // Re-evaluate button states to apply correct loading text if already loading
    updateButtonStates();
}

// Event listener for language selection change
languageSelect.addEventListener('change', (event) => {
    currentLanguage = event.target.value;
    updateUI(currentLanguage);
});

// State variables (equivalent to React's useState)
let isLoadingDiagnosis = false;

// Helper function to show/hide loading spinner on buttons
function toggleLoading(buttonTextElement, isLoading, originalTextKey) {
    const loadingTextKey = originalTextKey + 'Loading';
    const textToDisplay = isLoading ? translations[currentLanguage][loadingTextKey] : translations[currentLanguage][originalTextKey];

    if (isLoading) {
        buttonTextElement.innerHTML = `
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            ${textToDisplay}
        `;
    } else {
        buttonTextElement.innerHTML = textToDisplay;
    }
}

// Helper function to update button disabled state
function updateButtonStates() {
    const symptomsTrimmed = symptomsInput.value.trim();
    getDiagnosisBtn.disabled = isLoadingDiagnosis || !symptomsTrimmed;

    // Ensure loading text is correct if a button is currently loading
    toggleLoading(diagnosisBtnText, isLoadingDiagnosis, 'getDiagnosisBtn');
}

// Initial button states (called after updateUI to ensure correct initial text)
updateButtonStates();

// Listen for input changes to enable/disable buttons
symptomsInput.addEventListener('input', updateButtonStates);

/**
 * Generic function to call the Gemini API.
 * @param {string} prompt - The prompt to send to the LLM.
 * @param {function} setLoadingStateSetter - A function to set the loading state variable.
 * @param {HTMLElement} resultOutputElement - The DOM element to display the result.
 * @param {HTMLElement} resultContentElement - The DOM element to display the result content.
 * @param {HTMLElement} buttonTextElement - The DOM element containing the button's text.
 * @param {string} originalButtonTextKey - The key for the original text of the button in translations.
 */
async function callGeminiAPI(prompt, setLoadingStateSetter, resultOutputElement, resultContentElement, buttonTextElement, originalButtonTextKey) {
    // Clear previous results and errors
    resultContentElement.innerHTML = '';
    resultOutputElement.classList.add('hidden');
    errorOutput.classList.add('hidden');
    errorMessage.textContent = '';

    // Set loading state
    setLoadingStateSetter(true);
    toggleLoading(buttonTextElement, true, originalTextKey);
    updateButtonStates();

    try {
        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });
        const payload = { contents: chatHistory };

        const apiKey = "417602721268-0j3hhe67is6355n5teasbbsa66gef3pq.apps.googleusercontent.com"; // API key (left empty as per instructions, will be provided by environment)
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const text = result.candidates[0].content.parts[0].text;
            resultContentElement.innerHTML = text.replace(/\n/g, '<br />'); // Preserve newlines
            resultOutputElement.classList.remove('hidden');
        } else {
            errorMessage.textContent = translations[currentLanguage].errorMessageGeneric;
            errorOutput.classList.remove('hidden');
            console.error('Unexpected API response structure:', result);
        }
    } catch (err) {
        errorMessage.textContent = translations[currentLanguage].errorMessageNetwork;
        errorOutput.classList.remove('hidden');
        console.error('Error during API call:', err);
    } finally {
        setLoadingStateSetter(false); // Always set loading state to false
        toggleLoading(buttonTextElement, false, originalTextKey);
        updateButtonStates();
    }
}

/**
 * Handles the click event for the "Get Differential Diagnosis" button.
 */
getDiagnosisBtn.addEventListener('click', async () => {
    // Clear previous results
    diagnosisResultOutput.classList.add('hidden');
    diagnosisResultContent.innerHTML = '';
    errorOutput.classList.add('hidden');
    errorMessage.textContent = '';

    const prompt = `Based on the following symptoms and observations, provide a differential diagnosis and possible treatments.
    
    Symptoms and Observations: ${symptomsInput.value}
    
    Please format your response clearly, listing potential conditions and then associated treatment suggestions.
    
    IMPORTANT DISCLAIMER: This information is for educational purposes only and should not be considered medical advice. Always consult a qualified healthcare professional for diagnosis and treatment. Please respond in ${currentLanguage === 'el' ? 'Greek' : 'English'}.`;

    await callGeminiAPI(prompt, (state) => isLoadingDiagnosis = state, diagnosisResultOutput, diagnosisResultContent, diagnosisBtnText, 'getDiagnosisBtn');
});

// Initialize UI with default language (English)
updateUI(currentLanguage);
