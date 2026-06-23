import React, { useEffect, useState } from "react";
import { listRolesOptions, listTeamsOptions } from "../../services/workflowsApi";
import { useSession } from "../../contexts/SessionContext";
import UserAutocomplete from "../UserAutocomplete";
import CustomSelect from "../ui/Select";
import { WfFieldLabel } from "./WorkflowUI";

export default function WorkflowAssignmentSelector({
  assignmentType,
  value,
  displayLabel = "",
  onChange,
  label = "Assignee",
  disabled = false,
}) {
  const { session } = useSession();
  const tenantId = session?.tenant_id || "00000000-0000-0000-0000-000000000001";
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userSearchDisplay, setUserSearchDisplay] = useState("");

  const type = (assignmentType || "").toUpperCase();
  const isUser = type === "USER";

  useEffect(() => {
    if (isUser) {
      setUserSearchDisplay(value ? displayLabel || "" : "");
      return;
    }

    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        let rows = [];
        if (type === "TEAM") {
          const res = await listTeamsOptions();
          rows = (res?.data || []).map((t) => ({ id: t.id, label: t.name }));
        } else if (type === "ROLE") {
          const res = await listRolesOptions(tenantId);
          rows = (res?.data || []).map((r) => ({ id: r.id, label: r.role_name }));
        }
        if (mounted) setOptions(rows);
      } catch {
        if (mounted) setOptions([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [assignmentType, tenantId, isUser, value, displayLabel]);

  const handleSelectChange = (e) => {
    const next = e.target.value;
    const optLabel = options.find((o) => o.id === next)?.label || "";
    onChange(next, optLabel);
  };

  const handleUserSelect = (email, user) => {
    if (user?.id) {
      const lbl = user.full_name || user.name || email;
      setUserSearchDisplay(email);
      onChange(user.id, lbl);
      return;
    }
    setUserSearchDisplay("");
    onChange("", "");
  };

  if (isUser) {
    return (
      <div className="wf-assignment-user-search">
        {label && <WfFieldLabel>{label}</WfFieldLabel>}
        <UserAutocomplete
          value={userSearchDisplay}
          onChange={handleUserSelect}
          placeholder="Search users by email..."
          selectionOnly
          disabled={disabled}
          fieldType="assignee"
        />
      </div>
    );
  }

  return (
    <div>
      {label && <WfFieldLabel>{label}</WfFieldLabel>}
      <CustomSelect
        className="wf-input wf-select"
        value={value || ""}
        disabled={disabled || loading}
        onChange={handleSelectChange}
        placeholder={loading ? "Loading…" : `Select ${(assignmentType || "").toLowerCase()}`}
        options={[
          { value: "", label: loading ? "Loading…" : `Select ${(assignmentType || "").toLowerCase()}` },
          ...options.map((o) => ({ value: o.id, label: o.label })),
        ]}
      />
    </div>
  );
}
