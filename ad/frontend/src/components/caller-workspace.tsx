"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Phone,
  Copy,
  ArrowUpRight,
  Clock3,
  MessageSquare,
  ChevronDown,
  Check,
  ArrowRight,
  ArrowLeft,
  CalendarDays,
} from "lucide-react";
import { useApp } from "./context";
import {
  Badge,
  PageTitle,
  Field,
  ErrorText,
  Empty,
  Submit,
  dateInputValue,
  fromSchoolTime,
} from "./ui";
import { isCalling, timeLabel, Lead } from "@/lib/types";
import { WhatsAppContact } from "./whatsapp-contact";
export function CallerWorkspace() {
  const { data, command, notify, setDirty, refresh } = useApp();
  const [tab, setTab] = useState("due"),
    [active, setActive] = useState(""),
    [outcome, setOutcome] = useState(""),
    [more, setMore] = useState(false),
    [note, setNote] = useState(""),
    [due, setDue] = useState(dateInputValue()),
    [reason, setReason] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [mobileOpen, setMobileOpen] = useState(false);
  const mine = data.leads.filter(
    (l) => l.caller === data.user.id && isCalling(l),
  );
  const buckets = {
    due: mine
      .filter((l) => l.due && l.due <= data.now)
      .sort((a, b) => a.due!.localeCompare(b.due!)),
    new: mine
      .filter((l) => !l.due)
      .sort((a, b) => a.created.localeCompare(b.created)),
    upcoming: mine
      .filter((l) => l.due && l.due > data.now)
      .sort((a, b) => a.due!.localeCompare(b.due!)),
  };
  const queue = buckets[tab as keyof typeof buckets];
  const lead =
    mine.find((l) => l.id === active) || (!active ? queue[0] : undefined);
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("lead");
    if (id) {
      setActive(id);
      setMobileOpen(true);
    }
  }, []);
  const draftVersion = useRef<{ id: string; version: number } | null>(null);
  const dirty = Boolean(outcome || note);
  const choose = (l: Lead) => {
    if (
      dirty &&
      !confirm("Discard this unsaved outcome and open another enquiry?")
    )
      return;
    draftVersion.current = null;
    setActive(l.id);
    setOutcome("");
    setNote("");
    setError("");
    setDirty(false);
    setMobileOpen(true);
  };
  const hasNext = [
      "No answer",
      "Call later",
      "Interested",
      "School visit requested",
    ].includes(outcome),
    closed = ["Not interested", "Admitted elsewhere", "Wrong number"].includes(
      outcome,
    );
  const outcomes = ["No answer", "Call later", "Interested", "Ready for test"];
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!lead) return;
    setBusy(true);
    setError("");
    const next =
      (e.nativeEvent as SubmitEvent).submitter?.getAttribute("value") !==
      "stay";
    try {
      await command({
        type: "outcome",
        id: lead.id,
        version:
          draftVersion.current?.id === lead.id
            ? draftVersion.current.version
            : lead.version,
        outcome,
        note,
        reason,
        due: hasNext ? fromSchoolTime(due) : undefined,
      });
      setOutcome("");
      setNote("");
      setReason("");
      draftVersion.current = null;
      setDirty(false);
      if (next) {
        const other = queue.find((l) => l.id !== lead.id);
        setActive(other?.id || "");
        if (!other && tab === "due" && buckets.new.length) setTab("new");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageTitle
        eyebrow="YOUR CALLING DESK"
        title="My calls"
        description="The right details. A clear next step. Nothing to keep in your head."
        action={
          <div className="today-label">
            <CalendarDays size={17} />
            {new Intl.DateTimeFormat("en-IN", {
              day: "numeric",
              month: "long",
              timeZone: "Asia/Kolkata",
            }).format(new Date(data.now))}
          </div>
        }
      />
      <div
        className={"calling-layout " + (mobileOpen ? "show-conversation" : "")}
      >
        <aside className="call-queue panel">
          <div className="queue-heading">
            <h2>Calls to make</h2>
            <span className="count-bubble">
              {buckets.due.length + buckets.new.length}
            </span>
          </div>
          <div
            className="queue-tabs"
            role="group"
            aria-label="Filter call queue"
          >
            {[
              ["due", "Due"],
              ["new", "New"],
              ["upcoming", "Upcoming"],
            ].map(([key, label]) => (
              <button
                key={key}
                aria-pressed={tab === key}
                className={tab === key ? "active" : ""}
                onClick={() => {
                  if (
                    dirty &&
                    !confirm(
                      "Discard the unsaved outcome before changing queues?",
                    )
                  )
                    return;
                  draftVersion.current = null;
                  setTab(key);
                  setActive("");
                  setOutcome("");
                  setNote("");
                  setDirty(false);
                }}
              >
                {label}
                <span>{buckets[key as keyof typeof buckets].length}</span>
              </button>
            ))}
          </div>
          <div className="queue-list">
            {queue.length ? (
              queue.map((l) => (
                <button
                  key={l.id}
                  className={
                    "queue-record " + (lead?.id === l.id ? "active" : "")
                  }
                  onClick={() => choose(l)}
                >
                  <span className="queue-person">{l.parent}</span>
                  <span className="queue-student">
                    {l.student} · Grade {l.grade}
                  </span>
                  <span
                    className={
                      "queue-time " +
                      (l.due && l.due < data.now ? "overdue-text" : "")
                    }
                  >
                    {l.due ? (
                      <>
                        <Clock3 size={12} />
                        {timeLabel(l.due)}
                      </>
                    ) : (
                      <>New enquiry · {l.source}</>
                    )}
                  </span>
                  {l.requested && (
                    <span className="queue-note">
                      Parent requested a callback
                    </span>
                  )}
                </button>
              ))
            ) : (
              <div className="queue-empty">
                {tab === "due"
                  ? "No callbacks due right now."
                  : tab === "new"
                    ? "No new enquiries waiting."
                    : "No upcoming callbacks."}
              </div>
            )}
          </div>
          <div className="queue-foot">
            <Check size={14} />
            Only enquiries assigned to you.
          </div>
        </aside>
        <section className="conversation panel">
          {lead ? (
            <>
              <button
                className="text-button back-to-queue"
                onClick={() => setMobileOpen(false)}
              >
                <ArrowLeft size={16} />
                Back to calls
              </button>
              <div className="conversation-header">
                <div>
                  <div className="section-kicker">PARENT / GUARDIAN</div>
                  <h2>{lead.parent}</h2>
                  <p>
                    {lead.student}
                    <span className="dot-separator">·</span>Grade {lead.grade}
                    <Badge lead={lead} />
                  </p>
                </div>
                <Link
                  className="icon-button"
                  href={"/admissions/leads/" + lead.id}
                  aria-label="Open full enquiry"
                >
                  <ArrowUpRight size={20} />
                </Link>
              </div>
              <div className="call-contact">
                <a className="large-phone" href={"tel:" + lead.phone}>
                  {lead.phone.replace(/(\d{5})(\d{5})/, "$1 $2")}
                </a>
                <button
                  className="icon-button"
                  aria-label="Copy phone number"
                  onClick={() =>
                    navigator.clipboard
                      .writeText(lead.phone)
                      .then(() => notify("Phone number copied."))
                      .catch(() =>
                        notify(
                          "Copy unavailable. Select the phone number to copy it.",
                        ),
                      )
                  }
                >
                  <Copy size={16} />
                </button>
                <a
                  className="button primary call-button"
                  href={"tel:" + lead.phone}
                >
                  <Phone size={17} />
                  Call parent
                </a>
                <WhatsAppContact lead={lead} />
              </div>
              {lead.due && (
                <div
                  className={
                    "callback-context " +
                    (lead.due < data.now ? "attention" : "")
                  }
                >
                  <Clock3 size={18} />
                  <div>
                    <strong>
                      {lead.due < data.now
                        ? "Callback is due"
                        : "Scheduled callback"}
                    </strong>
                    <span>
                      {timeLabel(lead.due)}
                      {lead.requested ? " · Requested by parent" : ""}
                    </span>
                  </div>
                </div>
              )}
              <div className="previous-conversation">
                <div className="section-kicker">
                  <MessageSquare size={15} />
                  LAST CONVERSATION
                </div>
                <p>{lead.history.at(-1)?.text}</p>
                <small>
                  {lead.history.at(-1)?.actor} ·{" "}
                  {timeLabel(lead.history.at(-1)?.at || lead.created)}
                </small>
              </div>
              <form
                className="outcome-form"
                onSubmit={save}
                onChange={() => {
                  if (
                    !draftVersion.current ||
                    draftVersion.current.id !== lead.id
                  )
                    draftVersion.current = {
                      id: lead.id,
                      version: lead.version,
                    };
                  setDirty(true);
                }}
              >
                <h3>What happened on the call?</h3>
                <p className="section-description">
                  Choose an outcome. We'll help with the next step.
                </p>
                <div
                  id="call-outcome-options"
                  className="outcome-options"
                  role="group"
                  aria-label="Call outcome"
                >
                  {[
                    ...outcomes,
                    ...(more
                      ? [
                          "School visit requested",
                          "Not interested",
                          "Admitted elsewhere",
                          "Wrong number",
                        ]
                      : outcome && !outcomes.includes(outcome)
                        ? [outcome]
                        : []),
                  ].map((o) => (
                    <label
                      key={o}
                      className={
                        "outcome-option " + (outcome === o ? "chosen" : "")
                      }
                    >
                      <input
                        type="radio"
                        name="outcome"
                        value={o}
                        checked={outcome === o}
                        onChange={() => {
                          setOutcome(o);
                          setReason("");
                          setError("");
                          setDue(
                            dateInputValue(
                              new Date(
                                Date.parse(data.now) + 3600000,
                              ).toISOString(),
                            ),
                          );
                        }}
                      />
                      <span>{o}</span>
                      {outcome === o && <Check size={16} />}
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  className="text-button more-outcomes"
                  aria-expanded={more}
                  aria-controls="call-outcome-options"
                  onClick={() => setMore(!more)}
                >
                  {" "}
                  {more ? "Fewer outcomes" : "More outcomes"}
                  <ChevronDown size={14} />
                </button>
                {hasNext && (
                  <div className="conditional-fields">
                    <Field
                      label={
                        outcome === "School visit requested"
                          ? "When is the school visit?"
                          : "When should we call again?"
                      }
                      hint="School time · India Standard Time (IST)"
                    >
                      <input
                        type="datetime-local"
                        required
                        value={due}
                        onChange={(e) => setDue(e.target.value)}
                      />
                    </Field>
                    {outcome === "Call later" && (
                      <small className="parent-request">
                        Use the time agreed with the parent.
                      </small>
                    )}
                  </div>
                )}
                {closed && (
                  <div className="conditional-fields">
                    <Field label="Reason for closing this enquiry">
                      <select
                        required
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                      >
                        <option value="">Choose a reason</option>
                        {[
                          "Admitted elsewhere",
                          "Not interested",
                          "Fees",
                          "Distance or transport",
                          "No usable contact number",
                          "Other",
                        ].map((r) => (
                          <option key={r}>{r}</option>
                        ))}
                      </select>
                    </Field>
                    <p className="small-warning">
                      This closes the enquiry and stops future calls. Save only
                      after confirming the outcome.
                    </p>
                  </div>
                )}
                {outcome === "Ready for test" && (
                  <div className="handover-note">
                    <ArrowRight size={17} />
                    <span>
                      The test team will schedule the entrance test. No further
                      enquiry calls will be created.
                    </span>
                  </div>
                )}
                <Field
                  label={
                    closed && reason === "Other"
                      ? "Explain the reason (required)"
                      : "Anything the team should know? (optional)"
                  }
                >
                  <textarea
                    required={closed && reason === "Other"}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="A short note for the next conversation…"
                    rows={3}
                  />
                </Field>
                <ErrorText message={error} />
                {error.includes("changed") && (
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => {
                      draftVersion.current = null;
                      refresh();
                    }}
                  >
                    Load the latest details; keep my note
                  </button>
                )}
                <div className="outcome-footer">
                  <span>
                    <span className="saved-indicator" />
                    Updates are shared with the front desk
                  </span>
                  <div className="button-row">
                    <button
                      className="button secondary"
                      type="submit"
                      value="stay"
                      disabled={busy || !outcome}
                    >
                      Save
                    </button>
                    <Submit
                      busy={busy}
                      disabled={!outcome}
                      label="Save and next"
                      next
                    />
                  </div>
                </div>
              </form>
            </>
          ) : (
            <Empty
              title={active ? "This enquiry has moved on" : "No calls due here"}
              description={
                active
                  ? "The lead may have been reassigned or sent to the next team."
                  : "Choose another queue, or come back for your next appointment."
              }
              action={
                <button
                  className="button primary"
                  onClick={() => {
                    setActive("");
                    setTab(buckets.due.length ? "due" : "new");
                  }}
                >
                  Find next call <ArrowRight size={17} />
                </button>
              }
            />
          )}
        </section>
      </div>
    </>
  );
}
