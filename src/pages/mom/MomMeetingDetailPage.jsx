import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Edit2 } from "lucide-react";
import { getMeeting, updateMeeting } from "../../services/momApi";
import { useToast } from "../../contexts/ToastContext";
import { usePermissions } from "../../hooks/usePermissions";
import { THEME_COLORS } from "../../constants/colors";
import { StatusChip } from "../../components/mom/MomChips";
import ActionItemsGrid from "../../components/mom/ActionItemsGrid";
import MeetingFormModal from "../../components/mom/MeetingFormModal";
import Loader from "../../components/Loader";

function MetaField({ label, children }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400 mb-0.5">{label}</dt>
      <dd className="text-sm text-neutral-800">{children || "—"}</dd>
    </div>
  );
}

export default function MomMeetingDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const focusActionId = searchParams.get("action");
  const { showToast } = useToast();
  const { hasPermission } = usePermissions();

  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMeeting(id);
      if (res.success) setMeeting(res.data);
      else showToast("Meeting not found", "error");
    } catch {
      showToast("Failed to load meeting", "error");
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => { load(); }, [load]);

  const handleUpdate = async (payload) => {
    setSaving(true);
    try {
      const res = await updateMeeting(id, payload);
      if (res.success) {
        setMeeting(res.data);
        setEditOpen(false);
        showToast("Meeting updated", "success");
        load();
      }
    } catch {
      showToast("Failed to update meeting", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader message="Loading meeting..." />;
  if (!meeting) return <p className="text-neutral-500">Meeting not found.</p>;

  const participants = Array.isArray(meeting.participants) ? meeting.participants : [];

  return (
    <div>
      <div className="flex flex-wrap items-start gap-3 mb-5">
        <button
          type="button"
          onClick={() => navigate("/mom")}
          className="p-2 rounded-lg hover:bg-neutral-100 transition-colors shrink-0 mt-0.5"
          aria-label="Back to meetings"
        >
          <ArrowLeft size={18} style={{ color: THEME_COLORS.deepBlue }} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400 mb-0.5">
            Meeting Title
          </p>
          <p
            className="font-medium text-base sm:text-lg leading-snug break-words"
            style={{ color: THEME_COLORS.deepBlue }}
          >
            {meeting.title}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <StatusChip status={meeting.status} />
            {meeting.meeting_type ? (
              <span className="text-xs text-neutral-500">{meeting.meeting_type}</span>
            ) : null}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {hasPermission("mom", "update") && (
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg hover:bg-neutral-50"
            >
              <Edit2 size={14} /> Edit
            </button>
          )}
        </div>
      </div>

      <section className="rounded-xl border border-neutral-200 bg-white p-4 mb-5">
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetaField label="Date">
            {meeting.meeting_date ? new Date(meeting.meeting_date).toLocaleDateString() : "—"}
          </MetaField>
          <MetaField label="Time">
            {[meeting.start_time?.slice?.(11, 16), meeting.end_time?.slice?.(11, 16)]
              .filter(Boolean)
              .join(" – ") || "—"}
          </MetaField>
          <MetaField label="Organizer">{meeting.organizer || "—"}</MetaField>
          <MetaField label="Client email">{meeting.client_email || "—"}</MetaField>
          <MetaField label="Participants">
            {participants.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {participants.map((p) => (
                  <span key={p} className="text-xs px-2 py-0.5 rounded-full bg-neutral-100">{p}</span>
                ))}
              </div>
            ) : "—"}
          </MetaField>
        </dl>
        {meeting.notes && (
          <div className="mt-4 pt-4 border-t border-neutral-100">
            <MetaField label="Notes">
              <p className="whitespace-pre-wrap text-neutral-600">{meeting.notes}</p>
            </MetaField>
          </div>
        )}
      </section>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: THEME_COLORS.mediumTeal }}>
          Action Items
        </h3>
        <ActionItemsGrid
          meetingId={Number(id)}
          items={meeting.action_items || []}
          onItemsChange={load}
          highlightActionId={focusActionId}
        />
      </section>

      <MeetingFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={handleUpdate}
        initial={meeting}
        saving={saving}
      />
    </div>
  );
}
