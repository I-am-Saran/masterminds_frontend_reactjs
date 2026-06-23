import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Link2, Plus } from "lucide-react";
import { TICKET_CATEGORIES } from "../../constants/workflowConstants";
import { useWorkflowMappings } from "../../hooks/useWorkflows";
import { WfBrandButton, WfSection } from "./WorkflowUI";

export default function WorkflowMappingSection({ workflowId, mappedCategoriesText }) {
  const navigate = useNavigate();
  const { data: mappings = [] } = useWorkflowMappings();

  const mappedForWorkflow = useMemo(() => {
    if (!workflowId) return [];
    return mappings.filter((m) => m.workflow_id === workflowId).map((m) => m.ticket_category);
  }, [mappings, workflowId]);

  const categories = mappedForWorkflow.length
    ? mappedForWorkflow
    : (mappedCategoriesText || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

  const unmapped = TICKET_CATEGORIES.filter((c) => !categories.includes(c));

  return (
    <WfSection
      title="Workflow mapping"
      subtitle="Link ticket categories to this workflow — one workflow can power many categories"
      action={
        <WfBrandButton
          type="button"
          size="sm"
          icon={Plus}
          onClick={() => navigate("/workflows/definitions#category-mappings")}
        >
          Manage mappings
        </WfBrandButton>
      }
    >
      {categories.length ? (
        <div className="wf-category-map">
          <p className="wf-category-map-label">Mapped categories</p>
          <div className="wf-category-chips">
            {categories.map((cat) => (
              <span key={cat} className="wf-category-chip wf-category-chip--mapped">
                {cat}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="wf-mapping-empty">
          <Link2 size={20} className="wf-mapping-empty-icon" />
          <p>No categories mapped yet.</p>
          <Link to="/workflows/definitions#category-mappings" className="wf-mapping-link">
            Manage category mappings
          </Link>
        </div>
      )}

      {unmapped.length > 0 && categories.length > 0 && (
        <div className="wf-category-map wf-category-map--secondary">
          <p className="wf-category-map-label">Available to map</p>
          <div className="wf-category-chips">
            {unmapped.slice(0, 6).map((cat) => (
              <span key={cat} className="wf-category-chip">
                {cat}
              </span>
            ))}
            {unmapped.length > 6 && (
              <span className="wf-category-chip wf-category-chip--more">
                +{unmapped.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}
    </WfSection>
  );
}
