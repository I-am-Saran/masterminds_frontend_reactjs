/** Static fallback — enterprise workflow dashboard (Master Minds theme). */
export default function LoginWorkflowIllustrationStatic() {
  const steps = ["CREATED", "ROUTED", "APPROVAL", "RESOLVED", "CLOSED"];

  return (
    <svg
      className="login-brand__illustration-svg"
      viewBox="20 16 520 308"
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Enterprise ticket workflow from creation through team routing, approvals, SLA tracking, and completion"
    >
        <defs>
          <filter id="mm-wf-shadow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#2C2C2C" floodOpacity="0.07" />
          </filter>
        </defs>

        <rect x="40" y="36" width="140" height="11" rx="5.5" fill="#D7FF31" opacity="0.9" />
        <rect x="40" y="54" width="220" height="7" rx="3.5" fill="rgba(44,44,44,0.09)" />
        <rect x="40" y="68" width="160" height="6" rx="3" fill="rgba(44,44,44,0.06)" />

        <rect x="408" y="38" width="112" height="30" rx="10" fill="rgba(215,255,49,0.2)" stroke="rgba(215,255,49,0.45)" />
        <text x="464" y="57" textAnchor="middle" fill="#1A1A1A" fontSize="10" fontWeight="700" fontFamily="Inter, system-ui, sans-serif">
          SLA 4h
        </text>

        <path d="M72 118 H488" stroke="rgba(44,44,44,0.08)" strokeWidth="2" strokeLinecap="round" />
        {steps.map((label, i) => {
          const x = 72 + i * 104;
          const active = i === 2;
          return (
            <g key={label}>
              <circle
                cx={x}
                cy={118}
                r={active ? 13 : 10}
                fill={active ? "#D7FF31" : "#ffffff"}
                stroke={active ? "#B8D628" : "rgba(44,44,44,0.14)"}
                strokeWidth="2"
              />
              {active && <circle cx={x} cy={118} r="4" fill="#1A1A1A" />}
              <text
                x={x}
                y={148}
                textAnchor="middle"
                fill={active ? "#1A1A1A" : "#757575"}
                fontSize="9"
                fontWeight="700"
                fontFamily="Inter, system-ui, sans-serif"
                letterSpacing="0.06em"
              >
                {label}
              </text>
            </g>
          );
        })}

        <rect x="40" y="172" width="168" height="96" rx="14" fill="rgba(255,255,255,0.9)" stroke="rgba(44,44,44,0.08)" />
        <text x="56" y="194" fill="#757575" fontSize="8" fontWeight="600" fontFamily="Inter, sans-serif" letterSpacing="0.06em">
          TEAM ROUTING
        </text>
        <rect x="56" y="204" width="88" height="8" rx="4" fill="rgba(215,255,49,0.35)" />
        <rect x="56" y="220" width="120" height="6" rx="3" fill="rgba(44,44,44,0.07)" />
        <rect x="56" y="234" width="96" height="6" rx="3" fill="rgba(44,44,44,0.05)" />
        <circle cx="178" cy="248" r="10" fill="rgba(215,255,49,0.35)" stroke="#D7FF31" strokeWidth="1.5" />

        <rect x="224" y="172" width="168" height="96" rx="14" fill="rgba(255,255,255,0.9)" stroke="rgba(44,44,44,0.08)" />
        <text x="240" y="194" fill="#757575" fontSize="8" fontWeight="600" fontFamily="Inter, sans-serif" letterSpacing="0.06em">
          APPROVAL LEVELS
        </text>
        {[0, 1, 2].map((row) => (
          <g key={row} transform={`translate(240, ${204 + row * 22})`}>
            <rect width="136" height="14" rx="7" fill={row === 1 ? "rgba(215,255,49,0.35)" : "rgba(44,44,44,0.05)"} stroke={row === 1 ? "rgba(215,255,49,0.5)" : "transparent"} />
            <circle cx="124" cy="7" r="4" fill={row <= 1 ? "#D7FF31" : "rgba(44,44,44,0.15)"} />
          </g>
        ))}

        <rect x="408" y="172" width="112" height="96" rx="14" fill="rgba(255,255,255,0.9)" stroke="rgba(44,44,44,0.08)" />
        <text x="424" y="194" fill="#757575" fontSize="8" fontWeight="600" fontFamily="Inter, sans-serif" letterSpacing="0.06em">
          STATUS
        </text>
        <rect x="424" y="206" width="80" height="22" rx="11" fill="rgba(215,255,49,0.28)" stroke="rgba(215,255,49,0.5)" />
        <text x="464" y="221" textAnchor="middle" fill="#1A1A1A" fontSize="9" fontWeight="700" fontFamily="Inter, sans-serif">
          IN PROGRESS
        </text>
        <rect x="424" y="238" width="88" height="5" rx="2.5" fill="rgba(44,44,44,0.08)" />
        <rect x="424" y="250" width="64" height="5" rx="2.5" fill="rgba(44,44,44,0.06)" />

        <rect x="40" y="284" width="480" height="28" rx="10" fill="rgba(44,44,44,0.04)" />
        <rect x="48" y="292" width="280" height="12" rx="6" fill="rgba(215,255,49,0.35)" />
        <text x="56" y="301" fill="#1A1A1A" fontSize="8" fontWeight="600" fontFamily="Inter, sans-serif">
          Workflow progress — audit trail synced
        </text>
      </svg>
  );
}
