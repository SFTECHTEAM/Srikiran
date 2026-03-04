import { useState, useEffect, useRef } from "react";

const STAGES = [
  { id: "idle", label: "Ready" },
  { id: "recording", label: "Recording" },
  { id: "transcribing", label: "Transcribing" },
  { id: "summarizing", label: "Summarizing" },
  { id: "pdf", label: "Generating PDF" },
  { id: "saving", label: "Saving to DB" },
  { id: "done", label: "Complete" },
];

const SAMPLE_TELUGU = [
  "నమస్కారం, నేను రాజేష్ కుమార్ మాట్లాడుతున్నాను.",
  "ఈ నెల మన సేల్స్ టార్గెట్ 40 లక్షలు.",
  "క్లయింట్ మీటింగ్ బుధవారం ఉదయం 10 గంటలకు.",
  "నూతన ప్రాజెక్ట్ డెడ్‌లైన్ మార్చ్ 15.",
  "టీమ్ సభ్యులు: అనిల్, సుమిత్ర, రవి.",
  "బడ్జెట్ అప్రూవల్ పెండింగ్‌లో ఉంది.",
  "హైదరాబాద్ బ్రాంచ్ రిపోర్ట్ సమర్పించాలి.",
];

const SAMPLE_KEYPOINTS = [
  "Sales target for this month: ₹40 Lakhs",
  "Client meeting scheduled: Wednesday 10:00 AM",
  "Project deadline: March 15th",
  "Team members: Anil, Sumitra, Ravi",
  "Budget approval: Pending",
  "Hyderabad branch report submission required",
  "Action items assigned to all team leads",
];

const PAST_MEETINGS = [
  { id: 1, title: "Q1 Sales Review", date: "2026-02-28", duration: "42 min", participants: 5, language: "Telugu", keypoints: 8, status: "complete" },
  { id: 2, title: "Product Roadmap Discussion", date: "2026-03-01", duration: "31 min", participants: 4, language: "Telugu", keypoints: 6, status: "complete" },
  { id: 3, title: "HR Policy Update", date: "2026-03-03", duration: "18 min", participants: 12, language: "Telugu", keypoints: 5, status: "complete" },
];

function WaveformVisualizer({ active }) {
  const bars = 32;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, height: 48 }}>
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} style={{
          width: 4, borderRadius: 2,
          background: active ? `hsl(${160 + i * 2}, 80%, 55%)` : "rgba(255,255,255,0.15)",
          height: "20%",
          transition: "height 0.1s ease, background 0.3s",
          animation: active ? `wave ${0.5 + (i % 5) * 0.1}s ease-in-out infinite alternate` : "none",
          animationDelay: `${i * 0.03}s`,
        }} />
      ))}
      <style>{`@keyframes wave { from { transform: scaleY(0.4); } to { transform: scaleY(1); } }`}</style>
    </div>
  );
}

function PipelineStep({ step, index, currentStageIndex }) {
  const isActive = index === currentStageIndex;
  const isDone = index < currentStageIndex;
  const icons = ["🖥️", "🎙️", "📝", "🤖", "📄", "💾", "✅"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          background: isDone ? "linear-gradient(135deg, #00c896, #00a67e)" : isActive ? "linear-gradient(135deg, #f59e0b, #ef4444)" : "rgba(255,255,255,0.08)",
          border: isActive ? "2px solid #f59e0b" : isDone ? "2px solid #00c896" : "2px solid rgba(255,255,255,0.1)",
          boxShadow: isActive ? "0 0 20px rgba(245,158,11,0.5)" : isDone ? "0 0 12px rgba(0,200,150,0.3)" : "none",
          transition: "all 0.4s ease",
          animation: isActive ? "pulse 1.5s ease-in-out infinite" : "none",
        }}>{icons[index]}</div>
        <span style={{
          fontSize: 10, fontWeight: 600,
          color: isDone ? "#00c896" : isActive ? "#f59e0b" : "rgba(255,255,255,0.35)",
          letterSpacing: "0.05em", whiteSpace: "nowrap",
        }}>{step.label.toUpperCase()}</span>
      </div>
    </div>
  );
}

