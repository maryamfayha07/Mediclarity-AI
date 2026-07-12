// MediClarity AI - Universal Interpreter Frontend Controller

let currentAnalysisData = null; // Store current analysis JSON
let activeTabId = 'tab-findings';
let isDarkMode = false;

// Theme Controller
const themeToggleBtn = document.getElementById("themeToggleBtn");
const themeIcon = document.getElementById("themeIcon");

if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
        isDarkMode = !isDarkMode;
        if (isDarkMode) {
            document.documentElement.classList.add("dark");
            themeIcon.setAttribute("data-lucide", "moon");
        } else {
            document.documentElement.classList.remove("dark");
            themeIcon.setAttribute("data-lucide", "sun");
        }
        lucide.createIcons();
    });
}

// Reset Handler
const resetBtn = document.getElementById("resetAnalysisBtn");
if (resetBtn) {
    resetBtn.addEventListener("click", () => {
        document.getElementById("rawReportInput").value = "";
        document.getElementById("fileInput").value = "";
        document.getElementById("fileFeedback").classList.add("hidden");
        document.getElementById("resultState").classList.add("hidden");
        document.getElementById("idleState").classList.remove("hidden");
        document.getElementById("loaderState").classList.add("hidden");
        currentAnalysisData = null;
        window.speechSynthesis.cancel();
    });
}

// File Drag & Drop
const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const fileFeedback = document.getElementById("fileFeedback");
const fileNameSpan = document.getElementById("fileName");
const removeFileBtn = document.getElementById("removeFileBtn");

if (dropzone && fileInput) {
    fileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
            handleSelectedFile(e.target.files[0]);
        }
    });

    dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.classList.add("border-indigo-500", "bg-indigo-50/10");
    });

    dropzone.addEventListener("dragleave", () => {
        dropzone.classList.remove("border-indigo-500", "bg-indigo-50/10");
    });

    dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.classList.remove("border-indigo-500", "bg-indigo-50/10");
        if (e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files;
            handleSelectedFile(e.dataTransfer.files[0]);
        }
    });
}

if (removeFileBtn) {
    removeFileBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        fileInput.value = "";
        fileFeedback.classList.add("hidden");
    });
}

function handleSelectedFile(file) {
    fileNameSpan.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
    fileFeedback.classList.remove("hidden");
}

// Tab Switching
function switchTab(tabId) {
    activeTabId = tabId;
    
    // Hide all tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Show active tab content
    document.getElementById(tabId).classList.remove('hidden');
    
    // Reset active button borders
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('border-indigo-500', 'text-indigo-600');
        btn.classList.add('border-transparent', 'text-slate-500');
    });
    
    // Highlight active button
    const activeBtn = document.getElementById(`btn-${tabId}`);
    if (activeBtn) {
        activeBtn.classList.add('border-indigo-500', 'text-indigo-600');
        activeBtn.classList.remove('border-transparent', 'text-slate-500');
    }
}

// Search Glossary
function searchGlossary() {
    const query = document.getElementById("glossarySearch").value.toLowerCase();
    document.querySelectorAll(".glossary-item").forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(query)) {
            item.classList.remove("hidden");
        } else {
            item.classList.add("hidden");
        }
    });
}

// Copy Questions
function copyQuestions() {
    const questions = Array.from(document.querySelectorAll("#questionsList li"))
        .map(li => li.textContent.trim())
        .join("\n");
    navigator.clipboard.writeText(questions).then(() => {
        alert("Discussion questions copied to clipboard!");
    });
}

// Text to Speech
function speakSummary() {
    window.speechSynthesis.cancel(); // Stop any current speech
    const summaryText = document.getElementById("summaryOutput").textContent;
    if (!summaryText) return;

    const utterance = new SpeechSynthesisUtterance(summaryText);
    utterance.rate = 0.85; // Slow, pleasant reading rate
    utterance.pitch = 1.0;
    
    // Select a pleasant voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(voice => voice.lang.includes("en") && voice.name.includes("Natural"));
    if (englishVoice) {
        utterance.voice = englishVoice;
    }
    
    window.speechSynthesis.speak(utterance);
}

