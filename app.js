// Email Spam Classifier Frontend Logic
// Handles user interactions and API communication

const emailForm = document.getElementById("prediction-form");
const resultsDiv = document.getElementById("result");
const emailTextarea = document.getElementById("email-input");
const classifyButton = document.getElementById("submit-btn");
const API_ENDPOINT = "http://localhost:8000/predict";

// Send email text to API for classification
async function classifyEmail(emailText) {
    const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text: emailText })
    });

    if (!response.ok) {
        const errorInfo = await response.json().catch(() => ({}));
        throw new Error(errorInfo.detail || "API request failed");
    }
    return await response.json();
}

// Show loading state during API call
function setLoadingState(isLoading) {
    if (isLoading) {
        classifyButton.disabled = true;
        classifyButton.classList.add("loading");
        classifyButton.innerHTML = '<i class="fas fa-spinner"></i> Processing...';
    } else {
        classifyButton.disabled = false;
        classifyButton.classList.remove("loading");
        classifyButton.innerHTML = '<i class="fas fa-search"></i> Classify Email';
    }
}

// Display error message to user
function displayError(errorMsg) {
    resultsDiv.className = "result show";
    resultsDiv.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            <span><strong>Error:</strong> ${errorMsg}</span>
        </div>
    `;
}

// Format and display classification results
function displayResults(classificationData) {
    const result = classificationData.results[0];
    const isSpamResult = result.category === "spam";
    const confidencePercent = (result.confidence * 100).toFixed(2);
    const statusIcon = isSpamResult ? "fa-exclamation-triangle" : "fa-check-circle";
    const badgeType = isSpamResult ? "spam" : "ham";
    const categoryLabel = isSpamResult ? "SPAM" : "NOT SPAM";
    const gradientStyle = isSpamResult 
        ? "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)" 
        : "linear-gradient(135deg, #10b981 0%, #059669 100%)";
    const statusColor = isSpamResult ? '#ef4444' : '#10b981';
    
    resultsDiv.className = "result show";
    resultsDiv.innerHTML = `
        <div class="result-header">
            <i class="fas ${statusIcon} result-icon" style="color: ${statusColor}"></i>
            <span>Analysis Complete</span>
        </div>
        <div class="result-content">
            <div class="result-item">
                <span class="result-label">
                    <i class="fas fa-tag"></i> Result
                </span>
                <span class="label-badge ${badgeType}">
                    <i class="fas ${isSpamResult ? 'fa-ban' : 'fa-check-circle'}"></i>
                    ${categoryLabel}
                </span>
            </div>
            <div class="result-item">
                <span class="result-label">
                    <i class="fas fa-percentage"></i> Confidence
                </span>
                <span class="result-value" style="color: ${statusColor}; font-size: 1.3rem;">
                    ${confidencePercent}%
                </span>
            </div>
            <div style="margin-top: 10px;">
                <div class="probability-bar">
                    <div class="probability-fill" style="width: ${confidencePercent}%; background: ${gradientStyle}"></div>
                </div>
            </div>
            <div style="margin-top: 20px; padding: 16px; background: ${isSpamResult ? '#fef2f2' : '#f0fdf4'}; border-radius: 12px; border-left: 4px solid ${statusColor};">
                <p style="margin: 0; color: ${isSpamResult ? '#991b1b' : '#065f46'}; font-weight: 600;">
                    <i class="fas ${isSpamResult ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
                    ${isSpamResult 
                        ? `Email classified as SPAM (${confidencePercent}% confidence). Be cautious with links and attachments.` 
                        : `Email classified as NOT SPAM (${confidencePercent}% confidence). Still verify sender authenticity.`}
                </p>
            </div>
        </div>
    `;
    
    // Animate confidence bar
    setTimeout(() => {
        const barFill = resultsDiv.querySelector('.probability-fill');
        if (barFill) {
            barFill.style.width = `${confidencePercent}%`;
        }
    }, 100);
}

// Handle form submission
emailForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const emailText = emailTextarea.value.trim();
    
    if (!emailText) {
        displayError("Please enter email content to analyze.");
        return;
    }
    
    setLoadingState(true);
    
    try {
        const apiResponse = await classifyEmail(emailText);
        setLoadingState(false);
        displayResults(apiResponse);
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (error) {
        setLoadingState(false);
        console.error("Classification error:", error);
        displayError(error.message || "Unable to classify email. Ensure API server is running.");
    }
});

// Character counter for textarea
emailTextarea.addEventListener('input', function() {
    const currentLength = this.value.length;
    const maxLength = 5000;
    
    let counterElement = this.nextElementSibling;
    if (!counterElement || !counterElement.classList.contains('char-counter')) {
        counterElement = document.createElement('div');
        counterElement.className = 'char-counter';
        counterElement.style.cssText = 'text-align: right; margin-top: 5px; font-size: 0.85rem; color: #6b7280;';
        this.parentNode.insertBefore(counterElement, this.nextSibling);
    }
    
    if (currentLength > maxLength) {
        counterElement.textContent = `${currentLength}/${maxLength} characters (limit exceeded)`;
        counterElement.style.color = '#ef4444';
    } else {
        counterElement.textContent = `${currentLength}/${maxLength} characters`;
        counterElement.style.color = '#6b7280';
    }
});