export default function App() {
  const [stage, setStage] = useState("idle");
  const [activeView, setActiveView] = useState("app");
  const [teleguLines, setTeluguLines] = useState([]);
  const [keypoints, setKeypoints] = useState([]);
  const [timer, setTimer] = useState(0);
  const [meetings, setMeetings] = useState(PAST_MEETINGS);
  const [meetingTitle, setMeetingTitle] = useState("Team Standup - March 2026");
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const timerRef = useRef(null);
  const transcriptRef = useRef(null);

  const stageIndex = STAGES.findIndex((s) => s.id === stage);

  useEffect(() => {
    if (stage === "recording") {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      if (stage === "idle") setTimer(0);
    }
    return () => clearInterval(timerRef.current);
  }, [stage]);

  useEffect(() => {
    if (transcriptRef.current) transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [teleguLines]);

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const startMeeting = () => {
    setStage("recording");
    setTeluguLines([]);
    setKeypoints([]);

    SAMPLE_TELUGU.forEach((line, i) => {
      setTimeout(() => setTeluguLines((prev) => [...prev, line]), 2000 + i * 2500);
    });

    setTimeout(() => {
      setStage("transcribing");
      setTimeout(() => {
        setStage("summarizing");
        SAMPLE_KEYPOINTS.forEach((kp, i) => {
          setTimeout(() => setKeypoints((prev) => [...prev, kp]), i * 400);
        });
        setTimeout(() => {
          setStage("pdf");
          setTimeout(() => {
            setStage("saving");
            setTimeout(() => {
              setStage("done");
              setMeetings((prev) => [{
                id: prev.length + 1, title: meetingTitle,
                date: new Date().toISOString().split("T")[0],
                duration: formatTime(timer + 22) + " min",
                participants: 4, language: "Telugu",
                keypoints: SAMPLE_KEYPOINTS.length, status: "complete",
              }, ...prev]);
            }, 1500);
          }, 2000);
        }, 3000);
      }, 2500);
    }, 22000);
  };

  const reset = () => {
    setStage("idle"); setTeluguLines([]); setKeypoints([]);
    setShowPDFPreview(false); setTimer(0);
  };

  const isRunning = stage !== "idle" && stage !== "done";

  return (
    <div style={{ minHeight: "100vh", background: "#0a0d14", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: "#e8eaf0", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }
        @keyframes pulse { 0%,100%{box-shadow:0 0 20px rgba(245,158,11,0.4)} 50%{box-shadow:0 0 35px rgba(245,158,11,0.8)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rippleOut { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(3);opacity:0} }
        @keyframes glow { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
        .btn-primary:hover { filter: brightness(1.15); transform: translateY(-1px); }
        .nav-btn { cursor:pointer; padding:8px 20px; border-radius:8px; font-size:13px; font-weight:600; letter-spacing:0.04em; transition:all 0.2s; border:none; }
      `}</style>

      {/* Header */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #00c896, #006f55)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎙️</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.02em" }}>Srikiran</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em" }}>MEETING INTELLIGENCE · TELUGU AI</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["app", "dashboard"].map((view) => (
            <button key={view} className="nav-btn" onClick={() => setActiveView(view)} style={{ background: activeView === view ? "rgba(0,200,150,0.15)" : "transparent", color: activeView === view ? "#00c896" : "rgba(255,255,255,0.5)", border: activeView === view ? "1px solid rgba(0,200,150,0.3)" : "1px solid transparent" }}>
              {view === "app" ? "🎙️ Record" : "📊 Dashboard"}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {stage === "recording" && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#ef4444" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", animation: "glow 1s ease-in-out infinite" }} />
              <span style={{ fontFamily: "Space Mono", fontSize: 13 }}>{formatTime(timer)}</span>
            </div>
          )}
          <div style={{ padding: "6px 14px", borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", background: stage === "done" ? "rgba(0,200,150,0.15)" : stage === "recording" ? "rgba(239,68,68,0.15)" : isRunning ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.06)", color: stage === "done" ? "#00c896" : stage === "recording" ? "#ef4444" : isRunning ? "#f59e0b" : "rgba(255,255,255,0.4)", border: `1px solid ${stage === "done" ? "rgba(0,200,150,0.2)" : stage === "recording" ? "rgba(239,68,68,0.2)" : isRunning ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.08)"}` }}>
            {STAGES.find((s) => s.id === stage)?.label.toUpperCase()}
          </div>
        </div>
      </header>

      {activeView === "app" ? (
        <main style={{ flex: 1, padding: "32px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
          {/* Pipeline */}
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "24px 32px", marginBottom: 28, overflowX: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", minWidth: 600 }}>
              {STAGES.map((step, i) => (
                <div key={step.id} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <PipelineStep step={step} index={i} currentStageIndex={stageIndex} />
                  {i < STAGES.length - 1 && <div style={{ flex: 1, height: 2, margin: "0 8px", marginBottom: 22, background: i < stageIndex ? "linear-gradient(90deg, #00c896, #00a67e)" : "rgba(255,255,255,0.07)", borderRadius: 1, transition: "background 0.5s ease" }} />}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Left */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "20px" }}>
                <label style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", fontWeight: 600 }}>MEETING TITLE</label>
                <input value={meetingTitle} onChange={(e) => setMeetingTitle(e.target.value)} disabled={isRunning} style={{ width: "100%", marginTop: 8, background: "transparent", border: "none", outline: "none", color: "#e8eaf0", fontSize: 18, fontWeight: 600, fontFamily: "DM Sans, sans-serif", opacity: isRunning ? 0.5 : 1 }} />
                <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginTop: 8 }} />
                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  {["Telugu → English", "Auto-Record", "AI Summary", "PDF Export"].map((tag) => (
                    <span key={tag} style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, background: "rgba(0,200,150,0.1)", color: "#00c896", border: "1px solid rgba(0,200,150,0.2)", fontWeight: 600 }}>{tag}</span>
                  ))}
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
                <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {stage === "recording" && (
                    <>
                      <div style={{ position: "absolute", width: 120, height: 120, borderRadius: "50%", border: "2px solid rgba(239,68,68,0.3)", animation: "rippleOut 1.5s ease-out infinite" }} />
                      <div style={{ position: "absolute", width: 120, height: 120, borderRadius: "50%", border: "2px solid rgba(239,68,68,0.2)", animation: "rippleOut 1.5s ease-out infinite 0.5s" }} />
                    </>
                  )}
                  <button className="btn-primary" disabled={isRunning && stage !== "done"} onClick={stage === "done" ? reset : startMeeting} style={{ width: 100, height: 100, borderRadius: "50%", border: "none", cursor: (isRunning && stage !== "done") ? "not-allowed" : "pointer", background: stage === "done" ? "linear-gradient(135deg, #00c896, #006f55)" : stage === "recording" ? "linear-gradient(135deg, #ef4444, #b91c1c)" : isRunning ? "linear-gradient(135deg, #f59e0b, #d97706)" : "linear-gradient(135deg, #00c896, #006f55)", fontSize: 36, transition: "all 0.3s ease", boxShadow: stage === "recording" ? "0 0 40px rgba(239,68,68,0.5)" : "0 0 30px rgba(0,200,150,0.3)" }}>
                    {stage === "done" ? "🔄" : stage === "recording" ? "⏹️" : isRunning ? "⏳" : "🎙️"}
                  </button>
                </div>
                <WaveformVisualizer active={stage === "recording"} />
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: stage === "recording" ? "#ef4444" : "#e8eaf0" }}>
                    {stage === "idle" ? "Click to Start Meeting" : stage === "recording" ? "Recording in progress..." : stage === "transcribing" ? "Whisper AI transcribing Telugu..." : stage === "summarizing" ? "Llama3 extracting key points..." : stage === "pdf" ? "Generating PDF report..." : stage === "saving" ? "Saving to database..." : "Meeting Complete! ✅"}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
                    {stage === "idle" ? "Microphone will auto-start" : stage === "recording" ? `Auto-recording · ${formatTime(timer)} elapsed` : stage === "done" ? "Click to record new meeting" : "Please wait..."}
                  </div>
                </div>
                {stage === "done" && (
                  <div style={{ display: "flex", gap: 10, animation: "fadeIn 0.4s ease" }}>
                    <button onClick={() => setShowPDFPreview(true)} className="btn-primary" style={{ padding: "10px 20px", borderRadius: 10, background: "rgba(0,200,150,0.15)", border: "1px solid rgba(0,200,150,0.3)", color: "#00c896", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.2s" }}>📄 View PDF</button>
                    <button onClick={() => setActiveView("dashboard")} className="btn-primary" style={{ padding: "10px 20px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e8eaf0", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.2s" }}>📊 Dashboard</button>
                  </div>
                )}
              </div>
            </div>

            {/* Right */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "20px", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)" }}>WHISPER · TELUGU TRANSCRIPT</div>
                  {stage === "transcribing" && <div style={{ width: 14, height: 14, border: "2px solid #00c896", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />}
                </div>
                <div ref={transcriptRef} style={{ height: 180, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                  {teleguLines.length === 0 ? (
                    <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 13, fontStyle: "italic", marginTop: 20, textAlign: "center" }}>Telugu speech will appear here in real-time...</div>
                  ) : (
                    teleguLines.map((line, i) => (
                      <div key={i} style={{ fontSize: 14, color: "#e8eaf0", padding: "8px 12px", background: "rgba(255,255,255,0.04)", borderRadius: 8, borderLeft: "3px solid rgba(0,200,150,0.4)", animation: "slideIn 0.3s ease", lineHeight: 1.5 }}>
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "Space Mono" }}>{String(i + 1).padStart(2, "0")} ·</span> {line}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "20px", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.4)" }}>LLAMA3 · ENGLISH KEY POINTS</div>
                  {stage === "summarizing" && <div style={{ width: 14, height: 14, border: "2px solid #f59e0b", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, height: 180, overflowY: "auto" }}>
                  {keypoints.length === 0 ? (
                    <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 13, fontStyle: "italic", marginTop: 20, textAlign: "center" }}>AI-extracted key points will appear here...</div>
                  ) : (
                    keypoints.map((kp, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 12px", background: "rgba(245,158,11,0.06)", borderRadius: 8, borderLeft: "3px solid rgba(245,158,11,0.4)", animation: "slideIn 0.3s ease", fontSize: 13, color: "#e8eaf0", lineHeight: 1.4 }}>
                        <span style={{ color: "#f59e0b", fontWeight: 700, fontSize: 12, marginTop: 1 }}>{String(i + 1).padStart(2, "0")}</span>{kp}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      ) : (
        <main style={{ flex: 1, padding: "32px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>Admin Dashboard</h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginTop: 4 }}>All recorded meetings · Telugu AI intelligence</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
            {[
              { label: "Total Meetings", value: meetings.length, icon: "🎙️", color: "#00c896" },
              { label: "Hours Recorded", value: "4.2h", icon: "⏱️", color: "#f59e0b" },
              { label: "Key Points", value: meetings.reduce((a, m) => a + m.keypoints, 0), icon: "✅", color: "#60a5fa" },
              { label: "PDFs Generated", value: meetings.length, icon: "📄", color: "#a78bfa" },
            ].map((stat) => (
              <div key={stat.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "20px" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: stat.color, fontFamily: "Space Mono" }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 4, fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>All Meetings</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{meetings.length} records</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 1fr", padding: "10px 24px", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.35)" }}>
              {["TITLE", "DATE", "DURATION", "PARTICIPANTS", "LANGUAGE", "KEY POINTS", "ACTIONS"].map((h) => <span key={h}>{h}</span>)}
            </div>
            {meetings.map((meeting, i) => (
              <div key={meeting.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr 1fr", padding: "14px 24px", borderBottom: i < meetings.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", fontSize: 13, alignItems: "center" }}>
                <div style={{ fontWeight: 600 }}>{meeting.title}</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Space Mono", fontSize: 11 }}>{meeting.date}</div>
                <div style={{ color: "rgba(255,255,255,0.5)" }}>{meeting.duration}</div>
                <div style={{ color: "rgba(255,255,255,0.5)" }}>{meeting.participants} people</div>
                <div><span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, background: "rgba(0,200,150,0.1)", color: "#00c896", border: "1px solid rgba(0,200,150,0.2)", fontWeight: 600 }}>{meeting.language}</span></div>
                <div><span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(245,158,11,0.1)", color: "#f59e0b", fontWeight: 600 }}>{meeting.keypoints} pts</span></div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setShowPDFPreview(true)} style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)", color: "#60a5fa", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>📄 PDF</button>
                </div>
              </div>
            ))}
          </div>
        </main>
      )}

      {/* PDF Modal */}
      {showPDFPreview && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 32, animation: "fadeIn 0.2s ease" }} onClick={() => setShowPDFPreview(false)}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 640, maxHeight: "80vh", overflowY: "auto", color: "#1a1a1a", padding: "48px", animation: "fadeIn 0.3s ease" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ borderBottom: "3px solid #00c896", paddingBottom: 20, marginBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "#00c896" }}>SRIKIRAN MEETING INTELLIGENCE</div>
                  <h1 style={{ fontSize: 22, fontWeight: 800, marginTop: 6, color: "#111" }}>{meetingTitle}</h1>
                </div>
                <button onClick={() => setShowPDFPreview(false)} style={{ background: "rgba(0,0,0,0.08)", border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>✕ Close</button>
              </div>
              <div style={{ display: "flex", gap: 20, marginTop: 14, fontSize: 12, color: "#666" }}>
                <span>📅 {new Date().toLocaleDateString("en-IN")}</span>
                <span>🌐 Telugu → English</span>
                <span>⏱️ {formatTime(timer + 22)}</span>
              </div>
            </div>
            <h2 style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.08em", color: "#111", marginBottom: 14 }}>📋 KEY POINTS</h2>
            {SAMPLE_KEYPOINTS.map((kp, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "10px 14px", marginBottom: 8, background: i % 2 === 0 ? "#f8fffe" : "#fff", borderRadius: 8, borderLeft: "3px solid #00c896", fontSize: 13 }}>
                <span style={{ color: "#00c896", fontWeight: 700, minWidth: 20 }}>{i + 1}.</span>{kp}
              </div>
            ))}
            <h2 style={{ fontSize: 13, fontWeight: 800, letterSpacing: "0.08em", color: "#111", marginBottom: 14, marginTop: 28 }}>🎙️ TELUGU TRANSCRIPT</h2>
            {SAMPLE_TELUGU.map((line, i) => (
              <div key={i} style={{ fontSize: 13, padding: "8px 0", borderBottom: "1px solid #f0f0f0", color: "#444", lineHeight: 1.6 }}>
                <span style={{ color: "#999", fontSize: 11, marginRight: 8, fontFamily: "monospace" }}>{String(i + 1).padStart(2, "0")}</span>{line}
              </div>
            ))}
            <div style={{ marginTop: 28, padding: "12px 16px", background: "#f8f8f8", borderRadius: 8, fontSize: 11, color: "#999", textAlign: "center" }}>
              Generated by Srikiran · Whisper AI + Llama3 · {new Date().toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