// Print Report
function printReport() {
    window.print();
}

// Main Decode Submission Action
const decodeBtn = document.getElementById("decodeBtn");
if (decodeBtn) {
    decodeBtn.addEventListener("click", async () => {
        const rawReport = document.getElementById("rawReportInput").value.trim();
        const file = fileInput.files[0];

        if (!rawReport && !file) {
            alert("Please input some lab text or upload a medical report file first.");
            return;
        }

        // Hide old states
        document.getElementById("idleState").classList.add("hidden");
        document.getElementById("resultState").classList.add("hidden");
        const loader = document.getElementById("loaderState");
        loader.classList.remove("hidden");

        // Cycle through loading descriptions
        const phases = [
            "Structuring biomarkers...",
            "Isolating range deviations...",
            "Formulating physician discussion notes...",
            "Creating patient explanation..."
        ];
        let phaseIdx = 0;
        const phaseLabel = document.getElementById("loaderPhase");
        const phaseInterval = setInterval(() => {
            phaseIdx = (phaseIdx + 1) % phases.length;
            phaseLabel.textContent = phases[phaseIdx];
        }, 1500);

        try {
            const formData = new FormData();
            if (rawReport) formData.append("textReport", rawReport);
            if (file) formData.append("file", file);

            const response = await fetch("/api/decode", {
                method: "POST",
                body: formData
            });

            const result = await response.json();
            clearInterval(phaseInterval);
            loader.classList.add("hidden");

            if (result.success && result.data) {
                currentAnalysisData = result.data;
                renderReport(currentAnalysisData);
                document.getElementById("resultState").classList.remove("hidden");
                // Scroll to result view
                document.getElementById("resultState").scrollIntoView({ behavior: 'smooth' });
            } else {
                alert(`Analysis error: ${result.error || 'Unable to parse'}`);
                document.getElementById("idleState").classList.remove("hidden");
            }
        } catch (err) {
            clearInterval(phaseInterval);
            loader.classList.add("hidden");
            alert(`Network or server error: ${err.message}`);
            document.getElementById("idleState").classList.remove("hidden");
        }
    });
}

// Language Selector Change listener
const langSelect = document.getElementById("langSelect");
if (langSelect) {
    langSelect.addEventListener("change", async (e) => {
        if (!currentAnalysisData) return;
        const selectedLanguage = e.target.value;

        // Display translation loader state
        const originalText = decodeBtn.querySelector("span").textContent;
        decodeBtn.disabled = true;
        decodeBtn.querySelector("span").textContent = `Translating to ${selectedLanguage}...`;

        try {
            const response = await fetch("/api/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    medicalData: currentAnalysisData,
                    targetLanguage: selectedLanguage
                })
            });
            const result = await response.json();
            if (result.success && result.data) {
                renderReport(result.data);
            } else {
                alert("Translation failed. Keeping English display.");
            }
        } catch (err) {
            console.error("Translation error:", err);
        } finally {
            decodeBtn.disabled = false;
            decodeBtn.querySelector("span").textContent = originalText;
        }
    });
}

