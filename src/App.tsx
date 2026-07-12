import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  Volume2,
  VolumeX,
  Printer,
  RotateCcw,
  Sparkles,
  UploadCloud,
  FileText,
  ChevronRight,
  ChevronDown,
  Activity,
  AlertTriangle,
  Search,
  BookOpen,
  MessageSquare,
  Copy,
  Check,
  Droplet,
  Soup,
  Moon,
  Dumbbell,
  Brain,
  Sun,
  X,
  Heart,
  Smile,
  Users,
  Share2,
  Link,
  Shield,
  Zap,
  CheckCircle2,
  Tv
} from "lucide-react";

import PresentationDeck from "./components/PresentationDeck";

// Types
interface Finding {
  finding: string;
  severity: string;
  details: string;
}

interface AbnormalValue {
  testName: string;
  value: string;
  referenceRange: string;
  status: string;
  note: string;
}

interface MedicalTerm {
  term: string;
  simpleExplanation: string;
}

interface Risk {
  level: string;
  explanation: string;
}

interface LifestyleSuggestion {
  category: string;
  advice: string;
  benefit: string;
}

interface MedicalReportData {
  summary: string;
  findings: Finding[];
  abnormalValues: AbnormalValue[];
  medicalTerms: MedicalTerm[];
  possibleMeaning: string;
  risk: Risk;
  lifestyleSuggestions: LifestyleSuggestion[];
  doctorQuestions: string[];
}

// Languages supported
const LANGUAGES = [
  { code: "English", name: "🇬🇧 English" },
  { code: "Spanish", name: "🇪🇸 Español" },
  { code: "French", name: "🇫🇷 Français" },
  { code: "German", name: "🇩🇪 Deutsch" },
  { code: "Chinese", name: "🇨🇳 中文" },
  { code: "Arabic", name: "🇸🇦 العربية" },
  { code: "Urdu", name: "🇵🇰 اردو" },
  { code: "Hindi", name: "🇮🇳 हिन्दी" },
  { code: "Marathi", name: "🇮🇳 मराठी" },
  { code: "Japanese", name: "🇯🇵 日本語" }
];

// Helper functions for share link generation (Base64 UTF-8 safe)
function encodeShareData(data: MedicalReportData): string {
  try {
    const jsonStr = JSON.stringify(data);
    const encoded = btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }));
    return encoded;
  } catch (err) {
    printError("Error encoding share data", err);
    return "";
  }
}

