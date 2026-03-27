import { useState, useEffect, useCallback, useRef } from "react";

// ─── Constants & Mock Data ────────────────────────────────────────────
const DEPARTMENT_ROLES = {
  "Engineering": [
    "Backend Developer", "Frontend Developer", "Full-Stack Developer",
    "DevOps Engineer", "Site Reliability Engineer (SRE)", "Cloud Engineer",
    "QA Engineer", "Solutions Architect", "Technical Writer",
  ],
  "Product": [
    "Product Manager", "Product Owner", "Project Manager", "Scrum Master",
    "Business Analyst", "Technical Program Manager",
  ],
  "Design": [
    "UX Designer", "UI Designer", "UX Researcher", "Product Designer",
    "Visual Designer", "Design Systems Engineer",
  ],
  "Data Science": [
    "Data Analyst", "Data Engineer", "Data Scientist", "ML Engineer",
    "Analytics Engineer", "BI Developer",
  ],
  "Infrastructure": [
    "Infrastructure Engineer", "Platform Engineer", "Cloud Engineer",
    "DevOps Engineer", "Site Reliability Engineer (SRE)", "Network Engineer",
  ],
  "Security": [
    "Security Engineer", "Security Analyst", "Penetration Tester",
    "Application Security Engineer", "Security Architect",
  ],
  "Customer Care": [
    "Customer Care Representative", "Customer Care Specialist",
    "Customer Care Team Lead", "Customer Care Manager",
    "Quality Assurance Analyst", "Training Coordinator",
  ],
  "Customer Success": [
    "Customer Success Manager", "Customer Success Associate",
    "Onboarding Specialist", "Renewal Manager", "Solutions Consultant",
  ],
  "Sales": [
    "Sales Representative", "Sales Engineer", "Account Executive",
    "Sales Manager", "Sales Director", "Sales Development Representative (SDR)",
    "Business Development Representative (BDR)",
  ],
  "Business Development": [
    "Business Development Manager", "Partnerships Manager",
    "Strategic Alliances Lead", "Channel Manager",
  ],
  "Compliance / GRC": [
    "Compliance Analyst", "GRC Analyst", "Compliance Manager",
    "Compliance Officer", "Policy Analyst", "Regulatory Affairs Specialist",
  ],
  "Risk Management": [
    "Risk Analyst", "Risk Manager", "Enterprise Risk Lead",
    "Operational Risk Analyst", "Vendor Risk Analyst",
  ],
  "Internal Audit": [
    "Internal Auditor", "Senior Auditor", "IT Auditor",
    "Audit Manager", "Forensic Analyst",
  ],
  "Human Resources": [
    "HR Generalist", "HR Business Partner", "HR Manager",
    "Compensation & Benefits Analyst", "Employee Relations Specialist",
  ],
  "People Operations": [
    "People Operations Specialist", "People Operations Manager",
    "HRIS Analyst", "Workforce Planning Analyst",
  ],
  "Talent Acquisition": [
    "Recruiter", "Senior Recruiter", "Recruiting Coordinator",
    "Sourcing Specialist", "Talent Acquisition Manager",
  ],
  "Marketing": [
    "Marketing Specialist", "Content Strategist", "Growth Manager",
    "Demand Generation Manager", "SEO Specialist", "Brand Manager",
    "Marketing Manager",
  ],
  "Communications": [
    "Communications Specialist", "PR Manager", "Internal Communications Manager",
    "Social Media Manager", "Corporate Communications Director",
  ],
  "Finance": [
    "Finance Analyst", "Financial Planner", "FP&A Analyst",
    "Finance Manager", "Treasury Analyst",
  ],
  "Accounting": [
    "Accountant", "Senior Accountant", "Controller",
    "Accounts Payable Specialist", "Accounts Receivable Specialist", "Tax Analyst",
  ],
  "Legal": [
    "Corporate Counsel", "Legal Analyst", "Paralegal",
    "Contracts Manager", "IP Counsel",
  ],
  "IT / Helpdesk": [
    "IT Support Specialist", "Helpdesk Technician", "Systems Administrator",
    "IT Manager", "Desktop Support Engineer", "IT Asset Manager",
  ],
  "Operations": [
    "Operations Manager", "Operations Analyst", "Facilities Manager",
    "Procurement Specialist", "Supply Chain Analyst",
  ],
  "Executive": [
    "Executive / Director", "VP / C-Suite", "Chief of Staff",
    "Executive Assistant",
  ],
  "Other (Custom)": [],
};
const DEPARTMENTS = Object.keys(DEPARTMENT_ROLES);
const getRolesForDept = (dept) => {
  const roles = DEPARTMENT_ROLES[dept] || [];
  return [...roles, "Other (Custom)"];
};
const PLATFORMS = ["Windows (Intune/Autopilot)", "Mac (JAMF/ABM)"];

const STANDARD_ACCESS = [
  { id: "slack", name: "Slack", icon: "💬", category: "Communication" },
  { id: "email", name: "Microsoft 365 / Outlook", icon: "📧", category: "Communication" },
  { id: "teams", name: "Microsoft Teams", icon: "📹", category: "Communication" },
  { id: "onedrive", name: "OneDrive", icon: "☁️", category: "Storage" },
  { id: "github", name: "GitHub", icon: "🐙", category: "Development" },
];

const OPTIONAL_ACCESS = [
  { id: "aws_prod", name: "AWS Production", icon: "☁️", category: "Cloud", risk: "high" },
  { id: "aws_dev", name: "AWS Dev/Staging", icon: "☁️", category: "Cloud", risk: "medium" },
  { id: "figma", name: "Figma Editor", icon: "🎨", category: "Design", risk: "low" },
  { id: "adobe_cc", name: "Adobe Creative Cloud", icon: "🎬", category: "Design", risk: "low" },
  { id: "jira", name: "Jira", icon: "📋", category: "Project Mgmt", risk: "low" },
  { id: "confluence", name: "Confluence", icon: "📖", category: "Documentation", risk: "low" },
  { id: "datadog", name: "Datadog", icon: "📊", category: "Monitoring", risk: "medium" },
  { id: "pagerduty", name: "PagerDuty", icon: "🔔", category: "Ops", risk: "medium" },
  { id: "terraform", name: "Terraform Cloud", icon: "🏗️", category: "Infrastructure", risk: "high" },
  { id: "k8s", name: "Kubernetes (EKS)", icon: "⚙️", category: "Infrastructure", risk: "high" },
  { id: "sentry", name: "Sentry", icon: "🐛", category: "Monitoring", risk: "low" },
  { id: "vercel", name: "Vercel", icon: "▲", category: "Deployment", risk: "medium" },
];

