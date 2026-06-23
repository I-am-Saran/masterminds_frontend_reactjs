import React, { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { emptyLevel } from "../../constants/workflowConstants";
import WorkflowFlowDiagram from "./WorkflowFlowDiagram";
import WorkflowLevelEditor from "./WorkflowLevelEditor";
import { WfBrandButton, WfSection } from "./WorkflowUI";

function resequence(levels) {
  return levels.map((l, i) => ({ ...l, level_sequence: i + 1 }));
}

export default function WorkflowBuilder({ levels, onChange }) {
  const dragIndex = useRef(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const updateLevel = (index, next) => {
    const copy = [...levels];
    copy[index] = next;
    onChange(copy);
  };

  const addLevel = () => {
    const next = [...levels, emptyLevel(levels.length + 1)];
    onChange(next);
    setFocusedIndex(next.length - 1);
  };

  const removeLevel = (index) => {
    onChange(resequence(levels.filter((_, i) => i !== index)));
    setFocusedIndex(Math.max(0, index - 1));
  };

  const move = (from, to) => {
    if (to < 0 || to >= levels.length) return;
    const copy = [...levels];
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    onChange(resequence(copy));
    setFocusedIndex(to);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (dragIndex.current == null || dragIndex.current === dropIndex) return;
    move(dragIndex.current, dropIndex);
    dragIndex.current = null;
    setDragOverIndex(null);
  };

  return (
    <>
      <WfSection
        title="Workflow designer"
        subtitle="Visual approval path — Open through Closed"
      >
        <WorkflowFlowDiagram levels={levels} activeIndex={focusedIndex} />
      </WfSection>

      <WfSection
        title="Workflow steps"
        subtitle="Configure assignment, SLA, escalation, and permissions per step"
        action={
          <WfBrandButton type="button" size="sm" icon={Plus} onClick={addLevel}>
            Add step
          </WfBrandButton>
        }
      >
        <div className="wf-steps-list">
          {levels.map((level, index) => (
            <div
              key={level.clientId || level.id || index}
              className={dragOverIndex === index ? "ring-2 ring-[color:var(--kz-accent-vibrant)] rounded-lg" : ""}
            >
              <WorkflowLevelEditor
                level={level}
                index={index}
                total={levels.length}
                focused={focusedIndex === index}
                onFocus={() => setFocusedIndex(index)}
                onChange={(next) => updateLevel(index, next)}
                onRemove={() => removeLevel(index)}
                onMoveUp={() => move(index, index - 1)}
                onMoveDown={() => move(index, index + 1)}
                onDragStart={(_, i) => { dragIndex.current = i; }}
                onDragOver={(_, i) => setDragOverIndex(i)}
                onDrop={handleDrop}
              />
            </div>
          ))}
          {levels.length === 0 && (
            <div className="wf-empty-steps">
              No steps yet. Add at least one approval step to define your workflow.
            </div>
          )}
        </div>
      </WfSection>
    </>
  );
}