// Render dynamic results into DOM
function renderReport(data) {
    // Executive Summary
    document.getElementById("summaryOutput").textContent = data.summary || "No summary provided.";

    // Urgency Level
    const level = (data.risk && data.risk.level) ? data.risk.level.toUpperCase() : "LOW";
    const explain = (data.risk && data.risk.explanation) ? data.risk.explanation : "All biomarkers appear optimal.";
    
    document.getElementById("urgencyText").textContent = level;
    document.getElementById("urgencyExplanation").textContent = explain;
    
    const badge = document.getElementById("urgencyBadge");
    const dot = document.getElementById("urgencyDot");
    
    badge.className = "px-3 py-1.5 rounded-full flex items-center space-x-1.5 font-bold text-xs uppercase";
    dot.className = "w-2.5 h-2.5 rounded-full";

    if (level === "HIGH") {
        badge.classList.add("bg-rose-50", "text-rose-700", "border", "border-rose-100", "dark:bg-rose-950/20", "dark:text-rose-400");
        dot.classList.add("bg-rose-500");
    } else if (level === "MEDIUM") {
        badge.classList.add("bg-amber-50", "text-amber-700", "border", "border-amber-100", "dark:bg-amber-950/20", "dark:text-amber-400");
        dot.classList.add("bg-amber-500");
    } else {
        badge.classList.add("bg-emerald-50", "text-emerald-700", "border", "border-emerald-100", "dark:bg-emerald-950/20", "dark:text-emerald-400");
        dot.classList.add("bg-emerald-500");
    }

    // Findings Accordion list
    const findingsContainer = document.getElementById("findingsContainer");
    findingsContainer.innerHTML = "";
    
    if (data.findings && data.findings.length > 0) {
        data.findings.forEach((find, idx) => {
            let severityClass = "bg-emerald-50/50 text-emerald-800 border-emerald-100 dark:bg-emerald-950/10 dark:text-emerald-400";
            if (find.severity.includes("Rose") || find.severity.includes("Abnormal") || find.severity.includes("HIGH")) {
                severityClass = "bg-rose-50/50 text-rose-800 border-rose-100 dark:bg-rose-950/10 dark:text-rose-400";
            } else if (find.severity.includes("Amber") || find.severity.includes("Attention") || find.severity.includes("MEDIUM")) {
                severityClass = "bg-amber-50/50 text-amber-800 border-amber-100 dark:bg-amber-950/10 dark:text-amber-400";
            }

            const accordion = document.createElement("div");
            accordion.className = "border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm";
            accordion.innerHTML = `
                <button onclick="toggleAccordion(this)" class="w-full text-left p-4 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between font-medium text-xs sm:text-sm text-slate-800 dark:text-slate-200 transition-colors">
                    <div class="flex items-center space-x-2">
                        <span class="px-2 py-0.5 rounded text-[10px] font-semibold border ${severityClass}">${find.severity}</span>
                        <span>${find.finding}</span>
                    </div>
                    <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 shrink-0 transition-transform"></i>
                </button>
                <div class="accordion-content border-t border-slate-50 dark:border-slate-850 bg-white dark:bg-slate-900">
                    <p class="p-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">${find.details}</p>
                </div>
            `;
            findingsContainer.appendChild(accordion);
        });
    } else {
        findingsContainer.innerHTML = `<p class="text-xs text-slate-400 text-center py-4">No findings detected.</p>`;
    }

    // Out of Range Values Table
    const outliersTableBody = document.getElementById("outliersTableBody");
    outliersTableBody.innerHTML = "";
    
    if (data.abnormalValues && data.abnormalValues.length > 0) {
        data.abnormalValues.forEach(item => {
            let badgeClass = "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400";
            if (item.status === "High" || item.status === "Critical") {
                badgeClass = "text-rose-700 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-400 font-semibold";
            } else if (item.status === "Low") {
                badgeClass = "text-amber-700 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400";
            }

            const tr = document.createElement("tr");
            tr.className = "hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors";
            tr.innerHTML = `
                <td class="px-4 py-3.5 font-medium text-slate-800 dark:text-slate-200">${item.testName}</td>
                <td class="px-4 py-3.5"><span class="px-2 py-0.5 rounded text-xs ${badgeClass}">${item.value}</span></td>
                <td class="px-4 py-3.5 text-slate-400 font-mono">${item.referenceRange}</td>
                <td class="px-4 py-3.5 text-slate-600 dark:text-slate-400 leading-relaxed">${item.note}</td>
            `;
            outliersTableBody.appendChild(tr);
        });
    } else {
        outliersTableBody.innerHTML = `
            <tr>
                <td colspan="4" class="px-4 py-6 text-center text-slate-400">No abnormal values flagged. All checked lab values are normal.</td>
            </tr>
        `;
    }

    // Medical Glossary Cards
    const glossaryContainer = document.getElementById("glossaryContainer");
    glossaryContainer.innerHTML = "";
    
    if (data.medicalTerms && data.medicalTerms.length > 0) {
        data.medicalTerms.forEach(termItem => {
            const card = document.createElement("div");
            card.className = "glossary-item p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm";
            card.innerHTML = `
                <h5 class="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-1">
                    <i data-lucide="book-open" class="w-3.5 h-3.5 text-indigo-500"></i>
                    <span>${termItem.term}</span>
                </h5>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">${termItem.simpleExplanation}</p>
            `;
            glossaryContainer.appendChild(card);
        });
    } else {
        glossaryContainer.innerHTML = `<p class="text-xs text-slate-400 col-span-2 text-center py-4">No glossary terms found.</p>`;
    }

    // Collective Meaning
    document.getElementById("meaningOutput").textContent = data.possibleMeaning || "No cumulative diagnosis connection reported.";

    // Lifestyle suggestions
    const lifestyleContainer = document.getElementById("lifestyleContainer");
    lifestyleContainer.innerHTML = "";
    
    if (data.lifestyleSuggestions && data.lifestyleSuggestions.length > 0) {
        data.lifestyleSuggestions.forEach(item => {
            let catIcon = "activity";
            let colorTheme = "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20";
            if (item.category === "Hydration") {
                catIcon = "droplet";
                colorTheme = "text-blue-500 bg-blue-50 dark:bg-blue-950/20";
            } else if (item.category === "Nutrition") {
                catIcon = "soup";
                colorTheme = "text-amber-500 bg-amber-50 dark:bg-amber-950/20";
            } else if (item.category === "Sleep") {
                catIcon = "moon";
                colorTheme = "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20";
            } else if (item.category === "Exercise") {
                catIcon = "dumbbell";
                colorTheme = "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20";
            } else if (item.category === "Stress Management") {
                catIcon = "brain";
                colorTheme = "text-purple-500 bg-purple-50 dark:bg-purple-950/20";
            }

            const card = document.createElement("div");
            card.className = "p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2";
            card.innerHTML = `
                <div class="flex items-center space-x-2">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center ${colorTheme}">
                        <i data-lucide="${catIcon}" class="w-4.5 h-4.5"></i>
                    </div>
                    <span class="text-xs font-bold text-slate-800 dark:text-slate-100">${item.category}</span>
                </div>
                <div class="space-y-1">
                    <p class="text-xs font-semibold text-slate-700 dark:text-slate-200">${item.advice}</p>
                    <p class="text-[10px] text-slate-400 leading-normal"><strong class="text-[10px] uppercase font-bold tracking-wider text-slate-400">Benefit:</strong> ${item.benefit}</p>
                </div>
            `;
            lifestyleContainer.appendChild(card);
        });
    }

    // Doctor discussion questions
    const questionsList = document.getElementById("questionsList");
    questionsList.innerHTML = "";
    
    if (data.doctorQuestions && data.doctorQuestions.length > 0) {
        data.doctorQuestions.forEach(q => {
            const li = document.createElement("li");
            li.className = "flex items-start space-x-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-950/30 p-2.5 rounded-xl border border-slate-100/50 dark:border-slate-850";
            li.innerHTML = `
                <span class="text-indigo-500 shrink-0 font-bold">?</span>
                <span>${q}</span>
            `;
            questionsList.appendChild(li);
        });
    } else {
        questionsList.innerHTML = `<p class="text-xs text-slate-400 text-center">No questions suggested.</p>`;
    }

    // Refresh lucide icons
    lucide.createIcons();
}

// Accordion Toggle Handlers
function toggleAccordion(button) {
    const parent = button.parentElement;
    const isActive = parent.classList.contains("accordion-active");
    const icon = button.querySelector("[data-lucide='chevron-down']");

    // Close any other open accordions
    document.querySelectorAll(".accordion-active").forEach(el => {
        el.classList.remove("accordion-active");
        const elIcon = el.querySelector("[data-lucide='chevron-down']");
        if (elIcon) elIcon.style.transform = "rotate(0deg)";
    });

    if (!isActive) {
        parent.classList.add("accordion-active");
        if (icon) icon.style.transform = "rotate(180deg)";
    } else {
        parent.classList.remove("accordion-active");
        if (icon) icon.style.transform = "rotate(0deg)";
    }
}
