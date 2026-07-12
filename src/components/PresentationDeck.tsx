import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Tv, 
  Play, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Brain, 
  Layers, 
  Cpu, 
  Server, 
  Smartphone, 
  FileText, 
  Lock, 
  Eye, 
  ArrowRight, 
  Activity, 
  Volume2, 
  VolumeX, 
  LineChart, 
  HelpCircle,
  Stethoscope,
  Database,
  RefreshCw,
  Info,
  Share2
} from "lucide-react";

interface PresentationDeckProps {
  isOpen: boolean;
  onClose: () => void;
  theme: "light" | "dark";
}

export default function PresentationDeck({ isOpen, onClose, theme }: PresentationDeckProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slidesCount = 8;

  // Handle keyboard events for sliding
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        prevSlide();
      } else if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentSlide]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slidesCount);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slidesCount) % slidesCount);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 text-white overflow-hidden select-none">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 sm:pb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Tv className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-sm font-extrabold tracking-tight text-white font-heading">
                MediClarity AI
              </span>
              <span className="text-[10px] text-slate-400 font-medium ml-2 uppercase tracking-wider hidden sm:inline-block">
                Interactive Pitch Deck
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-xs bg-indigo-950/60 text-indigo-400 font-mono px-3 py-1 rounded-full border border-indigo-900/40 font-bold">
              SLIDE {currentSlide + 1} / {slidesCount}
            </span>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Exit Presentation (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Core Slide Container */}
        <div className="flex-1 flex items-center justify-center py-4 sm:py-8 max-w-6xl mx-auto w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 40, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -40, scale: 0.98 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="w-full h-full flex flex-col justify-center"
            >
              {currentSlide === 0 && (
                <div className="text-center space-y-6 sm:space-y-8 py-6">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/40 text-indigo-300 text-xs font-semibold uppercase tracking-wider"
                  >
                    <Tv className="w-3.5 h-3.5" /> Product Showcase &amp; Tech Stack
                  </motion.div>

                  <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-heading leading-tight max-w-4xl mx-auto bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400">
                    MediClarity AI: Demystifying Clinical Science &amp; Empowering Patients
                  </h1>

                  <p className="text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
                    A comprehensive, deep-dive presentation of the product vision, full-stack architecture, interactive data visualizations, and system workflows.
                  </p>

                  {/* Agenda Section Grid */}
                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 sm:p-6 max-w-3xl mx-auto text-left space-y-3">
                    <h3 className="text-indigo-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                      <Layers className="w-4 h-4" /> Agenda &amp; Presentation Map
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-slate-300 text-xs sm:text-sm">
                      <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"/> Slide 1: Welcome &amp; Agenda Map</div>
                      <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"/> Slide 5: Dynamic App Workflows</div>
                      <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"/> Slide 2: The Core Challenge (The Body)</div>
                      <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"/> Slide 6: Intelligent Data Visuals</div>
                      <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"/> Slide 3: MediClarity Feature Matrix</div>
                      <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"/> Slide 7: Security &amp; Compliance</div>
                      <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"/> Slide 4: Full-Stack Architecture</div>
                      <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"/> Slide 8: Future Vision &amp; Clinical Impact</div>
                    </div>
                  </div>
                </div>
              )}

              {currentSlide === 1 && (
                <div className="space-y-6">
                  <div className="text-center lg:text-left">
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-950/50 px-3 py-1 rounded-full border border-indigo-900/40">Slide 2: The Body &amp; Core Challenge</span>
                    <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-white mt-3">The Core Challenge: The Medical Jargon Gap</h2>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    <div className="lg:col-span-7 space-y-4 text-slate-350 text-sm sm:text-base leading-relaxed">
                      <p>
                        Patient reports and laboratory blood tests are written <strong className="text-white">by clinicians, for clinicians</strong>. They are intentionally packed with dense shorthand, complex biological terms, and dry clinical intervals.
                      </p>
                      <p>
                        This generates a highly distressing <strong className="text-white">comprehension barrier</strong> for patients:
                      </p>
                      <ul className="space-y-2.5">
                        <li className="flex items-start gap-2.5 text-xs sm:text-sm">
                          <span className="text-rose-500 mt-1">●</span>
                          <span><strong className="text-rose-400">Anxiety-Inducing Gaps:</strong> Patients seeing terms like "eGFR stage 3 decline" or "microscopic hematuria" face critical stress levels and panic.</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-xs sm:text-sm">
                          <span className="text-rose-500 mt-1">●</span>
                          <span><strong className="text-rose-400">The "Dr. Google" Trap:</strong> Searching unverified medical databases often returns worst-case oncology results, leading to further unnecessary distress.</span>
                        </li>
                        <li className="flex items-start gap-2.5 text-xs sm:text-sm">
                          <span className="text-indigo-400 mt-1">●</span>
                          <span><strong className="text-emerald-400">MediClarity's Mission:</strong> To bridge this gap completely. By serving as an empathetic, intelligent translator, the platform deconstructs clinical facts into human understanding.</span>
                        </li>
                      </ul>
                    </div>

                    <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-indigo-500" /> Comparison Paradigm
                      </h4>
                      <div className="space-y-3">
                        <div className="border border-slate-800/80 bg-slate-950 p-3 rounded-xl">
                          <span className="text-[10px] font-extrabold text-rose-400 uppercase tracking-widest">Standard Lab Report Output</span>
                          <p className="font-mono text-[11px] text-rose-200/80 mt-1 leading-normal">
                            Hyperglycemia noted. Hemoglobin A1c: 6.9%. eGFR: 54 mL/min. stage 3 renal compromise. Monitor metabolic intervals.
                          </p>
                        </div>
                        <div className="flex justify-center text-slate-600">
                          <ArrowRight className="w-5 h-5 rotate-90 lg:rotate-0" />
                        </div>
                        <div className="border border-indigo-900/30 bg-indigo-950/20 p-3 rounded-xl">
                          <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">MediClarity AI Empathy Decoded</span>
                          <p className="text-xs text-indigo-200 mt-1 leading-relaxed">
                            "Your blood sugar indicators show a high average level (HbA1c of 6.9%). Additionally, your kidney filtration rate is moderately slow. We recommend hydration and a friendly chat with your physician."
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentSlide === 2 && (
                <div className="space-y-6">
                  <div className="text-center lg:text-left">
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-950/50 px-3 py-1 rounded-full border border-indigo-900/40">Slide 3: MediClarity Feature Matrix</span>
                    <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-white mt-3">Core App Capabilities</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Feature Card 1 */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition-colors">
                      <div className="h-10 w-10 bg-indigo-950 text-indigo-400 rounded-xl flex items-center justify-center">
                        <Brain className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-white">Smart Parsing</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Extracts blood counts, metabolic markers, thyroid parameters, lipid panels, and complex clinical jargon.
                      </p>
                    </div>

                    {/* Feature Card 2 */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition-colors">
                      <div className="h-10 w-10 bg-indigo-950 text-indigo-400 rounded-xl flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-white">Multimodal OCR</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Drag-and-drop document uploads, high-resolution scanned lab image reading, and PDF parsing with AI.
                      </p>
                    </div>

                    {/* Feature Card 3 */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition-colors">
                      <div className="h-10 w-10 bg-indigo-950 text-indigo-400 rounded-xl flex items-center justify-center">
                        <Zap className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-white">Multi-Language</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Instantly translates scientific findings into 5 target languages (Spanish, French, German, Japanese, and Mandarin).
                      </p>
                    </div>

                    {/* Feature Card 4 */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition-colors">
                      <div className="h-10 w-10 bg-indigo-950 text-indigo-400 rounded-xl flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-white">Actionable Wellness</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Translates medical values into supportive, risk-free educational feedback categories like sleep, diet, and hydration.
                      </p>
                    </div>
                  </div>

                  <div className="bg-indigo-950/25 border border-indigo-900/40 rounded-xl p-4 flex items-start gap-3">
                    <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-indigo-200 leading-relaxed">
                      <strong>Empowerment Engine:</strong> At the heart of MediClarity AI is an interactive Question Planner that drafts 3-5 specific questions (e.g. "Given my serum creatinine is 1.45 mg/dL, what are the recommended steps?") to maximize physician time during consults.
                    </p>
                  </div>
                </div>
              )}

              {currentSlide === 3 && (
                <div className="space-y-6">
                  <div className="text-center lg:text-left">
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-950/50 px-3 py-1 rounded-full border border-indigo-900/40">Slide 4: App Architecture</span>
                    <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-white mt-3">Full-Stack Application Architecture</h2>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    <div className="lg:col-span-5 space-y-4">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-500" /> Architectural Overview
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-350 leading-relaxed">
                        Our full-stack setup is built around a secure architecture to protect patient privacy and safeguard secret API keys from client-side exposure.
                      </p>
                      <div className="space-y-3 text-xs text-slate-400">
                        <div className="flex items-start gap-2">
                          <Smartphone className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <span><strong className="text-slate-200">Interactive Frontend:</strong> React 19 + Tailwind CSS styled with fluid typography and smooth spring animations.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Server className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <span><strong className="text-slate-200">Secure Backend Proxy:</strong> FastAPI (Python) or Express (Node.js) proxy server handling model handshakes and rate-limiting.</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Cpu className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <span><strong className="text-slate-200">LLM Processing Layer:</strong> Powered by official Google GenAI SDK interfacing with highly optimized clinical parameters on Gemini models.</span>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
                      <div className="absolute top-2 right-3 text-[10px] font-mono text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded-full">Secure Stack</div>
                      
                      {/* Interactive visual layout of the architecture */}
                      <div className="flex flex-col gap-4 text-center">
                        <div className="bg-indigo-950/50 border border-indigo-800/60 p-3 rounded-xl flex items-center justify-between px-5">
                          <div className="flex items-center gap-2 text-left">
                            <Smartphone className="w-5 h-5 text-indigo-400" />
                            <div>
                              <h4 className="text-xs font-bold text-white">Client SPA View</h4>
                              <p className="text-[10px] text-slate-400">React 19 / Tailwind / Motion</p>
                            </div>
                          </div>
                          <span className="text-[10px] text-indigo-400 bg-indigo-900/30 px-2 py-0.5 rounded">User Device</span>
                        </div>

                        <div className="flex justify-center">
                          <div className="h-6 w-0.5 bg-indigo-900 border-dashed border" />
                        </div>

                        <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between px-5">
                          <div className="flex items-center gap-2 text-left">
                            <Server className="w-5 h-5 text-emerald-400" />
                            <div>
                              <h4 className="text-xs font-bold text-white">FastAPI / Express Server</h4>
                              <p className="text-[10px] text-slate-400">API Gateway Proxy • No client-side API keys</p>
                            </div>
                          </div>
                          <span className="text-[10px] text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded">Container Port 3000</span>
                        </div>

                        <div className="flex justify-center">
                          <div className="h-6 w-0.5 bg-indigo-900 border-dashed border" />
                        </div>

                        <div className="bg-indigo-900/30 border border-indigo-800/40 p-3 rounded-xl flex items-center justify-between px-5">
                          <div className="flex items-center gap-2 text-left">
                            <Cpu className="w-5 h-5 text-indigo-300" />
                            <div>
                              <h4 className="text-xs font-bold text-white">Google Gemini API Gateway</h4>
                              <p className="text-[10px] text-indigo-300">gemini-2.5-flash / gemini-2.5-pro</p>
                            </div>
                          </div>
                          <span className="text-[10px] text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded">Structured Pydantic SDK</span>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {currentSlide === 4 && (
                <div className="space-y-6">
                  <div className="text-center lg:text-left">
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-950/50 px-3 py-1 rounded-full border border-indigo-900/40">Slide 5: Comprehensive Workflows</span>
                    <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-white mt-3">Interactive Application Workflows</h2>
                  </div>

                  {/* Horizontal visual steps */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Step 1 */}
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative">
                      <div className="absolute top-2 right-3 text-lg font-extrabold text-indigo-600/50 font-mono">01</div>
                      <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Step 1</span>
                      <h4 className="text-sm font-bold text-white mt-1">Upload &amp; Extraction</h4>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        Patient uploads PDF reports, clear document scans, or inputs indicators directly into raw clinical note areas.
                      </p>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative">
                      <div className="absolute top-2 right-3 text-lg font-extrabold text-indigo-600/50 font-mono">02</div>
                      <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Step 2</span>
                      <h4 className="text-sm font-bold text-white mt-1">Base64 Handshake</h4>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        Assets are converted on the fly into raw Base64 strings. Client forwards payloads to backend endpoints securely.
                      </p>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative">
                      <div className="absolute top-2 right-3 text-lg font-extrabold text-indigo-600/50 font-mono">03</div>
                      <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Step 3</span>
                      <h4 className="text-sm font-bold text-white mt-1">AI Schema Parse</h4>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        Gemini processes materials using specialized clinical system rules and structural JSON templates.
                      </p>
                    </div>

                    {/* Step 4 */}
                    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative">
                      <div className="absolute top-2 right-3 text-lg font-extrabold text-indigo-600/50 font-mono">04</div>
                      <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Step 4</span>
                      <h4 className="text-sm font-bold text-white mt-1">Client Hydration</h4>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        Results display with color-coded severity charts, interactive tabs, dynamic translations, and printable PDFs.
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex justify-between items-center text-xs text-slate-400">
                    <span className="flex items-center gap-1.5"><Database className="w-4 h-4 text-indigo-500" /> Stateless Architecture</span>
                    <span className="flex items-center gap-1.5"><RefreshCw className="w-4 h-4 text-emerald-500 animate-spin-slow" /> Instant Rendering</span>
                    <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-blue-500" /> Secure Transit encryption</span>
                  </div>
                </div>
              )}

              {currentSlide === 5 && (
                <div className="space-y-6">
                  <div className="text-center lg:text-left">
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-950/50 px-3 py-1 rounded-full border border-indigo-900/40">Slide 6: Intelligent Data Visuals</span>
                    <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-white mt-3">Advanced Scientific Data Visualizations</h2>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    <div className="lg:col-span-6 space-y-4 text-slate-350 text-xs sm:text-sm leading-relaxed">
                      <p>
                        MediClarity AI completely avoids text-only outputs. It transforms quantitative scientific values into a beautiful visual dashboard designed to be instantly readable:
                      </p>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span><strong className="text-white">Color-Coded Severity Signals:</strong> Findings sorted immediately into <strong>Normal</strong> (Emerald), <strong>Attention</strong> (Amber), and <strong>Abnormal</strong> (Rose) statuses.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span><strong className="text-white">Interactive Benchmark Slider:</strong> Custom-built clinical sliders mapping the patient's biological metrics plotted dynamically against average reference baselines.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span><strong className="text-white">Urgency Indicator:</strong> An educational visual warning thermometer estimating overall level urgency (Low, Medium, High).</span>
                        </li>
                      </ul>
                    </div>

                    <div className="lg:col-span-6 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <LineChart className="w-4 h-4 text-indigo-500" /> Interactive UI Visualizer
                      </h4>

                      {/* Mockup visual slider representing a lab value */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-white">Creatinine (Serum Filter)</span>
                            <span className="text-rose-400 font-bold">1.45 mg/dL (High)</span>
                          </div>
                          
                          {/* Beautiful slider line */}
                          <div className="h-2.5 w-full bg-slate-950 rounded-full relative">
                            {/* Normal baseline visual area */}
                            <div className="absolute left-[20%] right-[45%] top-0 bottom-0 bg-emerald-500/20 rounded" />
                            {/* Target value dot */}
                            <motion.div 
                              className="absolute h-5 w-5 bg-rose-500 rounded-full border-2 border-white -top-1 shadow"
                              style={{ left: "80%" }}
                              animate={{ scale: [1, 1.15, 1] }}
                              transition={{ repeat: Infinity, duration: 2 }}
                            />
                          </div>

                          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                            <span>Min: 0.10</span>
                            <span className="text-emerald-400 font-bold">Ref: 0.60 - 1.20</span>
                            <span>Max: 3.00</span>
                          </div>
                        </div>

                        <div className="border border-indigo-950 bg-indigo-950/20 rounded-xl p-3 flex items-center justify-between text-xs text-indigo-300">
                          <span>Patient Risk Rating:</span>
                          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold px-3 py-0.5 rounded-full uppercase tracking-wider text-[10px]">
                            Medium Urgency
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentSlide === 6 && (
                <div className="space-y-6">
                  <div className="text-center lg:text-left">
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-950/50 px-3 py-1 rounded-full border border-indigo-900/40">Slide 7: Security &amp; Compliance</span>
                    <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-white mt-3">Strict Clinical Security &amp; Compliance</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Compliance Card 1 */}
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
                      <div className="h-10 w-10 bg-indigo-950 text-indigo-400 rounded-xl flex items-center justify-center">
                        <Lock className="w-5 h-5" />
                      </div>
                      <h4 className="text-base font-bold text-white">Stateless Security</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        No persistent database retention of your clinical files. Once analyzed, results are entirely maintained in local client-side memory to maximize privacy.
                      </p>
                    </div>

                    {/* Compliance Card 2 */}
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
                      <div className="h-10 w-10 bg-indigo-950 text-indigo-400 rounded-xl flex items-center justify-center">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <h4 className="text-base font-bold text-white">Clinical Guardrails</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Clear persistent warnings that all AI insights represent scientific patient education only. The tool is strictly designed to aid physician visits, not replace them.
                      </p>
                    </div>

                    {/* Compliance Card 3 */}
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
                      <div className="h-10 w-10 bg-indigo-950 text-indigo-400 rounded-xl flex items-center justify-center">
                        <Share2 className="w-5 h-5" />
                      </div>
                      <h4 className="text-base font-bold text-white">Secure Encoded Share</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        The 'Share' system uses specialized Base64 UTF-8 serialization built directly into the URL hash, allowing secure report sharing without saving confidential data on the web.
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl flex items-center gap-3 justify-center text-xs text-slate-400 font-mono">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> SSL / TLS In-Transit Encryption Active
                  </div>
                </div>
              )}

              {currentSlide === 7 && (
                <div className="space-y-6 text-center py-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-950/50 px-3 py-1 rounded-full border border-indigo-900/40">Slide 8: Clinical Impact &amp; Horizon</span>
                  
                  <h2 className="text-3xl sm:text-5xl font-extrabold font-heading text-white max-w-4xl mx-auto leading-tight mt-2">
                    Empowering Patient Advocacy for Better Outcomes
                  </h2>

                  <p className="text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
                    By boosting health literacy, we transform the patient role from passive recipient to active clinical partner.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto text-left">
                    <div className="border border-slate-800 bg-slate-900 p-5 rounded-xl">
                      <h4 className="text-white font-bold text-sm">Enhanced Literacy</h4>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        Understanding biomarkers helps patients ask high-value clinical questions instead of feeling lost in jargon.
                      </p>
                    </div>
                    <div className="border border-slate-800 bg-slate-900 p-5 rounded-xl">
                      <h4 className="text-white font-bold text-sm">Optimized Consultation</h4>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        Equipped with specific doctor questions, clinical visits shift directly to high-value care strategies and timelines.
                      </p>
                    </div>
                    <div className="border border-slate-800 bg-slate-900 p-5 rounded-xl">
                      <h4 className="text-white font-bold text-sm">Future Roadmap</h4>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        Planning standard FHIR healthcare API connectors, longitudinal trends mapping, and specialized pediatric indicators.
                      </p>
                    </div>
                  </div>

                  <motion.div 
                    className="pt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <button 
                      onClick={onClose}
                      className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg hover:shadow-indigo-500/20 transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <span>Return to Application Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Slide Navigation Bar */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3 sm:pt-4">
          <div className="flex gap-1">
            {Array.from({ length: slidesCount }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentSlide === idx ? "w-6 bg-indigo-500" : "w-2 bg-slate-800 hover:bg-slate-700"
                }`}
                title={`Go to Slide ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={prevSlide}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={nextSlide}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </AnimatePresence>
  );
}
