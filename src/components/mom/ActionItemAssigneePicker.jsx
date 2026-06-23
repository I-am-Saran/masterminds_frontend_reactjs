import React, { useMemo, useState } from "react";
import { UserRound } from "lucide-react";
import Modal from "../Modal";
import UserAutocomplete from "../UserAutocomplete";
import { THEME_COLORS } from "../../constants/colors";

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
          className="flex-1 min-w-0 text-left text-sm px-1 py-1 rounded hover:bg-neutral-100 transition-colors truncate text-neutral-700"
          title={value ? `${displayLabel} (${value})` : "Click to assign"}
        >
          <span className={!value ? "text-neutral-400 italic" : ""}>{displayLabel}</span>
        </button>
        <button
          type="button"
          onClick={openPicker}
          className="shrink-0 p-1.5 rounded-md border border-neutral-200 hover:bg-neutral-50 text-neutral-600 transition-colors"
          aria-label="Assign user"
          title="Assign user"
        >
          <UserRound size={14} style={{ color: THEME_COLORS.mediumTeal }} />
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
          <p className="text-sm text-neutral-600">
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
              className="text-xs text-neutral-500 hover:text-red-600 underline"
            >
              Clear assignee
            </button>
          ) : null}
        </div>
      </Modal>
    </>
  );
}