const KNOWBE4_MODULES = [
  { id: "phishing", name: "Phishing Awareness", duration: "15 min", required: true },
  { id: "password", name: "Password Security", duration: "10 min", required: true },
  { id: "data_handling", name: "Data Handling & Classification", duration: "20 min", required: true },
  { id: "social_eng", name: "Social Engineering", duration: "12 min", required: true },
  { id: "remote_work", name: "Secure Remote Work", duration: "10 min", required: false },
];

const GHOST_THRESHOLDS = { warning: 2, critical: 4, escalate: 6 };

function generateId() {
  return "NP-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateJiraId() {
  return "JIRA-" + Math.floor(1000 + Math.random() * 9000);
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Reusable Components ──────────────────────────────────────────────
function PulseRing({ color = "var(--accent)", size = 10 }) {
  return (
    <span style={{ position: "relative", display: "inline-block", width: size, height: size }}>
      <span style={{
        position: "absolute", inset: 0, borderRadius: "50%", background: color,
        animation: "pulse-ring 2s ease-out infinite",
      }} />
      <span style={{
        position: "absolute", inset: 2, borderRadius: "50%", background: color,
      }} />
    </span>
  );
}

function Badge({ children, variant = "default", style: s }) {
  const colors = {
    default: { bg: "rgba(0,234,199,0.12)", color: "var(--accent)" },
    warning: { bg: "rgba(255,183,77,0.15)", color: "#FFB74D" },
    danger: { bg: "rgba(239,83,80,0.15)", color: "#EF5350" },
    success: { bg: "rgba(102,187,106,0.15)", color: "#66BB6A" },
    info: { bg: "rgba(66,165,245,0.12)", color: "#42A5F5" },
    high: { bg: "rgba(239,83,80,0.15)", color: "#EF5350" },
    medium: { bg: "rgba(255,183,77,0.15)", color: "#FFB74D" },
    low: { bg: "rgba(102,187,106,0.15)", color: "#66BB6A" },
  };
  const c = colors[variant] || colors.default;
  return (
    <span style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 600, letterSpacing: 0.5,
      background: c.bg, color: c.color, ...s,
    }}>{children}</span>
  );
}

function ProgressBar({ value, max = 100, color = "var(--accent)", height = 6 }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div style={{ width: "100%", height, borderRadius: height, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
      <div style={{
        width: `${pct}%`, height: "100%", borderRadius: height,
        background: `linear-gradient(90deg, ${color}, ${color}88)`,
        transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
      }} />
    </div>
  );
}

function Card({ children, style: s, glow, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: "var(--card-bg)", border: "1px solid var(--border)",
      borderRadius: 14, padding: 20, position: "relative", overflow: "hidden",
      cursor: onClick ? "pointer" : "default",
      transition: "border-color 0.2s, box-shadow 0.2s",
      ...(glow ? { boxShadow: `0 0 20px ${glow}22`, borderColor: glow + "44" } : {}),
      ...s,
    }}>{children}</div>
  );
}

function TabButton({ active, children, onClick, icon }) {
  return (
    <button onClick={onClick} style={{
      padding: "10px 18px", border: "none", borderRadius: 10,
      background: active ? "var(--accent)" : "transparent",
      color: active ? "var(--bg)" : "var(--text-muted)",
      fontWeight: 600, fontSize: 13, cursor: "pointer",
      display: "flex", alignItems: "center", gap: 7,
      transition: "all 0.2s",
      fontFamily: "inherit",
    }}>
      {icon && <span style={{ fontSize: 15 }}>{icon}</span>}
      {children}
    </button>
  );
}

function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text)", letterSpacing: -0.3 }}>{children}</h3>
      {sub && <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--text-muted)" }}>{sub}</p>}
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13 }}>
      <div onClick={() => onChange(!checked)} style={{
        width: 38, height: 20, borderRadius: 10, padding: 2,
        background: checked ? "var(--accent)" : "rgba(255,255,255,0.1)",
        transition: "background 0.2s", cursor: "pointer",
      }}>
        <div style={{
          width: 16, height: 16, borderRadius: 8, background: "#fff",
          transform: checked ? "translateX(18px)" : "translateX(0)",
          transition: "transform 0.2s",
        }} />
      </div>
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
    </label>
  );
}

