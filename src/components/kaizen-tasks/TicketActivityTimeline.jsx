import React from "react";
import { KZ } from "../../constants/designTokens";
import {
  buildTicketDetailTimeline,
  formatTimelineActor,
  formatTimelineTimestamp,
} from "../../utils/ticketActivity";

export default function TicketActivityTimeline({
  history = [],
  comments = [],
  workflowHistory = [],
  task = null,
}) {
  const events = buildTicketDetailTimeline({
    history,
    comments,
    workflowHistory,
    task,
  });

  if (events.length === 0) {
    return (
      <p className="text-sm px-5 py-4" style={{ color: KZ.textMuted }}>
        No activity recorded yet.
      </p>
    );
  }

  return (
    <div className="kz-activity-timeline kz-audit-timeline" role="list">
      {events.map((event) => (
        <article key={event.id} className="kz-audit-timeline__item" role="listitem">
          <p className="kz-audit-timeline__type">{event.eventType}</p>
          <p className="kz-audit-timeline__desc">{event.description}</p>
          <p className="kz-audit-timeline__actor">{formatTimelineActor(event.actor)}</p>
          <p className="kz-audit-timeline__time">{formatTimelineTimestamp(event.at)}</p>
        </article>
      ))}
    </div>
  );
}
