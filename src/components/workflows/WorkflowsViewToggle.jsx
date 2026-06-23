import React from "react";

export const WORKFLOW_VIEWS = {
  DEFINITIONS: "definitions",
  MAPPINGS: "mappings",
};

const OPTIONS = [
  { id: WORKFLOW_VIEWS.DEFINITIONS, label: "Workflow Definitions" },
  { id: WORKFLOW_VIEWS.MAPPINGS, label: "Category mappings" },
];

export default function WorkflowsViewToggle({ value, onChange }) {
  return (
    <nav className="wf-subnav" aria-label="Workflow views">
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          className={`wf-subnav-link${value === option.id ? " wf-subnav-link--active" : ""}`}
          aria-current={value === option.id ? "page" : undefined}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </nav>
  );
}