// ─── AI Chat Component ────────────────────────────────────────────────
function NovaChat({ hireData, tickets, trainingStatus }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hey there! I'm Nova, your onboarding AI buddy. I can help with setup questions, check ticket statuses, troubleshoot access issues, or walk you through any step. What do you need?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEnd = useRef(null);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const contextBlock = `
CONTEXT — You are "Nova," the AI onboarding agent for Nova-Pulse. You are helping a new hire get set up.
New Hire: ${hireData?.name || "Unknown"} | Role: ${hireData?.role || "N/A"} | Dept: ${hireData?.department || "N/A"} | Platform: ${hireData?.platform || "N/A"}
Open Tickets: ${tickets?.filter(t => t.status !== "Done").map(t => `${t.id}: ${t.app} (${t.status})`).join("; ") || "None"}
Training Complete: ${trainingStatus || "Unknown"}%
Be concise, supportive, and action-oriented. If they ask about a stuck ticket, offer to escalate. If they need help with device setup, give platform-specific steps. Reference the "100-ticket ghost" humorously when reminding about training. Keep responses under 150 words.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: contextBlock,
          messages: [...messages.slice(-8), { role: "user", content: userMsg }].map(m => ({
            role: m.role, content: m.content,
          })),
        }),
      });
      const data = await response.json();
      const reply = data.content?.filter(b => b.type === "text").map(b => b.text).join("\n") || "I'm having trouble connecting right now. Try again in a moment.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Connection hiccup — try again in a sec." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 0", display: "flex", flexDirection: "column", gap: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === "user" ? "flex-end" : "flex-start",
            maxWidth: "82%", padding: "10px 14px", borderRadius: 12,
            background: m.role === "user" ? "var(--accent)" : "rgba(255,255,255,0.06)",
            color: m.role === "user" ? "var(--bg)" : "var(--text)",
            fontSize: 13, lineHeight: 1.5,
            borderBottomRightRadius: m.role === "user" ? 4 : 12,
            borderBottomLeftRadius: m.role === "user" ? 12 : 4,
          }}>
            {m.role === "assistant" && <div style={{ fontSize: 10, color: "var(--accent)", fontWeight: 700, marginBottom: 3 }}>NOVA</div>}
            {m.content}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: "flex-start", padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,0.06)", fontSize: 13, color: "var(--text-muted)" }}>
            <span style={{ animation: "pulse-ring 1s ease-in-out infinite" }}>Nova is thinking...</span>
          </div>
        )}
        <div ref={chatEnd} />
      </div>
      <div style={{ display: "flex", gap: 8, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Ask Nova anything..."
          style={{
            flex: 1, padding: "10px 14px", borderRadius: 10, border: "1px solid var(--border)",
            background: "rgba(255,255,255,0.04)", color: "var(--text)", fontSize: 13,
            outline: "none", fontFamily: "inherit",
          }}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()} style={{
          padding: "10px 18px", borderRadius: 10, border: "none",
          background: input.trim() ? "var(--accent)" : "rgba(255,255,255,0.06)",
          color: input.trim() ? "var(--bg)" : "var(--text-muted)",
          fontWeight: 700, cursor: input.trim() ? "pointer" : "default",
          fontSize: 13, fontFamily: "inherit",
        }}>Send</button>
      </div>
    </div>
  );
}

