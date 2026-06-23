/** Animated enterprise workflow dashboard — CSS/SVG only, theme-aligned. */
export default function LoginWorkflowAnimatedIllustration() {
  const steps = [
    { x: 72, label: "CREATED" },
    { x: 176, label: "ROUTED" },
    { x: 280, label: "APPROVAL" },
    { x: 384, label: "RESOLVED" },
    { x: 488, label: "CLOSED" },
  ];

  return (
    <svg
      className="login-brand__illustration-svg"
      viewBox="20 16 520 308"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Animated enterprise ticket workflow showing creation, routing, approvals, SLA tracking, and completion"
    >
        <defs>
          <filter id="mm-wf-shadow-a" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#2C2C2C" floodOpacity="0.07" />
          </filter>
          <filter id="mm-wf-glow-a" x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#D7FF31" floodOpacity="0.5" />
          </filter>
          <filter id="mm-wf-card-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="12" stdDeviation="20" floodColor="#2C2C2C" floodOpacity="0.08" />
            <feDropShadow dx="0" dy="0" stdDeviation="16" floodColor="#D7FF31" floodOpacity="0.12" />
          </filter>
          <linearGradient id="mm-wf-card-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.96" />
            <stop offset="100%" stopColor="#f7faf0" stopOpacity="0.88" />
          </linearGradient>
        </defs>

        {/* Ambient floating orbs */}
        <circle className="login-wf__orb login-wf__orb--1" cx="80" cy="60" r="28" fill="rgba(215,255,49,0.12)" />
        <circle className="login-wf__orb login-wf__orb--2" cx="500" cy="90" r="20" fill="rgba(215,255,49,0.1)" />
        <circle className="login-wf__orb login-wf__orb--3" cx="460" cy="290" r="16" fill="rgba(184,214,40,0.14)" />

        {/* Dashboard card */}
        <rect
          className="login-wf__card"
          x="28"
          y="24"
          width="504"
          height="292"
          rx="20"
          fill="url(#mm-wf-card-bg)"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="1.5"
          filter="url(#mm-wf-card-glow)"
        />

        {/* Ticket header */}
        <g className="login-wf__ticket-header">
          <rect x="40" y="36" width="140" height="11" rx="5.5" fill="#D7FF31" opacity="0.9" />
          <rect x="40" y="54" width="220" height="7" rx="3.5" fill="rgba(44,44,44,0.09)" className="login-wf__shimmer" />
          <rect x="40" y="68" width="160" height="6" rx="3" fill="rgba(44,44,44,0.06)" />
        </g>

        {/* SLA indicator */}
        <g className="login-wf__sla login-wf__sla-badge">
          <rect x="408" y="38" width="112" height="30" rx="10" fill="rgba(215,255,49,0.2)" stroke="rgba(215,255,49,0.45)" />
          <text x="464" y="57" textAnchor="middle" fill="#1A1A1A" fontSize="10" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">
            SLA 4h
          </text>
          <circle cx="420" cy="50" r="4" fill="#D7FF31" className="login-wf__sla-dot" />
        </g>

        {/* Lifecycle spine */}
        <path
          className="login-wf__spine-bg"
          d="M72 118 H488"
          stroke="rgba(44,44,44,0.08)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          className="login-wf__spine-progress"
          d="M72 118 H488"
          stroke="rgba(215,255,49,0.35)"
          strokeWidth="2"
          strokeLinecap="round"
          pathLength="100"
        />
        <path
          className="login-wf__spine-pulse"
          d="M72 118 H488"
          stroke="#D7FF31"
          strokeWidth="3"
          strokeLinecap="round"
          pathLength="100"
        />
        <circle className="login-wf__spine-dot" cx="72" cy="118" r="5" fill="#D7FF31" filter="url(#mm-wf-glow-a)" />
        <circle className="login-wf__spine-dot-trail" cx="72" cy="118" r="9" fill="rgba(215,255,49,0.25)" />

        {steps.map((step, i) => (
          <g key={step.label} className={`login-wf__step login-wf__step--${i + 1}`}>
            <circle
              className="login-wf__step-pulse"
              cx={step.x}
              cy={118}
              r="18"
              fill="none"
              stroke="#D7FF31"
              strokeWidth="1.5"
            />
            <circle
              className="login-wf__step-ring"
              cx={step.x}
              cy={118}
              r="13"
              fill="#ffffff"
              stroke="rgba(44,44,44,0.14)"
              strokeWidth="2"
            />
            <circle
              className="login-wf__step-active"
              cx={step.x}
              cy={118}
              r="13"
              fill="#D7FF31"
              stroke="#B8D628"
              strokeWidth="2"
              filter="url(#mm-wf-glow-a)"
            />
            <circle className="login-wf__step-core" cx={step.x} cy={118} r="4" fill="#1A1A1A" />
            <text
              x={step.x}
              y={148}
              textAnchor="middle"
              className="login-wf__step-label"
              fill="#757575"
              fontSize="9"
              fontWeight="700"
              fontFamily="Inter, system-ui, sans-serif"
              letterSpacing="0.06em"
            >
              {step.label}
            </text>
          </g>
        ))}

        {/* Team routing panel */}
        <g className="login-wf__panel login-wf__panel--team login-wf__panel--enter-1">
          <rect x="40" y="172" width="168" height="96" rx="14" fill="rgba(255,255,255,0.9)" stroke="rgba(44,44,44,0.08)" />
          <text x="56" y="194" fill="#757575" fontSize="8" fontWeight="600" fontFamily="Inter, sans-serif" letterSpacing="0.06em">
            TEAM ROUTING
          </text>
          <rect x="56" y="204" width="88" height="8" rx="4" fill="rgba(44,44,44,0.06)" />
          <rect x="56" y="204" width="88" height="8" rx="4" fill="rgba(215,255,49,0.45)" className="login-wf__team-fill" />
          <rect x="56" y="220" width="120" height="6" rx="3" fill="rgba(44,44,44,0.07)" />
          <rect x="56" y="234" width="96" height="6" rx="3" fill="rgba(44,44,44,0.05)" />
          <circle cx="178" cy="248" r="10" fill="rgba(215,255,49,0.35)" stroke="#D7FF31" strokeWidth="1.5" className="login-wf__team-node" />
          <path d="M144 248 H168" stroke="#B8D628" strokeWidth="1.5" strokeLinecap="round" className="login-wf__team-link" />
        </g>

        {/* Approval levels panel */}
        <g className="login-wf__panel login-wf__panel--approval login-wf__panel--enter-2">
          <rect x="224" y="172" width="168" height="96" rx="14" fill="rgba(255,255,255,0.9)" stroke="rgba(44,44,44,0.08)" />
          <text x="240" y="194" fill="#757575" fontSize="8" fontWeight="600" fontFamily="Inter, sans-serif" letterSpacing="0.06em">
            APPROVAL LEVELS
          </text>
          {[0, 1, 2].map((row) => (
            <g key={row} transform={`translate(240, ${204 + row * 22})`} className={`login-wf__approval-row login-wf__approval-row--${row + 1}`}>
              <rect width="136" height="14" rx="7" fill="rgba(44,44,44,0.05)" />
              <rect width="136" height="14" rx="7" fill="rgba(215,255,49,0.4)" className="login-wf__approval-fill" />
              <circle cx="124" cy="7" r="4" fill="rgba(44,44,44,0.15)" className="login-wf__approval-dot-idle" />
              <circle cx="124" cy="7" r="4" fill="#D7FF31" className="login-wf__approval-dot-active" />
            </g>
          ))}
        </g>

        {/* Status panel */}
        <g className="login-wf__panel login-wf__panel--status login-wf__panel--enter-3">
          <rect x="408" y="172" width="112" height="96" rx="14" fill="rgba(255,255,255,0.9)" stroke="rgba(44,44,44,0.08)" />
          <text x="424" y="194" fill="#757575" fontSize="8" fontWeight="600" fontFamily="Inter, sans-serif" letterSpacing="0.06em">
            STATUS
          </text>
          <rect x="424" y="206" width="80" height="22" rx="11" fill="rgba(44,44,44,0.05)" stroke="rgba(44,44,44,0.08)" className="login-wf__status-bg" />
          <rect x="424" y="206" width="80" height="22" rx="11" fill="rgba(215,255,49,0.28)" stroke="rgba(215,255,49,0.5)" className="login-wf__status-active" />
          <text x="464" y="214" textAnchor="middle" fill="#757575" fontSize="7" fontWeight="700" fontFamily="Inter, sans-serif" className="login-wf__status-text login-wf__status-text--idle">
            QUEUED
          </text>
          <text x="464" y="214" textAnchor="middle" fill="#1A1A1A" fontSize="7" fontWeight="700" fontFamily="Inter, sans-serif" className="login-wf__status-text login-wf__status-text--routed">
            ROUTED
          </text>
          <text x="464" y="214" textAnchor="middle" fill="#1A1A1A" fontSize="7" fontWeight="700" fontFamily="Inter, sans-serif" className="login-wf__status-text login-wf__status-text--approval">
            IN APPROVAL
          </text>
          <text x="464" y="214" textAnchor="middle" fill="#1A1A1A" fontSize="7" fontWeight="700" fontFamily="Inter, sans-serif" className="login-wf__status-text login-wf__status-text--done">
            COMPLETED
          </text>
          <rect x="424" y="238" width="88" height="5" rx="2.5" fill="rgba(44,44,44,0.08)" />
          <rect x="424" y="250" width="64" height="5" rx="2.5" fill="rgba(44,44,44,0.06)" />
        </g>

        {/* Progress bar / audit trail */}
        <g className="login-wf__progress-bar">
          <defs>
            <clipPath id="mm-wf-progress-clip">
              <rect x="48" y="292" width="280" height="12" rx="6" />
            </clipPath>
          </defs>
          <rect x="40" y="284" width="480" height="28" rx="10" fill="rgba(44,44,44,0.04)" />
          <rect x="48" y="292" width="280" height="12" rx="6" fill="rgba(44,44,44,0.06)" />
          <rect x="48" y="292" width="280" height="12" rx="6" fill="rgba(215,255,49,0.38)" className="login-wf__progress-fill" />
          <g clipPath="url(#mm-wf-progress-clip)">
            <rect
              className="login-wf__progress-shimmer"
              x="48"
              y="292"
              width="64"
              height="12"
              rx="6"
              fill="rgba(215,255,49,0.72)"
            />
          </g>
          <text x="56" y="301" fill="#1A1A1A" fontSize="8" fontWeight="600" fontFamily="Inter, sans-serif" className="login-wf__progress-label">
            Workflow progress — audit trail synced
          </text>
        </g>
      </svg>
  );
}