function decodeShareData(encoded: string): MedicalReportData | null {
  try {
    const decodedStr = decodeURIComponent(atob(encoded).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(decodedStr);
  } catch (err) {
    printError("Error decoding share data", err);
    return null;
  }
}

// Simple internal logger helper
function printError(msg: string, err: any) {
  console.error(msg, err);
}

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("English");
  const [rawText, setRawText] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingPhase, setLoadingPhase] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<MedicalReportData | null>(null);
  const [translatedResult, setTranslatedResult] = useState<MedicalReportData | null>(null);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("findings");
  const [expandedAccordion, setExpandedAccordion] = useState<number | null>(0);
  const [glossarySearch, setGlossarySearch] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedQuestions, setCopiedQuestions] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadedFromShare, setIsLoadedFromShare] = useState<boolean>(false);
  const [copiedShareLink, setCopiedShareLink] = useState<boolean>(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState<boolean>(false);
  
  const dropRef = useRef<HTMLDivElement>(null);

  // Apply Theme
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Handle Cycling Loading Phases
  useEffect(() => {
    if (!isLoading) return;
    const phases = [
      "Structuring biomarkers...",
      "Isolating range deviations...",
      "Formulating physician discussion notes...",
      "Creating patient explanation..."
    ];
    setLoadingPhase(phases[0]);
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % phases.length;
      setLoadingPhase(phases[index]);
    }, 1800);

    return () => clearInterval(interval);
  }, [isLoading]);

  // Handle TTS cleanup on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Load Shared Report from URL Hash
  useEffect(() => {
    const checkShareHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#share=")) {
        const shareCode = hash.substring(7);
        if (shareCode) {
          const decoded = decodeShareData(shareCode);
          if (decoded) {
            setAnalysisResult(decoded);
            setTranslatedResult(decoded);
            setIsLoadedFromShare(true);
            setActiveTab("findings");
            // Scroll to results-section smoothly
            setTimeout(() => {
              const resultsSection = document.getElementById("results-section");
              if (resultsSection) {
                resultsSection.scrollIntoView({ behavior: "smooth" });
              }
            }, 400);
          }
        }
      }
    };

    checkShareHash();
    window.addEventListener("hashchange", checkShareHash);
    return () => window.removeEventListener("hashchange", checkShareHash);
  }, []);

  const handleShareReport = () => {
    if (!translatedResult) return;
    try {
      const shareCode = encodeShareData(translatedResult);
      if (shareCode) {
        const permalink = `${window.location.origin}${window.location.pathname}#share=${shareCode}`;
        navigator.clipboard.writeText(permalink);
        setCopiedShareLink(true);
        setTimeout(() => setCopiedShareLink(false), 2500);
      }
    } catch (err) {
      console.error("Failed to copy share link:", err);
    }
  };



  // Reset Handler
  const handleReset = () => {
    setRawText("");
    setFile(null);
    setFileBase64(null);
    setFileType("");
    setAnalysisResult(null);
    setTranslatedResult(null);
    setActiveTab("findings");
    setGlossarySearch("");
    setErrorMessage(null);
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setIsLoadedFromShare(false);
    window.location.hash = "";
  };



  // Handle File Upload Select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setFileType(selectedFile.type);
    
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFileBase64(result);
    };
    reader.readAsDataURL(selectedFile);
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (dropRef.current) {
      dropRef.current.classList.add("border-indigo-500", "bg-indigo-50/10");
    }
  };

  const handleDragLeave = () => {
    if (dropRef.current) {
      dropRef.current.classList.remove("border-indigo-500", "bg-indigo-50/10");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleDragLeave();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Submit report to Backend Node-Express Server
  const handleDecode = async () => {
    if (!rawText && !file) {
      setErrorMessage("Please upload a file or type/paste your medical indicators first.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setAnalysisResult(null);
    setTranslatedResult(null);
    setSelectedLanguage("English");
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setIsLoadedFromShare(false);
    window.location.hash = "";

    try {
      const response = await fetch("/api/decode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textReport: rawText,
          fileData: fileBase64,
          mimeType: fileType
        }),
      });

      const result = await response.json();
      if (response.ok && result.success && result.data) {
        setAnalysisResult(result.data);
        setTranslatedResult(result.data); // Initial translation is same
      } else {
        setErrorMessage(result.error || "An error occurred while decoding your report.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(`Connection failed: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Translate result
  const handleTranslate = async (lang: string) => {
    setSelectedLanguage(lang);
    if (!analysisResult) return;

    if (lang === "English") {
      setTranslatedResult(analysisResult);
      return;
    }

    setIsTranslating(true);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicalData: analysisResult,
          targetLanguage: lang
        }),
      });

      const result = await response.json();
      if (response.ok && result.success && result.data) {
        setTranslatedResult(result.data);
      } else {
        console.warn("Translation failed. Reverting to English.", result.error);
        setTranslatedResult(analysisResult);
      }
    } catch (err) {
      console.error("Translation request failed:", err);
      setTranslatedResult(analysisResult);
    } finally {
      setIsTranslating(false);
    }
  };

  // Browser TTS Player
  const handleToggleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    } else {
      const textToSpeak = translatedResult?.summary;
      if (!textToSpeak) return;

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.85; // Slow, reassuring, and comforting voice
      utterance.pitch = 1.0;

      // Select slow pleasant medical narrator voice if available
      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find(
        (voice) => voice.lang.includes("en") && (voice.name.includes("Natural") || voice.name.includes("Google"))
      );
      if (naturalVoice) {
        utterance.voice = naturalVoice;
      }

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Copy to Clipboard helpers
  const handleCopyQuestion = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAllQuestions = () => {
    if (!translatedResult) return;
    const questions = translatedResult.doctorQuestions.join("\n");
    navigator.clipboard.writeText(questions);
    setCopiedQuestions(true);
    setTimeout(() => setCopiedQuestions(false), 2000);
  };

  // Print Report
  const handlePrint = () => {
    window.print();
  };

  // Export report as text file
  const handleExportTxt = () => {
    if (!translatedResult) return;
    const content = `MEDICLARITY AI - MEDICAL REPORT DECONSTRUCTION
Language: ${selectedLanguage}
--------------------------------------------------

EXECUTIVE SUMMARY:
${translatedResult.summary}

URGENCY RATING:
Level: ${translatedResult.risk.level}
Explanation: ${translatedResult.risk.explanation}

--------------------------------------------------
CLINICAL FINDINGS:
${translatedResult.findings.map((f) => `- ${f.finding} [${f.severity}]: ${f.details}`).join("\n\n")}

--------------------------------------------------
OUT OF RANGE VALUES:
${translatedResult.abnormalValues.map((v) => `- ${v.testName}: Value: ${v.value} (Ref: ${v.referenceRange}) | Status: ${v.status}\n  Explanation: ${v.note}`).join("\n\n")}

--------------------------------------------------
COLLECTIVE MEANING:
${translatedResult.possibleMeaning}

--------------------------------------------------
LIFESTYLE & WELLNESS EDUCATION ADVICE:
${translatedResult.lifestyleSuggestions.map((l) => `- [${l.category}] ${l.advice}\n  Clinical Wellness Benefit: ${l.benefit}`).join("\n\n")}

--------------------------------------------------
RECOMMENDED QUESTIONS FOR YOUR HEALTHCARE PROVIDER:
${translatedResult.doctorQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

--------------------------------------------------
DISCLAIMER:
This AI tool provides educational information only and does not replace professional medical advice. Always consult your healthcare provider for diagnosis and treatment. Seek emergency care for severe symptoms.
`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `MediClarity_AI_Report_${new Date().toISOString().slice(0,10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Helper colors for findings/abnormal values
  const getSeverityClasses = (severity: string) => {
    const s = severity.toLowerCase();
    if (s.includes("rose") || s.includes("abnormal") || s.includes("high") || s.includes("critical")) {
      return {
        badge: "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50",
        indicator: "bg-rose-500"
      };
    }
    if (s.includes("amber") || s.includes("attention") || s.includes("medium") || s.includes("warning") || s.includes("low")) {
      return {
        badge: "bg-amber-50/90 text-amber-900 border-amber-300/80 dark:bg-amber-950/25 dark:text-amber-300 dark:border-amber-900/40",
        indicator: "bg-amber-500"
      };
    }
    return {
      badge: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50",
      indicator: "bg-emerald-500"
    };
  };

  // Filter terms in glossary
  const filteredTerms = translatedResult?.medicalTerms.filter(
    (item) =>
      item.term.toLowerCase().includes(glossarySearch.toLowerCase()) ||
      item.simpleExplanation.toLowerCase().includes(glossarySearch.toLowerCase())
  );

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors duration-300 ${theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      
      {/* Header Navigation Bar */}
      <header className="sticky top-0 z-50 h-20 flex items-center justify-between px-6 sm:px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm shrink-0 transition-colors duration-300 no-print">
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <motion.div 
            className="h-11 w-11 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-100 dark:shadow-none cursor-pointer"
            whileHover={{ scale: 1.05, rotate: 3 }}
            whileTap={{ scale: 0.95 }}
          >
            <ShieldCheck className="w-7 h-7 text-white" />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-extrabold font-heading bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 tracking-tight leading-none">
              MediClarity AI
            </span>
            <span className="text-[10px] uppercase tracking-widest text-indigo-500 dark:text-indigo-450 font-bold mt-0.5 flex items-center gap-1.5">
              Universal Interpreter
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                className="inline-flex items-center justify-center text-rose-500 fill-rose-500 dark:text-rose-400 dark:fill-rose-400"
              >
                <Heart className="w-2.5 h-2.5 fill-current" />
              </motion.span>
            </span>
          </div>
        </motion.div>

        {/* Action Tools */}
        <motion.div 
          className="flex items-center gap-3 sm:gap-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          
          {/* Language Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
            <select
              value={selectedLanguage}
              onChange={(e) => handleTranslate(e.target.value)}
              disabled={!analysisResult || isTranslating}
              className="bg-transparent text-sm px-2 py-1 outline-none font-medium text-slate-800 dark:text-slate-200 cursor-pointer disabled:opacity-50"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="dark:bg-slate-900">
                  {lang.name}
                </option>
              ))}
            </select>
          </div>



          {/* Interactive Presentation Pitch Deck Button */}
          <button
            onClick={() => setIsPresentationOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow-indigo-500/20 transition-all flex items-center gap-1.5 focus:outline-none cursor-pointer"
            title="Open interactive 8-slide presentation pitch deck"
          >
            <Tv className="w-4 h-4" />
            <span className="hidden sm:inline">Interactive Slides</span>
            <span className="sm:hidden">Slides</span>
          </button>

          {/* Reset Button */}
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white text-sm font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 focus:outline-none cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden md:inline">Reset Analysis</span>
          </button>
        </motion.div>
      </header>

      {/* Hero Header Section */}
      <section className="bg-slate-900/45 dark:bg-slate-950/40 border-b border-slate-200/50 dark:border-slate-800/60 py-10 sm:py-14 text-center no-print transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 flex flex-col items-center">
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-6 tracking-wide shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            <span>Empowering Patients with Scientific Clarity</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight leading-tight max-w-4xl"
          >
            Demystify Your Medical Lab <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 dark:from-indigo-400 dark:via-violet-400 dark:to-purple-400">Biomarkers</span>{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400">Instantly</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-2xl mt-5 leading-relaxed font-medium"
          >
            Translate confusing blood tests, lipid panels, metabolic sheets, and pathology results into clear, compassionate, and highly actionable educational breakdowns.
          </motion.p>

          {/* Divider */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="w-full max-w-2xl h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent my-8"
          />

          {/* Stat Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-4xl"
          >
            {/* Card 1 */}
            <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 rounded-2xl p-5 flex flex-col items-center text-center transition-all duration-300 hover:border-indigo-400/60 dark:hover:border-indigo-500/40 shadow-sm hover:shadow-md">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3.5 border border-indigo-100 dark:border-indigo-500/20">
                <FileText className="w-5.5 h-5.5" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">10,000+</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mt-1 mb-1.5">REPORTS ANALYZED</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Precise translation and classification of diverse laboratory parameters.
              </div>
            </div>

            {/* Card 2 */}
            <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 rounded-2xl p-5 flex flex-col items-center text-center transition-all duration-300 hover:border-purple-400/60 dark:hover:border-purple-500/40 shadow-sm hover:shadow-md">
              <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3.5 border border-purple-100 dark:border-purple-500/20">
                <Smile className="w-5.5 h-5.5" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">95%</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 mt-1 mb-1.5">USER SATISFACTION</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Empowered patients feeling reassured and confident during consultations.
              </div>
            </div>

            {/* Card 3 */}
            <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 rounded-2xl p-5 flex flex-col items-center text-center transition-all duration-300 hover:border-emerald-400/60 dark:hover:border-emerald-500/40 shadow-sm hover:shadow-md">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3.5 border border-emerald-100 dark:border-emerald-500/20">
                <Users className="w-5.5 h-5.5" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">5,000+</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mt-1 mb-1.5">ACTIVE USERS</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Global patients trusting our secure, clinical deconstruction engine.
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Why Choose MediDecode AI? Section */}
      <section className="bg-slate-950 border-b border-slate-900 py-12 sm:py-16 no-print transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Key Features */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <motion.h2 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-heading"
              >
                Why Choose MediClarity AI?
              </motion.h2>
              
              <div className="space-y-4">
                {/* Feature 1 */}
                <motion.div 
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="flex items-center gap-3.5"
                >
                  <Shield className="w-5.5 h-5.5 text-blue-500 shrink-0" />
                  <span className="text-slate-300 text-sm sm:text-base font-medium">
                    Your medical data is encrypted and secure
                  </span>
                </motion.div>

                {/* Feature 2 */}
                <motion.div 
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="flex items-center gap-3.5"
                >
                  <Zap className="w-5.5 h-5.5 text-blue-500 shrink-0" />
                  <span className="text-slate-300 text-sm sm:text-base font-medium">
                    Instant analysis with AI-powered technology
                  </span>
                </motion.div>

                {/* Feature 3 */}
                <motion.div 
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="flex items-center gap-3.5"
                >
                  <CheckCircle2 className="w-5.5 h-5.5 text-blue-500 shrink-0" />
                  <span className="text-slate-300 text-sm sm:text-base font-medium">
                    Easy-to-understand explanations
                  </span>
                </motion.div>

                {/* Feature 4 */}
                <motion.div 
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="flex items-center gap-3.5"
                >
                  <Brain className="w-5.5 h-5.5 text-blue-500 shrink-0" />
                  <span className="text-slate-300 text-sm sm:text-base font-medium">
                    Advanced NLP and OCR capabilities
                  </span>
                </motion.div>
              </div>
            </div>
            
            {/* Right Column: Skeleton Bars Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="lg:col-span-5 flex justify-center lg:justify-end"
            >
              <div className="w-full max-w-sm border border-indigo-950 bg-[#070c14] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col gap-4 border-blue-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
                
                <div className="w-3/4 h-3 bg-indigo-950/65 rounded-full relative overflow-hidden">
                  <motion.div 
                    className="absolute inset-0 bg-indigo-500/10"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  />
                </div>
                <div className="w-full h-3 bg-indigo-900/30 rounded-full relative overflow-hidden">
                  <motion.div 
                    className="absolute inset-0 bg-indigo-400/10"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: 0.2 }}
                  />
                </div>
                <div className="w-5/6 h-3 bg-indigo-950/65 rounded-full relative overflow-hidden">
                  <motion.div 
                    className="absolute inset-0 bg-indigo-500/15"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut", delay: 0.5 }}
                  />
                </div>
                <div className="w-1/2 h-3 bg-indigo-900/20 rounded-full relative overflow-hidden">
                  <motion.div 
                    className="absolute inset-0 bg-indigo-400/10"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut", delay: 0.1 }}
                  />
                </div>
                <div className="w-2/3 h-3 bg-indigo-950/40 rounded-full relative overflow-hidden">
                  <motion.div 
                    className="absolute inset-0 bg-indigo-500/10"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut", delay: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Main Split Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* LEFT COLUMN: Patient Input Workspace (40%) */}
          <motion.div 
            className="lg:col-span-5 space-y-4 no-print"
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {errorMessage && (
              <motion.div 
                className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 p-4 rounded-xl text-rose-800 dark:text-rose-300 text-xs flex items-start gap-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-rose-900 dark:text-rose-200">Unable to analyze report</p>
                  <p className="mt-1 leading-relaxed text-rose-700 dark:text-rose-300">{errorMessage}</p>
                </div>
                <button 
                  onClick={() => setErrorMessage(null)}
                  className="text-rose-450 hover:text-rose-600 dark:hover:text-rose-200 cursor-pointer p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm flex flex-col gap-3.5">
              
              {/* 1. File Upload Zone */}
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-2 block tracking-wider">
                  1. File Upload System
                </label>
                <motion.div
                  ref={dropRef}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col items-center justify-center bg-white dark:bg-slate-900/50 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all cursor-pointer relative"
                >
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf,.txt,.png,.jpg,.jpeg"
                  />
                  <div className="space-y-2 pointer-events-none text-center flex flex-col items-center">
                    <motion.div 
                      className="w-10 h-10 bg-indigo-50 dark:bg-slate-850 rounded-xl flex items-center justify-center text-indigo-500"
                      whileHover={{ rotate: 10, scale: 1.1 }}
                    >
                      <UploadCloud className="w-6 h-6" />
                    </motion.div>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Drag & drop PDF/Images
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                      or click to browse local files
                    </p>
                  </div>
                </motion.div>

                {file && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 text-xs flex items-center justify-between border border-emerald-100 dark:border-emerald-950"
                  >
                    <span className="truncate font-medium">{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                    <button
                      onClick={() => {
                        setFile(null);
                        setFileBase64(null);
                        setFileType("");
                      }}
                      className="text-emerald-500 hover:text-emerald-700 focus:outline-none"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </div>

              {/* 2. Text Area Inputs */}
              <div className="flex-1">
                <label className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-2 block tracking-wider">
                  2. Raw Report Input
                </label>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  rows={8}
                  className="w-full h-20 p-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono resize-none focus:ring-2 focus:ring-indigo-500 outline-none dark:text-slate-200 transition-all"
                  placeholder="Paste clinical notes or raw OCR text here..."
                />
              </div>

              {/* 4. Action Button */}
              <motion.button
                onClick={handleDecode}
                disabled={isLoading}
                whileHover={{ scale: 1.02, translateY: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 animate-pulse" />
                <span>Decode Report in Plain English</span>
              </motion.button>

            </div>
          </motion.div>

          {/* RIGHT COLUMN: Diagnostic Analysis Workspace (60%) */}
          <motion.div 
            id="results-section"
            className="lg:col-span-7 space-y-4"
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            
            {isLoadedFromShare && (
              <motion.div 
                className="bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/20 p-4 rounded-2xl flex items-start gap-3 shadow-sm mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Link className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-indigo-900 dark:text-indigo-200">Viewing Shared Analysis</p>
                  <p className="text-[11px] text-indigo-700 dark:text-indigo-400 mt-0.5 leading-relaxed">
                    This is a read-only report loaded via secure permalink. You can use the inputs on the left to analyze a new document.
                  </p>
                </div>
                <button 
                  onClick={() => setIsLoadedFromShare(false)}
                  className="text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-200 cursor-pointer p-0.5 hover:bg-indigo-100/50 dark:hover:bg-indigo-950/30 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
            
            {/* Loading Phase Animation */}
            {isLoading && (
              <motion.div 
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-6 max-w-sm mx-auto">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 border-4 border-indigo-100 dark:border-indigo-950 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin"></div>
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base">
                      {loadingPhase}
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Translating metrics safely using clinical deconstruction structures.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Idle Placeholder */}
            {!isLoading && !translatedResult && (
              <motion.div 
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm no-print"
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <div className="max-w-sm mx-auto space-y-4">
                  <motion.div 
                    className="w-16 h-16 bg-slate-50 dark:bg-slate-850 rounded-2xl flex items-center justify-center mx-auto text-slate-400"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  >
                    <Activity className="w-8 h-8 text-indigo-500" />
                  </motion.div>
                  <div>
                    <h3 className="font-heading font-bold text-slate-800 dark:text-slate-100 text-lg">
                      No Analysis Loaded Yet
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
                      Upload document scans or copy/paste clinical indicators on the left to unlock deep patient-friendly clarity.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* AI Deconstructed Output Dashboard */}
            {isTranslating && (
              <motion.div 
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex items-center justify-center space-x-2 text-indigo-500">
                  <div className="w-4 h-4 border-2 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
                  <span className="text-xs font-semibold uppercase">Translating medical data securely...</span>
                </div>
              </motion.div>
            )}

            {!isLoading && !isTranslating && translatedResult && (
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                
                {/* 1. Executive Summary */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex-shrink-0 print-card">
                  <div className="flex justify-between items-start mb-2 border-b border-slate-100 dark:border-slate-850 pb-2">
                    <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">Executive Summary</h3>
                    <div className="flex gap-2 no-print">
                      <button
                        onClick={handleShareReport}
                        className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                          copiedShareLink
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400"
                            : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                        }`}
                        title="Share Report"
                      >
                        {copiedShareLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                        <span className="text-xs">{copiedShareLink ? "Copied!" : "Share"}</span>
                      </button>
                      <button
                        onClick={handleToggleSpeak}
                        className={`p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                          isSpeaking
                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400"
                            : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-405 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                        }`}
                        title="Speak Report"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span className="text-xs">{isSpeaking ? "Mute" : "Speak"}</span>
                      </button>
                      <button
                        onClick={handleExportTxt}
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                        title="Export TXT"
                      >
                        <FileText className="w-4 h-4" />
                        <span className="text-xs">Export</span>
                      </button>
                      <button
                        onClick={handlePrint}
                        className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                        title="Print"
                      >
                        <Printer className="w-4 h-4" />
                        <span className="text-xs">Print</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {translatedResult.summary}
                  </p>
                </div>

                {/* 2. Urgency Meter */}
                {(() => {
                  const level = translatedResult.risk.level.toUpperCase();
                  let containerClass = "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50 text-slate-900 dark:text-slate-100";
                  let badgeClass = "bg-emerald-500";
                  
                  if (level === "HIGH" || level === "CRITICAL") {
                    containerClass = "bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/50 text-slate-900 dark:text-slate-100";
                    badgeClass = "bg-rose-500";
                  } else if (level === "MEDIUM" || level === "ATTENTION" || level === "WARNING") {
                    containerClass = "bg-amber-50 border-amber-200 dark:bg-amber-950/25 dark:border-amber-900/40 text-slate-900 dark:text-slate-100";
                    badgeClass = "bg-amber-600 dark:bg-amber-500";
                  }

                  return (
                    <div className={`flex items-center gap-4 border p-2.5 rounded-xl flex-shrink-0 print-card ${containerClass}`}>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-white text-[10px] font-bold shrink-0 ${badgeClass}`}>
                        <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
                        {level} URGENCY
                      </div>
                      <p className="text-xs leading-tight">
                        {translatedResult.risk.explanation}
                      </p>
                    </div>
                  );
                })()}

                {/* 3. Tabbed Diagnostic Workspace */}
                <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm print-card">
                  <nav className="flex overflow-x-auto gap-1 border-b border-slate-200 dark:border-slate-800 shrink-0 no-print">
                    {[
                      { id: "findings", label: "Findings" },
                      { id: "out-of-range", label: "Out of Range" },
                      { id: "glossary", label: "Glossary" },
                      { id: "meaning", label: "Collective Meaning" },
                      { id: "lifestyle", label: "Lifestyle" },
                      { id: "doctor-qa", label: "Doctor Q&A" }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer border-b-2 whitespace-nowrap ${
                          activeTab === tab.id
                            ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                            : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </nav>

                  <div className="flex-1 overflow-y-auto py-4 pr-1">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                      >
                    
                    {/* Findings Tab */}
                    {activeTab === "findings" && (
                      <motion.div 
                        className="space-y-3"
                        variants={{
                          hidden: { opacity: 0 },
                          show: {
                            opacity: 1,
                            transition: {
                              staggerChildren: 0.08
                            }
                          }
                        }}
                        initial="hidden"
                        animate="show"
                      >
                        {translatedResult.findings.map((f, i) => {
                          const severity = f.severity.toUpperCase();
                          let borderClass = "border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/10";
                          let textClass = "text-emerald-600 dark:text-emerald-400";
                          let dotClass = "bg-emerald-500";
                          
                          if (severity.includes("ROSE") || severity.includes("ABNORMAL") || severity.includes("HIGH") || severity.includes("CRITICAL")) {
                            borderClass = "border-rose-100 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/10";
                            textClass = "text-rose-600 dark:text-rose-400";
                            dotClass = "bg-rose-500";
                          } else if (severity.includes("AMBER") || severity.includes("ATTENTION") || severity.includes("MEDIUM") || severity.includes("WARNING") || severity.includes("LOW")) {
                            borderClass = "border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/25";
                            textClass = "text-amber-950 dark:text-amber-300";
                            dotClass = "bg-amber-500";
                          }

                          const isOpen = expandedAccordion === i;

                          return (
                            <motion.div 
                              key={i} 
                              variants={{
                                hidden: { opacity: 0, y: 15 },
                                show: { opacity: 1, y: 0 }
                              }}
                              transition={{ type: "spring", stiffness: 350, damping: 25 }}
                              className={`border rounded-xl overflow-hidden transition-all duration-250 ${borderClass}`}
                            >
                              <button
                                onClick={() => setExpandedAccordion(isOpen ? null : i)}
                                className="w-full text-left p-3 flex items-center justify-between font-bold text-xs uppercase cursor-pointer"
                              >
                                <span className={textClass}>{f.severity} • {f.finding}</span>
                                <span className={`h-2 w-2 rounded-full shrink-0 ${dotClass}`}></span>
                              </button>
                              <AnimatePresence initial={false}>
                                {isOpen && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                                    className="overflow-hidden"
                                  >
                                    <div className="p-3 pt-0 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100/30 dark:border-slate-800/30 bg-white/20 dark:bg-black/10">
                                      {f.details}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    )}

                    {/* Out Of Range Tab */}
                    {activeTab === "out-of-range" && (
                      <div className="space-y-3">
                        <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
                          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800 text-left">
                            <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                              <tr>
                                <th className="px-3 py-2">Test Name</th>
                                <th className="px-3 py-2">Your Value</th>
                                <th className="px-3 py-2">Reference Interval</th>
                                <th className="px-3 py-2">Meaning</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-600 dark:text-slate-300">
                              {translatedResult.abnormalValues.map((v, i) => {
                                const status = v.status.toUpperCase();
                                let badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50";
                                if (status.includes("HIGH") || status.includes("CRITICAL") || status.includes("ABNORMAL") || status.includes("ROSE")) {
                                  badgeClass = "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/50";
                                } else if (status.includes("MEDIUM") || status.includes("WARNING") || status.includes("AMBER") || status.includes("ATTENTION") || status.includes("LOW")) {
                                  badgeClass = "bg-amber-50 text-amber-950 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/40";
                                }
                                return (
                                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                                    <td className="px-3 py-2 font-bold text-slate-800 dark:text-slate-200">
                                      {v.testName}
                                    </td>
                                    <td className="px-3 py-2">
                                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase border ${badgeClass}`}>
                                        {v.value}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2 font-mono text-slate-400 dark:text-slate-500">
                                      {v.referenceRange}
                                    </td>
                                    <td className="px-3 py-2 leading-relaxed text-xs text-slate-600 dark:text-slate-350">
                                      {v.note}
                                    </td>
                                  </tr>
                                );
                              })}
                              {translatedResult.abnormalValues.length === 0 && (
                                <tr>
                                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                                    All indicators appear to be within normal limits.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Glossary Tab */}
                    {activeTab === "glossary" && (
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <h4 className="font-heading font-semibold text-slate-900 dark:text-white text-base">
                            Detected Dictionary Glossary
                          </h4>
                          <div className="relative max-w-xs w-full">
                            <input
                              type="text"
                              value={glossarySearch}
                              onChange={(e) => setGlossarySearch(e.target.value)}
                              placeholder="Search medical terms..."
                              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg text-xs py-1.5 pl-8 pr-3 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400 dark:text-slate-505" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {filteredTerms?.map((item, i) => (
                            <div key={i} className="p-3 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
                              <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                                <span>{item.term}</span>
                              </h5>
                              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                                {item.simpleExplanation}
                              </p>
                            </div>
                          ))}
                          {filteredTerms?.length === 0 && (
                            <p className="text-xs text-slate-400 text-center col-span-2 py-6">
                              No matching terminology dictionary terms found.
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Collective Meaning Tab */}
                    {activeTab === "meaning" && (
                      <div className="space-y-3 bg-indigo-50/20 dark:bg-indigo-950/10 border-l-4 border-indigo-500 p-3 rounded-r-xl">
                        <h4 className="font-heading font-bold text-slate-900 dark:text-white text-base">
                          Collective Meaning
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                          {translatedResult.possibleMeaning}
                        </p>
                      </div>
                    )}

                    {/* Lifestyle Tab */}
                    {activeTab === "lifestyle" && (
                      <div className="space-y-4">
                        <h4 className="font-heading font-semibold text-slate-900 dark:text-white text-base">
                          Lifestyle Advice Suggestions
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {translatedResult.lifestyleSuggestions.map((item, i) => {
                            let icon = <Activity className="w-4.5 h-4.5" />;
                            let color = "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20";
                            
                            const cat = item.category.toLowerCase();
                            if (cat.includes("hydration")) {
                              icon = <Droplet className="w-4.5 h-4.5" />;
                              color = "text-blue-500 bg-blue-50 dark:bg-blue-950/20";
                            } else if (cat.includes("nutrition")) {
                              icon = <Soup className="w-4.5 h-4.5" />;
                              color = "text-amber-900 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/30";
                            } else if (cat.includes("sleep")) {
                              icon = <Moon className="w-4.5 h-4.5" />;
                              color = "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20";
                            } else if (cat.includes("exercise")) {
                              icon = <Dumbbell className="w-4.5 h-4.5" />;
                              color = "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20";
                            } else if (cat.includes("stress")) {
                              icon = <Brain className="w-4.5 h-4.5" />;
                              color = "text-purple-500 bg-purple-50 dark:bg-purple-950/20";
                            }

                            return (
                              <div key={i} className="p-3 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2.5">
                                <div className="flex items-center space-x-2">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                                    {icon}
                                  </div>
                                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                    {item.category}
                                  </span>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                    {item.advice}
                                  </p>
                                  <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
                                    <strong className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                                      Clinical Benefit:
                                    </strong>{" "}
                                    {item.benefit}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Doctor Q&A Tab */}
                    {activeTab === "doctor-qa" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="w-5 h-5 text-indigo-500" />
                            <h4 className="font-heading font-semibold text-slate-900 dark:text-white text-base">
                              Doctor Discussion Questions
                            </h4>
                          </div>
                          <button
                            onClick={handleCopyAllQuestions}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                            title="Copy all questions"
                          >
                            {copiedQuestions ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>

                        <ul className="space-y-3">
                          {translatedResult.doctorQuestions.map((q, idx) => (
                            <li
                              key={idx}
                              className="flex items-start justify-between space-x-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-xl border border-slate-200 dark:border-slate-800 animate-fade-in"
                            >
                              <div className="flex items-start space-x-2 pr-2">
                                <span className="text-indigo-500 font-bold shrink-0">?</span>
                                <span>{q}</span>
                              </div>
                              <button
                                onClick={() => handleCopyQuestion(q, idx)}
                                className="text-slate-400 hover:text-indigo-500 shrink-0 self-center focus:outline-none"
                              >
                                {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

              </motion.div>
            )}

          </motion.div>

        </div>

      </main>

      {/* Brand & Safety Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-10 px-6 sm:px-8 shrink-0 no-print mt-16 transition-colors duration-300">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Safety Disclaimer */}
          <div className="border-2 border-dashed border-rose-200 dark:border-rose-900/40 rounded-xl bg-rose-50/50 dark:bg-rose-950/10 px-4 py-3.5 flex items-start sm:items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-[11px] sm:text-xs text-rose-900 dark:text-rose-300 font-medium leading-relaxed">
              <strong>SAFETY DISCLAIMER:</strong> This AI tool provides educational information only and does not replace professional medical advice. Always consult your healthcare provider for diagnosis and treatment. Seek emergency care for severe symptoms.
            </p>
          </div>

          <hr className="border-slate-150 dark:border-slate-800" />

          {/* Branding & Developer Credits */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                MediClarity AI Workspace
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                We translate complex blood tests, urine panels, lipid profiles, and metabolic assays so that you can feel informed and confident during doctor consults.
              </p>
              <p className="text-[11px] text-slate-450 dark:text-slate-500 font-medium">
                © 2026 MediClarity AI. All health resources are for personal educational use only.
              </p>
            </div>

            <div className="md:text-right shrink-0">
              <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Developed by Miss. Maryam Fayha
              </span>
            </div>
          </div>

        </div>
      </footer>

      <PresentationDeck 
        isOpen={isPresentationOpen} 
        onClose={() => setIsPresentationOpen(false)} 
        theme={theme} 
      />

    </div>
  );
}
