import React from "react";
import { CircleDot, Flag, Play } from "lucide-react";

export default function WorkflowFlowDiagram({ levels = [], activeIndex = null, compact = false }) {
  const hasSteps = levels.length > 0;

  return (
    <div className={`wf-flow-diagram${compact ? " wf-flow-diagram--compact" : ""}`}>
      <div className="wf-flow-node wf-flow-node--start">
        <span className="wf-flow-node-icon">
          <Play size={14} strokeWidth={2.5} />
        </span>
        <span className="wf-flow-node-label">Open</span>
      </div>

      <div className="wf-flow-connector" aria-hidden />

      {hasSteps ? (
        levels.map((level, idx) => (
          <React.Fragment key={level.clientId || level.id || idx}>
            <div
              className={`wf-flow-node wf-flow-node--step${
                activeIndex === idx ? " wf-flow-node--active" : ""
              }`}
            >
              <span className="wf-flow-node-seq">{idx + 1}</span>
              <span className="wf-flow-node-label" title={level.level_name}>
                {level.level_name || `Step ${idx + 1}`}
              </span>
            </div>
            <div className="wf-flow-connector" aria-hidden />
          </React.Fragment>
        ))
      ) : (
        <>
          <div className="wf-flow-node wf-flow-node--placeholder">
            <span className="wf-flow-node-icon">
              <CircleDot size={14} />
            </span>
            <span className="wf-flow-node-label">Add approval steps</span>
          </div>
          <div className="wf-flow-connector" aria-hidden />
        </>
      )}

      <div className="wf-flow-node wf-flow-node--end">
        <span className="wf-flow-node-icon">
          <Flag size={14} strokeWidth={2.5} />
        </span>
        <span className="wf-flow-node-label">Closed</span>
      </div>
    </div>
  );
}
