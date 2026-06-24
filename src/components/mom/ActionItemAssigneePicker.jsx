import React, { useMemo, useState } from "react";
import { UserRound } from "lucide-react";
import Modal from "../Modal";
import UserAutocomplete from "../UserAutocomplete";

function formatAssigneeLabel(email, nameByEmail) {
  if (!email) return "Unassigned";
  const key = String(email).toLowerCase();
  const name = nameByEmail?.[key];
  if (name) return name;
  const local = String(email).split("@")[0];
  return local || email;
}

export default function ActionItemAssigneePicker({
  value = "",
  onChange,
  disabled = false,
  actionTitle = "",
  nameByEmail = {},
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const displayLabel = useMemo(
    () => formatAssigneeLabel(value, nameByEmail),
    [value, nameByEmail]
  );

  const openPicker = (e) => {
    e?.stopPropagation?.();
    if (disabled) return;
    setDraft(value || "");
    setSelectedUser(null);
    setOpen(true);
  };

  const handleConfirm = () => {
    onChange?.(draft?.trim() || "", selectedUser);
    setOpen(false);
  };

  const handleClose = () => {
    setDraft(value || "");
    setSelectedUser(null);
    setOpen(false);
  };

  if (disabled) {
    return (
      <span className="text-sm px-1 truncate block" title={value || "Unassigned"}>
        {displayLabel}
      </span>
    );
  }

  return (
    <>
      <div className="flex items-center gap-1 min-w-0 w-full">
        <button
          type="button"
          onClick={openPicker}
          className="flex-1 min-w-0 text-left text-sm px-1 py-1 rounded transition-colors truncate text-[color:var(--text-secondary,var(--kz-text-secondary))] hover:bg-[color:var(--surface-hover,var(--kz-hover-bg))]"
          title={value ? `${displayLabel} (${value})` : "Click to assign"}
        >
          <span className={!value ? "text-[color:var(--text-muted,var(--kz-placeholder))] italic" : ""}>{displayLabel}</span>
        </button>
        <button
          type="button"
          onClick={openPicker}
          className="shrink-0 p-1.5 rounded-md border transition-colors border-[color:var(--border-color,var(--kz-border))] hover:bg-[color:var(--surface-hover,var(--kz-hover-bg))] text-[color:var(--text-secondary,var(--kz-text-secondary))]"
          aria-label="Assign user"
          title="Assign user"
        >
          <UserRound size={14} style={{ color: "var(--accent-color, var(--kz-accent-vibrant))" }} />
        </button>
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        title="Assign action item"
        infoText={actionTitle ? `“${actionTitle.slice(0, 80)}${actionTitle.length > 80 ? "…" : ""}”` : undefined}
        onConfirm={handleConfirm}
        confirmText="Apply"
        maxWidth="480px"
      >
        <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
          <p className="text-sm text-[color:var(--text-secondary,var(--kz-text-secondary))]">
            Type an email or pick someone from the list, then click Apply.
          </p>
          <UserAutocomplete
            label="Assignee email"
            value={draft}
            onChange={(email, user) => {
              setDraft(email || "");
              setSelectedUser(user || null);
            }}
            placeholder="name@company.com"
            fieldType="assignee"
            showOnFocus
          />
          {draft ? (
            <button
              type="button"
              onClick={() => {
                setDraft("");
                setSelectedUser(null);
              }}
              className="text-xs underline text-[color:var(--text-muted,var(--kz-placeholder))] hover:text-[color:var(--danger-color,var(--kz-alert))]"
            >
              Clear assignee
            </button>
          ) : null}
        </div>
      </Modal>
    </>
  );
}
