import React from "react";

export default function WorkflowVisualization({ levels = [], mode = "builder", activeIndex = null }) {
  if (!levels.length) {
    return (
      <div className="wf-empty-steps">
        Add levels to preview the workflow path.
      </div>
    );
  }

  if (mode === "progress") {
    return (
      <div className="wf-timeline-rail">
        {levels.map((item, idx) => {
          const isActive = item.status === "IN_PROGRESS";
          const isDone = item.status === "COMPLETED" || item.status === "SKIPPED";
          return (
            <div key={item.level_id || idx} className="wf-timeline-step">
              <div
                className={`wf-timeline-node${isActive ? " wf-timeline-node--active" : ""}`}
                style={
                  isDone
                    ? { borderColor: "var(--kz-accent-vibrant)", background: "var(--kz-active-bg)" }
                    : undefined
                }
              >
                {isDone ? "✓" : idx + 1}
              </div>
              <span className="wf-timeline-label">{item.level_name || `Level ${idx + 1}`}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="wf-timeline-rail">
      {levels.map((level, idx) => (
        <div key={level.clientId || level.id || idx} className="wf-timeline-step">
          <div className={`wf-timeline-node${activeIndex === idx ? " wf-timeline-node--active" : ""}`}>
            {idx + 1}
          </div>
          <span className="wf-timeline-label" title={level.level_name}>
            {level.level_name || `Level ${idx + 1}`}
          </span>
        </div>
      ))}
    </div>
  );
}
