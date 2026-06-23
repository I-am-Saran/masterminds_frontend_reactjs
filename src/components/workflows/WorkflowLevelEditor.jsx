import React, { useState } from "react";
import { ChevronDown, ChevronUp, GripVertical, Trash2 } from "lucide-react";
import { ASSIGNMENT_TYPES } from "../../constants/workflowConstants";
import WorkflowAssignmentSelector from "./WorkflowAssignmentSelector";
import { WfMetaItem, WfOptionChip, WfSelect } from "./WorkflowUI";

function CheckItem({ label, checked, onChange }) {
  return (
    <label className="wf-check-item">
      <input type="checkbox" checked={Boolean(checked)} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function assignmentTypeLabel(type) {
  return ASSIGNMENT_TYPES.find((t) => t.value === type)?.label || type || "—";
}

function formatAssignee(level) {
  const type = assignmentTypeLabel(level.assignment_type);
  const name = level.assignment_label || level.assignment_value;
  if (!name) return "Not assigned";
  return `${type} → ${name}`;
}

function formatSla(hours) {
  if (hours === "" || hours == null) return "No SLA";
  const n = Number(hours);
  if (Number.isNaN(n)) return "No SLA";
  return n === 1 ? "1 Hour" : `${n} Hours`;
}

export default function WorkflowLevelEditor({
  level,
  index,
  total,
  focused,
  onFocus,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  onDragStart,
  onDragOver,
  onDrop,
}) {
  const [expanded, setExpanded] = useState(index === 0);
  const patch = (fields) => onChange({ ...level, ...fields });

  const activeOptions = [
    level.mandatory_comments && "Comments Required",
    level.mandatory_attachments && "Attachments Required",
    level.can_reject && "Reject Allowed",
    level.can_reassign && "Reassign Allowed",
    level.allow_skip && "Skip Allowed",
  ].filter(Boolean);

  return (
    <div
      className={`wf-step-card${focused ? " wf-step-card--focused" : ""}`}
      draggable
      onDragStart={(e) => onDragStart?.(e, index)}
      onDragOver={(e) => { e.preventDefault(); onDragOver?.(e, index); }}
      onDrop={(e) => onDrop?.(e, index)}
      onMouseEnter={onFocus}
      onFocus={onFocus}
    >
      <div className="wf-step-header" onClick={() => setExpanded((v) => !v)}>
        <div className="wf-step-header-left">
          <GripVertical size={15} className="text-neutral-400 cursor-grab shrink-0" />
          <span className="wf-step-badge">Step {level.level_sequence}</span>
          <input
            className="wf-step-title-input"
            value={level.level_name}
            onChange={(e) => patch({ level_name: e.target.value })}
            onClick={(e) => e.stopPropagation()}
            placeholder="Step name"
          />
        </div>
        <div className="wf-step-toolbar" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="wf-step-tool" disabled={index === 0} onClick={onMoveUp} aria-label="Move up">
            <ChevronUp size={16} />
          </button>
          <button type="button" className="wf-step-tool" disabled={index >= total - 1} onClick={onMoveDown} aria-label="Move down">
            <ChevronDown size={16} />
          </button>
          <button type="button" className="wf-step-tool wf-step-tool--danger" onClick={onRemove} aria-label="Remove step">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="wf-step-summary">
        <WfMetaItem label="Assigned to" value={formatAssignee(level)} />
        <WfMetaItem label="SLA" value={formatSla(level.sla_hours)} />
        <WfMetaItem
          label="Escalation"
          value={
            level.escalation_enabled
              ? `${assignmentTypeLabel(level.escalation_type)} → ${level.escalation_label || level.escalation_value || "—"}`
              : "Disabled"
          }
        />
        <WfMetaItem label="Permissions" value={activeOptions.length ? `${activeOptions.length} enabled` : "Default"} />
      </div>

      {activeOptions.length > 0 && (
        <div className="wf-step-options">
          {level.mandatory_comments && <WfOptionChip active>Comments Required</WfOptionChip>}
          {level.mandatory_attachments && <WfOptionChip active>Attachments Required</WfOptionChip>}
          {level.can_reject && <WfOptionChip active>Reject Allowed</WfOptionChip>}
          {level.can_reassign && <WfOptionChip active>Reassign Allowed</WfOptionChip>}
          {level.allow_skip && <WfOptionChip active>Skip Allowed</WfOptionChip>}
        </div>
      )}

      <div className="wf-step-config">
        <button type="button" className="wf-step-config-toggle" onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Hide configuration" : "Configure step"}
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {expanded && (
          <div className="wf-step-config-body">
            <div className="wf-config-block">
              <div className="wf-config-block-title">Assignment</div>
              <div className="wf-config-grid">
                <div>
                  <label className="wf-field-label">Type</label>
                  <WfSelect
                    value={level.assignment_type}
                    onChange={(e) => patch({ assignment_type: e.target.value, assignment_value: "", assignment_label: "" })}
                  >
                    {ASSIGNMENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </WfSelect>
                </div>
                <WorkflowAssignmentSelector
                  assignmentType={level.assignment_type}
                  value={level.assignment_value}
                  displayLabel={level.assignment_label}
                  onChange={(v, lbl) => patch({ assignment_value: v, assignment_label: lbl })}
                  label="Assignee"
                />
              </div>
            </div>

            <div className="wf-config-block">
              <div className="wf-config-block-title">SLA & escalation</div>
              <div className="wf-config-grid">
                <div>
                  <label className="wf-field-label">SLA (hours)</label>
                  <input
                    type="number"
                    min="0"
                    className="wf-input"
                    value={level.sla_hours}
                    onChange={(e) => patch({ sla_hours: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div className="flex items-end">
                  <CheckItem
                    label="Enable escalation"
                    checked={level.escalation_enabled}
                    onChange={(v) => patch({ escalation_enabled: v })}
                  />
                </div>
              </div>
              {level.escalation_enabled && (
                <div className="wf-config-grid mt-3">
                  <div>
                    <label className="wf-field-label">Escalation type</label>
                    <WfSelect
                      value={level.escalation_type || "TEAM"}
                      onChange={(e) => patch({ escalation_type: e.target.value, escalation_value: "", escalation_label: "" })}
                    >
                      {ASSIGNMENT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </WfSelect>
                  </div>
                  <WorkflowAssignmentSelector
                    assignmentType={level.escalation_type || "TEAM"}
                    value={level.escalation_value}
                    displayLabel={level.escalation_label}
                    onChange={(v, lbl) => patch({ escalation_value: v, escalation_label: lbl })}
                    label="Escalation assignee"
                  />
                </div>
              )}
            </div>

            <div className="wf-config-block">
              <div className="wf-config-block-title">Step options</div>
              <div className="wf-check-grid">
                <CheckItem label="Mandatory comments" checked={level.mandatory_comments} onChange={(v) => patch({ mandatory_comments: v })} />
                <CheckItem label="Mandatory attachments" checked={level.mandatory_attachments} onChange={(v) => patch({ mandatory_attachments: v })} />
                <CheckItem label="Can reject" checked={level.can_reject} onChange={(v) => patch({ can_reject: v })} />
                <CheckItem label="Can reassign" checked={level.can_reassign} onChange={(v) => patch({ can_reassign: v })} />
                <CheckItem label="Allow skip" checked={level.allow_skip} onChange={(v) => patch({ allow_skip: v })} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