// ─── Stakeholder Views ────────────────────────────────────────────────
// HIRING MANAGER INTAKE FORM
function HiringManagerIntake({ onSubmit }) {
  const [form, setForm] = useState({
    name: "", email: "", department: DEPARTMENTS[0],
    role: getRolesForDept(DEPARTMENTS[0])[0],
    platform: PLATFORMS[0], startDate: "", manager: "",
    customRole: "", customDepartment: "",
    standardAccess: STANDARD_ACCESS.map(a => a.id),
    optionalAccess: [], notes: "", standingDesk: false,
  });
  const [step, setStep] = useState(0);

  const update = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const toggleOptional = (id) => {
    setForm(p => ({
      ...p,
      optionalAccess: p.optionalAccess.includes(id)
        ? p.optionalAccess.filter(x => x !== id)
        : [...p.optionalAccess, id],
    }));
  };

  const steps = [
    // Step 0: Basic Info
    () => (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <SectionTitle sub="Who are we welcoming?">New Hire Details</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "Full Name", key: "name", placeholder: "Jane Smith" },
            { label: "Personal Email", key: "email", placeholder: "jane@email.com" },
            { label: "Hiring Manager", key: "manager", placeholder: "Your Name" },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>{f.label}</label>
              <input value={form[f.key]} onChange={e => update(f.key, e.target.value)} placeholder={f.placeholder}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)",
                  background: "rgba(255,255,255,0.04)", color: "var(--text)", fontSize: 13, marginTop: 4,
                  outline: "none", fontFamily: "inherit", boxSizing: "border-box",
                }} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>Start Date</label>
            <input type="date" value={form.startDate} onChange={e => update("startDate", e.target.value)}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)",
                background: "rgba(255,255,255,0.04)", color: "var(--text)", fontSize: 13, marginTop: 4,
                outline: "none", fontFamily: "inherit", boxSizing: "border-box",
              }} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {/* Department — drives Role options */}
          <div>
            <label style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>Department</label>
            <select value={form.department} onChange={e => {
              const dept = e.target.value;
              const newRoles = getRolesForDept(dept);
              update("department", dept);
              update("role", newRoles[0] || "Other (Custom)");
              update("customRole", "");
              if (dept !== "Other (Custom)") update("customDepartment", "");
            }}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)",
                background: "var(--card-bg)", color: "var(--text)", fontSize: 13, marginTop: 4,
                outline: "none", fontFamily: "inherit",
              }}>
              {DEPARTMENTS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            {form.department === "Other (Custom)" && (
              <input
                value={form.customDepartment}
                onChange={e => update("customDepartment", e.target.value)}
                placeholder="Enter custom department..."
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 8, marginTop: 6,
                  border: "1px solid var(--accent)", background: "rgba(0,234,199,0.04)",
                  color: "var(--text)", fontSize: 13, outline: "none",
                  fontFamily: "inherit", boxSizing: "border-box",
                }}
              />
            )}
          </div>
          {/* Role — filtered by Department */}
          <div>
            <label style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>Role</label>
            <select value={form.role} onChange={e => {
              update("role", e.target.value);
              if (e.target.value !== "Other (Custom)") update("customRole", "");
            }}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)",
                background: "var(--card-bg)", color: "var(--text)", fontSize: 13, marginTop: 4,
                outline: "none", fontFamily: "inherit",
              }}>
              {getRolesForDept(form.department).map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            {form.role === "Other (Custom)" && (
              <input
                value={form.customRole}
                onChange={e => update("customRole", e.target.value)}
                placeholder="Enter custom role..."
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 8, marginTop: 6,
                  border: "1px solid var(--accent)", background: "rgba(0,234,199,0.04)",
                  color: "var(--text)", fontSize: 13, outline: "none",
                  fontFamily: "inherit", boxSizing: "border-box",
                }}
              />
            )}
          </div>
          {/* Platform */}
          <div>
            <label style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>Platform</label>
            <select value={form.platform} onChange={e => update("platform", e.target.value)}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)",
                background: "var(--card-bg)", color: "var(--text)", fontSize: 13, marginTop: 4,
                outline: "none", fontFamily: "inherit",
              }}>
              {PLATFORMS.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        </div>
      </div>
    ),
    // Step 1: Access & Programs
    () => (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <SectionTitle sub="Standard image included automatically">Standard Access (Baseline)</SectionTitle>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {STANDARD_ACCESS.map(a => (
            <div key={a.id} style={{
              padding: "8px 14px", borderRadius: 8, background: "rgba(0,234,199,0.08)",
              border: "1px solid rgba(0,234,199,0.2)", display: "flex", alignItems: "center", gap: 8,
              fontSize: 13, color: "var(--accent)",
            }}>
              <span>{a.icon}</span> {a.name} <span style={{ fontSize: 10 }}>✓</span>
            </div>
          ))}
        </div>
        <SectionTitle sub="Select additional programs, access, and apps">Custom Requirements</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {OPTIONAL_ACCESS.map(a => {
            const selected = form.optionalAccess.includes(a.id);
            return (
              <div key={a.id} onClick={() => toggleOptional(a.id)} style={{
                padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                background: selected ? "rgba(0,234,199,0.08)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${selected ? "var(--accent)" : "var(--border)"}`,
                display: "flex", alignItems: "center", gap: 10, transition: "all 0.2s",
              }}>
                <span style={{ fontSize: 18 }}>{a.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{a.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{a.category}</div>
                </div>
                {a.risk && <Badge variant={a.risk}>{a.risk}</Badge>}
                <div style={{
                  width: 20, height: 20, borderRadius: 6, border: `2px solid ${selected ? "var(--accent)" : "var(--border)"}`,
                  background: selected ? "var(--accent)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, color: "var(--bg)", fontWeight: 700,
                }}>{selected ? "✓" : ""}</div>
              </div>
            );
          })}
        </div>
      </div>
    ),
    // Step 2: Review & Submit
    () => (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <SectionTitle sub="Confirm everything looks right before generating the portal">Review & Submit</SectionTitle>
        <Card>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13 }}>
            {[
              ["Name", form.name], ["Email", form.email],
              ["Department", form.department === "Other (Custom)" ? (form.customDepartment || "Custom (not set)") : form.department],
              ["Role", form.role === "Other (Custom)" ? (form.customRole || "Custom (not set)") : form.role],
              ["Platform", form.platform],
              ["Start Date", form.startDate], ["Manager", form.manager],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>{k}</div>
                <div style={{ color: "var(--text)", marginTop: 2 }}>{v || "—"}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>Access Bundle ({STANDARD_ACCESS.length + form.optionalAccess.length} items)</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {STANDARD_ACCESS.map(a => <Badge key={a.id} variant="success">{a.icon} {a.name}</Badge>)}
            {form.optionalAccess.map(id => {
              const a = OPTIONAL_ACCESS.find(x => x.id === id);
              return <Badge key={id} variant="info">{a.icon} {a.name}</Badge>;
            })}
          </div>
        </Card>
        {form.optionalAccess.some(id => OPTIONAL_ACCESS.find(x => x.id === id)?.risk === "high") && (
          <Card glow="#EF5350">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>⚠️</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#EF5350" }}>HITL Approval Required</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>High-risk access items will require SysAdmin sign-off before provisioning.</div>
              </div>
            </div>
          </Card>
        )}
        <div>
          <label style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Additional Notes</label>
          <textarea value={form.notes} onChange={e => update("notes", e.target.value)} rows={3}
            placeholder="e.g., Prefers standing desk, needs dual monitor, left-handed mouse..."
            style={{
              width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)",
              background: "rgba(255,255,255,0.04)", color: "var(--text)", fontSize: 13, marginTop: 4,
              outline: "none", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box",
            }} />
        </div>
        <Toggle checked={form.standingDesk} onChange={v => update("standingDesk", v)} label="Request standing desk (auto-creates Procurement ticket)" />
      </div>
    ),
  ];

  const customRoleValid = form.role !== "Other (Custom)" || form.customRole.trim();
  const customDeptValid = form.department !== "Other (Custom)" || form.customDepartment.trim();
  const canProceed = step === 0 ? (form.name && form.email && form.startDate && form.manager && customRoleValid && customDeptValid) : true;

  return (
    <div>
      {/* Step indicator */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
        {["Hire Details", "Access & Programs", "Review & Submit"].map((s, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center" }}>
            <div style={{
              height: 3, borderRadius: 2, marginBottom: 6,
              background: i <= step ? "var(--accent)" : "rgba(255,255,255,0.08)",
              transition: "background 0.3s",
            }} />
            <span style={{ fontSize: 11, color: i <= step ? "var(--accent)" : "var(--text-muted)", fontWeight: 600 }}>{s}</span>
          </div>
        ))}
      </div>
      {steps[step]()}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
        {step > 0 ? (
          <button onClick={() => setStep(s => s - 1)} style={{
            padding: "10px 20px", borderRadius: 10, border: "1px solid var(--border)",
            background: "transparent", color: "var(--text)", fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
          }}>Back</button>
        ) : <div />}
        {step < 2 ? (
          <button onClick={() => canProceed && setStep(s => s + 1)} style={{
            padding: "10px 24px", borderRadius: 10, border: "none",
            background: canProceed ? "var(--accent)" : "rgba(255,255,255,0.06)",
            color: canProceed ? "var(--bg)" : "var(--text-muted)",
            fontSize: 13, fontWeight: 700, cursor: canProceed ? "pointer" : "default",
            fontFamily: "inherit",
          }}>Continue</button>
        ) : (
          <button onClick={() => {
            const resolved = {
              ...form,
              role: form.role === "Other (Custom)" && form.customRole ? form.customRole : form.role,
              department: form.department === "Other (Custom)" && form.customDepartment ? form.customDepartment : form.department,
              portalId: generateId(),
              createdAt: new Date(),
            };
            onSubmit(resolved);
          }} style={{
            padding: "10px 28px", borderRadius: 10, border: "none",
            background: "var(--accent)", color: "var(--bg)",
            fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}>🚀 Generate Onboarding Portal</button>
        )}
      </div>
    </div>
  );
}

// HR APPROVAL DASHBOARD
function HRDashboard({ hireData, onApprove }) {
  const [approved, setApproved] = useState(false);
  if (!hireData) return (
    <Card style={{ textAlign: "center", padding: 40 }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
      <div style={{ color: "var(--text-muted)", fontSize: 14 }}>No pending onboarding requests. Use the Hiring Manager portal to create one.</div>
    </Card>
  );

  const highRisk = hireData.optionalAccess?.filter(id => OPTIONAL_ACCESS.find(x => x.id === id)?.risk === "high") || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card glow={approved ? "#66BB6A" : "#42A5F5"}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{hireData.name}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{hireData.department} · {hireData.role}</div>
          </div>
          <Badge variant={approved ? "success" : "info"}>{approved ? "APPROVED" : "PENDING REVIEW"}</Badge>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, fontSize: 12, marginBottom: 16 }}>
          {[
            ["Portal ID", hireData.portalId], ["Start Date", hireData.startDate],
            ["Platform", hireData.platform?.split(" ")[0]], ["Manager", hireData.manager],
          ].map(([k, v]) => (
            <div key={k}>
              <div style={{ color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", fontSize: 10 }}>{k}</div>
              <div style={{ color: "var(--text)", fontWeight: 500, marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600, marginBottom: 6, textTransform: "uppercase" }}>
          Requested Access ({(hireData.standardAccess?.length || 0) + (hireData.optionalAccess?.length || 0)} items)
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
          {STANDARD_ACCESS.map(a => <Badge key={a.id} variant="success">{a.name}</Badge>)}
          {hireData.optionalAccess?.map(id => {
            const a = OPTIONAL_ACCESS.find(x => x.id === id);
            return <Badge key={id} variant={a?.risk || "default"}>{a?.name}</Badge>;
          })}
        </div>
        {highRisk.length > 0 && (
          <Card style={{ background: "rgba(239,83,80,0.06)", border: "1px solid rgba(239,83,80,0.2)", marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#EF5350", marginBottom: 6 }}>⚠️ HITL — High-Risk Access Requires Approval</div>
            {highRisk.map(id => {
              const a = OPTIONAL_ACCESS.find(x => x.id === id);
              return <div key={id} style={{ fontSize: 12, color: "var(--text-secondary)", padding: "2px 0" }}>• {a?.name} — Requires SysAdmin + HR sign-off</div>;
            })}
          </Card>
        )}
        {hireData.notes && (
          <div style={{ fontSize: 12, color: "var(--text-secondary)", background: "rgba(255,255,255,0.03)", padding: 10, borderRadius: 8, marginBottom: 12 }}>
            <strong>Notes:</strong> {hireData.notes}
          </div>
        )}
        {!approved ? (
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => { setApproved(true); onApprove && onApprove(); }} style={{
              flex: 1, padding: "10px 20px", borderRadius: 10, border: "none",
              background: "var(--accent)", color: "var(--bg)", fontSize: 13, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
            }}>✓ Approve & Generate Portal</button>
            <button style={{
              padding: "10px 20px", borderRadius: 10, border: "1px solid #EF5350",
              background: "transparent", color: "#EF5350", fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}>Request Changes</button>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: 8, color: "#66BB6A", fontSize: 13, fontWeight: 600 }}>
            ✓ Portal generated — Link sent to {hireData.email}
          </div>
        )}
      </Card>
    </div>
  );
}

// NEW HIRE PORTAL
function NewHirePortal({ hireData, tickets, setTickets, trainingProgress, setTrainingProgress }) {
  const [portalPhase, setPortalPhase] = useState("setup"); // setup | identity | reconcile | training | ready
  const [identityStep, setIdentityStep] = useState(0);
  const [mfaActive, setMfaActive] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const allTicketsDone = tickets.every(t => t.status === "Done");
  const trainingComplete = trainingProgress >= 100;
  const readyToWork = allTicketsDone && trainingComplete && mfaActive;

  // Ghost monitor: auto-escalate stale tickets
  useEffect(() => {
    const interval = setInterval(() => {
      setTickets(prev => prev.map(t => {
        if (t.status === "Open" && !t.escalated) {
          const age = (Date.now() - t.createdAt) / (1000 * 60 * 60);
          if (age > GHOST_THRESHOLDS.critical) {
            return { ...t, escalated: true, status: "Escalated", ghostAlert: `Auto-escalated after ${Math.round(age)}h with no activity` };
          }
        }
        return t;
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, [setTickets]);

  const isMac = hireData?.platform?.includes("Mac");

  const identitySteps = [
    {
      title: "Initial Login", sub: "Use your temporary credentials",
      content: (
        <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>
          <p>Open ManageEngine Self-Service Portal and sign in with:</p>
          <Card style={{ background: "rgba(0,234,199,0.04)", padding: 14, fontFamily: "monospace", fontSize: 12 }}>
            <div>Username: <span style={{ color: "var(--accent)" }}>{hireData?.name?.toLowerCase().replace(/\s/g, ".") || "first.last"}@company.com</span></div>
            <div>Temp Password: <span style={{ color: "#FFB74D" }}>Sent to your personal email</span></div>
          </Card>
        </div>
      ),
    },
    {
      title: "Password Reset", sub: "Create your permanent password via ManageEngine",
      content: (
        <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>
          <p>After logging in, you'll be prompted to set a permanent password. Requirements:</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 12 }}>
            {["12+ characters", "1 uppercase letter", "1 number", "1 special character", "No dictionary words", "Cannot reuse last 5 passwords"].map(r => (
              <div key={r} style={{ padding: "6px 10px", borderRadius: 6, background: "rgba(255,255,255,0.03)" }}>✓ {r}</div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "MFA Enrollment", sub: "Set up Duo/Okta multi-factor authentication",
      content: (
        <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7 }}>
          <p>Scan the QR code with your authenticator app (Duo Mobile or Okta Verify).</p>
          <div style={{ display: "flex", justifyContent: "center", margin: "12px 0" }}>
            <div style={{
              width: 120, height: 120, background: "rgba(255,255,255,0.06)", borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "2px dashed var(--border)", fontSize: 11, color: "var(--text-muted)",
            }}>[QR Code]<br />MFA Setup</div>
          </div>
          <button onClick={() => setMfaActive(true)} style={{
            width: "100%", padding: "10px", borderRadius: 8, border: "none",
            background: mfaActive ? "#66BB6A" : "var(--accent)", color: "var(--bg)",
            fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}>{mfaActive ? "✓ MFA Verified" : "Verify MFA Code"}</button>
        </div>
      ),
    },
  ];

  const deviceGuide = isMac ? {
    title: "Mac Setup — JAMF / Apple Business Manager",
    steps: [
      "Power on your Mac and connect to Wi-Fi",
      "At the Remote Management screen, sign in with your company credentials",
      "JAMF will automatically install required profiles and apps",
      "Open System Preferences → Profiles to verify MDM enrollment",
      "Launch Self Service app for additional software installations",
    ],
  } : {
    title: "Windows Setup — Intune / Autopilot",
    steps: [
      "Power on and connect to your corporate Wi-Fi or Ethernet",
      "At the 'Let's set things up for work' screen, enter your company email",
      "Windows Autopilot will auto-configure your device policies",
      "Wait for Intune to push required apps (this may take 15-20 min)",
      "Restart when prompted to complete enrollment",
    ],
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Portal Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
            ONBOARDING COMMAND CENTER — {hireData?.portalId}
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginTop: 4 }}>Welcome, {hireData?.name?.split(" ")[0] || "New Hire"}!</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Badge variant={readyToWork ? "success" : "warning"}>
            {readyToWork ? "READY TO WORK ✓" : "SETUP IN PROGRESS"}
          </Badge>
          <button onClick={() => setChatOpen(!chatOpen)} style={{
            padding: "8px 14px", borderRadius: 10, border: "1px solid var(--accent)",
            background: chatOpen ? "var(--accent)" : "transparent",
            color: chatOpen ? "var(--bg)" : "var(--accent)",
            fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}>💬 Nova Chat</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: chatOpen ? "1fr 340px" : "1fr", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Phase Navigation */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[
              { id: "setup", label: "📱 Device Setup", done: identityStep >= 1 },
              { id: "identity", label: "🔐 Identity & MFA", done: mfaActive },
              { id: "reconcile", label: "🔍 Access Scan", done: allTicketsDone },
              { id: "training", label: "🎓 Training", done: trainingComplete },
              { id: "ready", label: "🤝 Ready to Work", done: readyToWork },
            ].map(p => (
              <TabButton key={p.id} active={portalPhase === p.id} onClick={() => setPortalPhase(p.id)}
                icon={p.done ? "✓" : undefined}>{p.label}</TabButton>
            ))}
          </div>

          {/* Device Setup */}
          {portalPhase === "setup" && (
            <Card>
              <SectionTitle sub={hireData?.platform}>{deviceGuide.title}</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {deviceGuide.steps.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{
                      minWidth: 28, height: 28, borderRadius: 8, background: "rgba(0,234,199,0.1)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700, color: "var(--accent)",
                    }}>{i + 1}</div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, paddingTop: 4 }}>{s}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16, padding: 12, borderRadius: 8, background: "rgba(255,183,77,0.08)", border: "1px solid rgba(255,183,77,0.15)", fontSize: 12, color: "#FFB74D" }}>
                💡 <strong>Predictive Tip:</strong> Most {hireData?.role || "developers"} get stuck on step {isMac ? 3 : 4}. If JAMF/Intune stalls, try restarting and reconnecting to Wi-Fi. Or ask Nova for help!
              </div>
            </Card>
          )}

          {/* Identity Management */}
          {portalPhase === "identity" && (
            <Card>
              <SectionTitle sub="ManageEngine ADSelfService Plus Integration">Identity & Security Setup</SectionTitle>
              <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                {identitySteps.map((s, i) => (
                  <div key={i} onClick={() => setIdentityStep(i)} style={{
                    flex: 1, padding: "8px 12px", borderRadius: 8, cursor: "pointer",
                    background: i === identityStep ? "rgba(0,234,199,0.1)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${i === identityStep ? "var(--accent)" : "var(--border)"}`,
                    textAlign: "center", transition: "all 0.2s",
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: i <= identityStep ? "var(--accent)" : "var(--text-muted)" }}>{s.title}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{s.sub}</div>
                  </div>
                ))}
              </div>
              {identitySteps[identityStep].content}
            </Card>
          )}

          {/* Reconciliation / Jira Tickets */}
          {portalPhase === "reconcile" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Card>
                <SectionTitle sub="Comparing Manager's checklist against your active access">Access Reconciliation Scan</SectionTitle>
                <ProgressBar value={tickets.filter(t => t.status === "Done").length} max={tickets.length} />
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                  {tickets.filter(t => t.status === "Done").length}/{tickets.length} access items resolved
                </div>
              </Card>
              {tickets.map(t => (
                <Card key={t.id} glow={t.status === "Escalated" ? "#EF5350" : t.status === "Done" ? "#66BB6A" : undefined}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 20 }}>{OPTIONAL_ACCESS.find(a => a.id === t.appId)?.icon || "📋"}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{t.app}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{t.id} · Opened {formatTime(new Date(t.createdAt))}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Badge variant={t.status === "Done" ? "success" : t.status === "Escalated" ? "danger" : t.status === "In Progress" ? "info" : "warning"}>
                        {t.status}
                      </Badge>
                      {t.status !== "Done" && (
                        <button onClick={() => setTickets(prev => prev.map(x => x.id === t.id ? { ...x, status: "Done" } : x))}
                          style={{
                            padding: "4px 10px", borderRadius: 6, border: "1px solid var(--border)",
                            background: "transparent", color: "var(--text-muted)", fontSize: 11,
                            cursor: "pointer", fontFamily: "inherit",
                          }}>Mark Done</button>
                      )}
                    </div>
                  </div>
                  {t.ghostAlert && (
                    <div style={{ marginTop: 8, padding: 8, borderRadius: 6, background: "rgba(239,83,80,0.08)", fontSize: 11, color: "#EF5350" }}>
                      👻 Ghost Alert: {t.ghostAlert}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}

          {/* Training */}
          {portalPhase === "training" && (
            <Card>
              <SectionTitle sub="KnowBe4 Security Awareness Training">Training & Compliance</SectionTitle>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                  <span style={{ color: "var(--text-muted)" }}>Overall Progress</span>
                  <span style={{ color: "var(--accent)", fontWeight: 700 }}>{trainingProgress}%</span>
                </div>
                <ProgressBar value={trainingProgress} color={trainingProgress >= 100 ? "#66BB6A" : "var(--accent)"} height={8} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {KNOWBE4_MODULES.map((m, i) => {
                  const moduleComplete = trainingProgress >= ((i + 1) / KNOWBE4_MODULES.length) * 100;
                  return (
                    <div key={m.id} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                      borderRadius: 10, background: moduleComplete ? "rgba(102,187,106,0.06)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${moduleComplete ? "rgba(102,187,106,0.2)" : "var(--border)"}`,
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: moduleComplete ? "#66BB6A" : "rgba(255,255,255,0.06)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, color: moduleComplete ? "#fff" : "var(--text-muted)",
                      }}>{moduleComplete ? "✓" : "○"}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{m.duration} · {m.required ? "Required" : "Optional"}</div>
                      </div>
                      {!moduleComplete && (
                        <button onClick={() => setTrainingProgress(p => Math.min(100, p + 20))} style={{
                          padding: "6px 12px", borderRadius: 6, border: "none",
                          background: "var(--accent)", color: "var(--bg)", fontSize: 11,
                          fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                        }}>Start</button>
                      )}
                    </div>
                  );
                })}
              </div>
              {trainingProgress < 100 && (
                <div style={{
                  marginTop: 14, padding: 12, borderRadius: 8,
                  background: "rgba(255,183,77,0.08)", border: "1px solid rgba(255,183,77,0.15)",
                  fontSize: 12, color: "#FFB74D",
                }}>
                  👻 Don't let the 100-ticket ghost get your security credentials! Complete your training to unlock full access.
                </div>
              )}
            </Card>
          )}

          {/* Ready to Work */}
          {portalPhase === "ready" && (
            <Card glow={readyToWork ? "#66BB6A" : undefined} style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>{readyToWork ? "🤝" : "⏳"}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
                {readyToWork ? "You're Ready to Work!" : "Almost There..."}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
                {readyToWork
                  ? "All systems green. Your portal will self-deactivate in 72 hours."
                  : "Complete the remaining items to activate your 'Ready to Work' handshake."
                }
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
                {[
                  { label: "Jira Tickets", done: allTicketsDone, sub: `${tickets.filter(t => t.status === "Done").length}/${tickets.length}` },
                  { label: "KnowBe4", done: trainingComplete, sub: `${trainingProgress}%` },
                  { label: "MFA Active", done: mfaActive, sub: mfaActive ? "Verified" : "Pending" },
                ].map(c => (
                  <div key={c.label} style={{
                    padding: "14px 20px", borderRadius: 12, minWidth: 100,
                    background: c.done ? "rgba(102,187,106,0.08)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${c.done ? "rgba(102,187,106,0.3)" : "var(--border)"}`,
                  }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{c.done ? "✅" : "⬜"}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{c.label}</div>
                    <div style={{ fontSize: 11, color: c.done ? "#66BB6A" : "var(--text-muted)" }}>{c.sub}</div>
                  </div>
                ))}
              </div>
              {readyToWork && (
                <button style={{
                  marginTop: 20, padding: "12px 32px", borderRadius: 12, border: "none",
                  background: "linear-gradient(135deg, #66BB6A, #00EAC7)",
                  color: "#0A0F1C", fontSize: 14, fontWeight: 800, cursor: "pointer",
                  fontFamily: "inherit", letterSpacing: 0.5,
                }}>🤝 Complete Handshake</button>
              )}
            </Card>
          )}
        </div>

        {/* Chat Sidebar */}
        {chatOpen && (
          <Card style={{ display: "flex", flexDirection: "column", height: 500, padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <PulseRing /> Nova — AI Onboarding Buddy
            </div>
            <NovaChat hireData={hireData} tickets={tickets} trainingStatus={trainingProgress} />
          </Card>
        )}
      </div>
    </div>
  );
}

// SYSADMIN / OPS DASHBOARD
function SysAdminDashboard({ tickets, setTickets, hireData }) {
  const ghostTickets = tickets.filter(t => t.status !== "Done" && t.escalated);
  const openTickets = tickets.filter(t => t.status !== "Done");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "Total Tickets", value: tickets.length, color: "var(--accent)" },
          { label: "Open", value: openTickets.length, color: "#42A5F5" },
          { label: "Ghost Alerts", value: ghostTickets.length, color: "#EF5350" },
          { label: "Resolved", value: tickets.filter(t => t.status === "Done").length, color: "#66BB6A" },
        ].map(s => (
          <Card key={s.label} style={{ textAlign: "center", padding: 16 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", marginTop: 2 }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Ghost Alert Banner */}
      {ghostTickets.length > 0 && (
        <Card glow="#EF5350" style={{ display: "flex", alignItems: "center", gap: 14, padding: 16 }}>
          <span style={{ fontSize: 32 }}>👻</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#EF5350" }}>Ghost Prevention Protocol Active</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
              {ghostTickets.length} ticket(s) have been auto-escalated due to inactivity. SysAdmin on-call has been pinged.
            </div>
          </div>
        </Card>
      )}

      {/* Run Trace / Ticket Feed */}
      <SectionTitle sub="All provisioning tickets for this onboarding cycle">Ticket Queue — {hireData?.name || "New Hire"}</SectionTitle>
      {tickets.map(t => (
        <Card key={t.id} style={{ padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>{OPTIONAL_ACCESS.find(a => a.id === t.appId)?.icon || "📋"}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>
                  {t.id}: Provision {t.app}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  Priority: New Hire - Day 1 Access · Tag: access-gap · Source: Manager Checklist
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {t.status !== "Done" && (
                <>
                  <button onClick={() => setTickets(prev => prev.map(x => x.id === t.id ? { ...x, status: "In Progress" } : x))}
                    style={{
                      padding: "5px 10px", borderRadius: 6, border: "1px solid var(--border)",
                      background: "transparent", color: "var(--text-muted)", fontSize: 11,
                      cursor: "pointer", fontFamily: "inherit",
                    }}>Assign</button>
                  <button onClick={() => setTickets(prev => prev.map(x => x.id === t.id ? { ...x, status: "Done" } : x))}
                    style={{
                      padding: "5px 10px", borderRadius: 6, border: "none",
                      background: "#66BB6A", color: "#fff", fontSize: 11, fontWeight: 700,
                      cursor: "pointer", fontFamily: "inherit",
                    }}>Resolve</button>
                </>
              )}
              <Badge variant={t.status === "Done" ? "success" : t.status === "Escalated" ? "danger" : t.status === "In Progress" ? "info" : "warning"}>
                {t.status}
              </Badge>
            </div>
          </div>
          {t.ghostAlert && (
            <div style={{ marginTop: 8, padding: 6, borderRadius: 6, background: "rgba(239,83,80,0.06)", fontSize: 11, color: "#EF5350" }}>
              👻 {t.ghostAlert}
            </div>
          )}
        </Card>
      ))}

      {/* Run Trace Log */}
      <Card style={{ padding: 14 }}>
        <SectionTitle sub="Audit trail for all agent actions">Run Trace Log</SectionTitle>
        <div style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.8, maxHeight: 200, overflowY: "auto" }}>
          {tickets.map((t, i) => (
            <div key={i}>[{formatTime(new Date(t.createdAt))}] SCAN → {t.app} not provisioned → Created {t.id} → Priority: High → Queue: SysAdmin</div>
          ))}
          <div>[{formatTime(new Date())}] GHOST_MONITOR → Scanning for stale tickets (threshold: {GHOST_THRESHOLDS.critical}h)</div>
          <div>[{formatTime(new Date())}] RECONCILE → Checklist vs System State audit complete</div>
        </div>
      </Card>
    </div>
  );
}

// ─── MAIN APPLICATION ─────────────────────────────────────────────────
export default function NovaPulse() {
  const [view, setView] = useState("manager"); // manager | hr | hire | admin
  const [hireData, setHireData] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [portalGenerated, setPortalGenerated] = useState(false);

  const handleSubmit = (data) => {
    setHireData(data);
    // Generate Jira tickets for optional access that needs provisioning
    const newTickets = data.optionalAccess.map(id => {
      const app = OPTIONAL_ACCESS.find(a => a.id === id);
      return {
        id: generateJiraId(),
        appId: id,
        app: app?.name || id,
        status: "Open",
        createdAt: Date.now(),
        escalated: false,
        ghostAlert: null,
      };
    });
    setTickets(newTickets);
    setPortalGenerated(true);
    setView("hire");
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)", color: "var(--text)",
      fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=JetBrains+Mono:wght@400;600&display=swap');
        :root {
          --bg: #0A0F1C;
          --card-bg: #111827;
          --border: #1E293B;
          --accent: #00EAC7;
          --accent2: #6366F1;
          --text: #F1F5F9;
          --text-secondary: #CBD5E1;
          --text-muted: #64748B;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes pulse-ring {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(2.5); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
        ::selection { background: var(--accent); color: var(--bg); }
        input::placeholder, textarea::placeholder { color: var(--text-muted); }
      `}</style>

      {/* Top Navigation Bar */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(10,15,28,0.85)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border)", padding: "12px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: "linear-gradient(135deg, var(--accent), var(--accent2))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 800, color: "var(--bg)",
          }}>N</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", letterSpacing: -0.5 }}>
              Nova<span style={{ color: "var(--accent)" }}>-Pulse</span>
            </div>
            <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: 1, textTransform: "uppercase" }}>Onboarding & Ops Agent</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <TabButton active={view === "manager"} onClick={() => setView("manager")} icon="📋">Hiring Manager</TabButton>
          <TabButton active={view === "hr"} onClick={() => setView("hr")} icon="👥">HR Dashboard</TabButton>
          <TabButton active={view === "hire"} onClick={() => setView("hire")} icon="🚀">New Hire Portal</TabButton>
          <TabButton active={view === "admin"} onClick={() => setView("admin")} icon="⚙️">SysAdmin / Ops</TabButton>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {portalGenerated && <PulseRing />}
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {portalGenerated ? `Portal Active · ${hireData?.portalId}` : "No Active Portals"}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 24px 60px", animation: "fade-in 0.3s ease" }}>
        {view === "manager" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", letterSpacing: -0.5 }}>Onboarding Intake</h2>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Define the new hire's role, access requirements, and setup preferences. Nova will generate a personalized portal and auto-provision everything.</p>
            </div>
            <Card>
              <HiringManagerIntake onSubmit={handleSubmit} />
            </Card>
          </div>
        )}

        {view === "hr" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", letterSpacing: -0.5 }}>HR Approval Queue</h2>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Review and approve onboarding requests. High-risk access requires HITL sign-off.</p>
            </div>
            <HRDashboard hireData={hireData} onApprove={() => setView("hire")} />
          </div>
        )}

        {view === "hire" && (
          hireData ? (
            <NewHirePortal
              hireData={hireData}
              tickets={tickets}
              setTickets={setTickets}
              trainingProgress={trainingProgress}
              setTrainingProgress={setTrainingProgress}
            />
          ) : (
            <Card style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🚀</div>
              <div style={{ color: "var(--text-muted)", fontSize: 14 }}>No active portal yet. Start by creating an onboarding request from the Hiring Manager tab.</div>
            </Card>
          )
        )}

        {view === "admin" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", letterSpacing: -0.5 }}>SysAdmin Operations Center</h2>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Provisioning queue, ghost monitoring, and run traces. Resolve access gaps and keep onboarding zero-friction.</p>
            </div>
            <SysAdminDashboard tickets={tickets} setTickets={setTickets} hireData={hireData} />
          </div>
        )}
      </div>

      {/* System Architecture Diagram Modal (Easter Egg via bottom bar) */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "rgba(10,15,28,0.9)", backdropFilter: "blur(10px)",
        borderTop: "1px solid var(--border)", padding: "8px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        fontSize: 11, color: "var(--text-muted)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <PulseRing size={6} color="#66BB6A" />
          Nova-Pulse Agent v1.0 · All actions logged · IAM-secured
        </div>
        <div>
          Handshake Logic: Jira=Done ∧ KnowBe4=100% ∧ MFA=Active → Portal Sunset (72h)
        </div>
      </div>
    </div>
  );
}
