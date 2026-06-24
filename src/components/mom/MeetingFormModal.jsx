import React, { useEffect, useMemo, useState } from "react";
import Modal from "../Modal";
import UserAutocomplete from "../UserAutocomplete";
import { useSession } from "../../contexts/SessionContext";
import { MEETING_TYPE_OPTIONS, MEETING_TYPES } from "../../constants/meetingTypes";
import CustomSelect from "../ui/Select";

const EMPTY = {
  title: "",
  meeting_type: "",
  meeting_date: new Date().toISOString().slice(0, 10),
  start_time: "",
  end_time: "",
  organizer: "",
  client_email: "",
  participants: [],
  notes: "",
  status: "OPEN",
};

const LOCKED_INPUT_CLASS =
  "w-full border rounded-lg px-3 py-2 text-sm bg-[color:var(--surface-secondary,var(--kz-surface-secondary))] text-[color:var(--text-secondary,var(--kz-text-secondary))] border-[color:var(--border-color,var(--kz-border))] cursor-not-allowed";
const INPUT_CLASS =
  "w-full border rounded-lg px-3 py-2 text-sm bg-[color:var(--input-bg,var(--kz-input-bg))] text-[color:var(--text-primary,var(--kz-text-primary))] border-[color:var(--border-color,var(--kz-border))] focus:outline-none focus:ring-2 focus:ring-[color:var(--kz-focus-ring)]";
const LABEL_CLASS = "block text-sm font-medium mb-1 text-[color:var(--text-secondary,var(--kz-text-secondary))]";

export default function MeetingFormModal({ open, onClose, onSubmit, initial = null, saving = false }) {
  const { session } = useSession();
  const [form, setForm] = useState(EMPTY);
  const isEdit = Boolean(initial?.id);

  useEffect(() => {
    if (!open) return;
    setForm({
      ...EMPTY,
      ...(initial || {}),
      meeting_date: initial?.meeting_date?.slice?.(0, 10) || initial?.meeting_date || EMPTY.meeting_date,
      start_time: initial?.start_time?.slice?.(11, 16) || "",
      end_time: initial?.end_time?.slice?.(11, 16) || "",
      participants: Array.isArray(initial?.participants)
        ? initial.participants
        : typeof initial?.participants === "string" && initial.participants
          ? initial.participants.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      organizer: initial?.organizer || session?.user?.email || session?.user?.full_name || "",
      client_email: initial?.client_email || "",
    });
  }, [open, initial, session]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const meetingTypeOptions = useMemo(() => {
    const current = form.meeting_type?.trim();
    if (current && !MEETING_TYPES.includes(current)) {
      return [{ value: current, label: current }, ...MEETING_TYPE_OPTIONS];
    }
    return MEETING_TYPE_OPTIONS;
  }, [form.meeting_type]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    if (isEdit) {
      onSubmit({
        status: form.status,
        organizer: form.organizer,
        client_email: form.client_email?.trim() || null,
        participants: Array.isArray(form.participants) ? form.participants : [],
        notes: form.notes,
      });
      return;
    }

    onSubmit({
      ...form,
      title: form.title.trim(),
      client_email: form.client_email?.trim() || null,
      participants: Array.isArray(form.participants) ? form.participants : [],
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? "Edit Meeting" : "New Meeting"}
      onConfirm={handleSubmit}
      confirmText={saving ? "Saving..." : initial ? "Update" : "Create"}
      confirmDisabled={saving || !form.title.trim()}
      maxWidth="640px"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className={LABEL_CLASS}>Title *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className={isEdit ? LOCKED_INPUT_CLASS : INPUT_CLASS}
            readOnly={isEdit}
            disabled={isEdit}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL_CLASS}>Meeting type</label>
            <CustomSelect
              value={form.meeting_type}
              onChange={(e) => set("meeting_type", e.target.value)}
              className={isEdit ? LOCKED_INPUT_CLASS : ""}
              disabled={isEdit}
              placeholder="Select meeting type…"
              options={[
                { value: "", label: "Select meeting type…" },
                ...meetingTypeOptions.map((opt) => ({ value: opt.value, label: opt.label })),
              ]}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Status</label>
            <CustomSelect
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              options={[
                { value: "OPEN", label: "Open" },
                { value: "CLOSED", label: "Closed" },
              ]}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={LABEL_CLASS}>Date *</label>
            <input
              type="date"
              value={form.meeting_date}
              onChange={(e) => set("meeting_date", e.target.value)}
              className={isEdit ? LOCKED_INPUT_CLASS : INPUT_CLASS}
              readOnly={isEdit}
              disabled={isEdit}
              required
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Start</label>
            <input
              type="time"
              value={form.start_time}
              onChange={(e) => set("start_time", e.target.value)}
              className={isEdit ? LOCKED_INPUT_CLASS : INPUT_CLASS}
              readOnly={isEdit}
              disabled={isEdit}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>End</label>
            <input
              type="time"
              value={form.end_time}
              onChange={(e) => set("end_time", e.target.value)}
              className={isEdit ? LOCKED_INPUT_CLASS : INPUT_CLASS}
              readOnly={isEdit}
              disabled={isEdit}
            />
          </div>
        </div>
        <div>
          <UserAutocomplete
            label="Organizer"
            value={form.organizer}
            onChange={(val) => set("organizer", val)}
            placeholder="Search by email..."
            fieldType="assignee"
          />
        </div>
        <div>
          <UserAutocomplete
            label="Client email"
            value={form.client_email}
            onChange={(val) => set("client_email", val)}
            placeholder="Search by email..."
            fieldType="assignee"
          />
        </div>
        <div>
          <UserAutocomplete
            label="Participants"
            value={form.participants}
            onChange={(val) => set("participants", Array.isArray(val) ? val : [])}
            placeholder="Search by email..."
            multiple
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={3}
            className={`${INPUT_CLASS} resize-y`}
          />
        </div>
      </form>
    </Modal>
  );
}
