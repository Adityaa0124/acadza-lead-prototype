"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Upload,
  Download,
  ArrowRight,
  Users,
  CalendarDays,
  Check,
  ArrowUpRight,
  FileSpreadsheet,
  AlertCircle,
} from "lucide-react";
import { useApp } from "./context";
import {
  PageTitle,
  Field,
  Submit,
  ErrorText,
  Empty,
  Modal,
  Badge,
  dateInputValue,
  fromSchoolTime,
} from "./ui";
import {
  Lead,
  User,
  DocumentStatus,
  isCalling,
  isClosed,
  stageLabels,
  timeLabel,
  Batch,
  documentStatusLabels,
  grades,
} from "@/lib/types";
export function Assignments() {
  const { data, command } = useApp();
  const [selected, setSelected] = useState<string[]>([]),
    [target, setTarget] = useState(""),
    [reason, setReason] = useState(""),
    [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const callers = data.users.filter((u) => u.role === "caller");
  const waiting = data.leads.filter((l) => isCalling(l) && !l.caller);
  return (
    <>
      <PageTitle
        eyebrow="TEAM WORKSPACE"
        title="Assignments"
        description="Keep new enquiries moving, without overloading your calling team."
      />
      {waiting.length > 0 && (
        <div className="attention-banner">
          <AlertCircle size={20} />
          <div>
            <strong>{waiting.length} enquiries are waiting for a caller</strong>
            <p>Review capacity below, then assign the waiting enquiries.</p>
          </div>
          <a href="#waiting" className="button secondary">
            Review enquiries
          </a>
        </div>
      )}
      <section className="panel">
        <div className="panel-heading">
          <h2>Calling team</h2>
          <span className="muted">{callers.length} callers</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Caller</th>
                <th>Availability</th>
                <th>Active enquiries</th>
                <th>Overdue</th>
                <th>Capacity remaining</th>
              </tr>
            </thead>
            <tbody>
              {callers.map((u) => {
                const active = data.leads.filter(
                  (l) => l.caller === u.id && isCalling(l),
                );
                return (
                  <tr key={u.id}>
                    <td>
                      <strong>{u.name}</strong>
                    </td>
                    <td>
                      <span
                        className={
                          "availability " + (u.available ? "" : "paused")
                        }
                      >
                        {u.available ? "Available" : "Paused"}
                      </span>
                    </td>
                    <td>
                      <div className="workload">
                        <span>
                          {active.length} <small>/ {u.capacity}</small>
                        </span>
                        <div className="progress-track">
                          <div
                            style={{
                              width:
                                Math.min(
                                  100,
                                  (active.length / Math.max(u.capacity, 1)) *
                                    100,
                                ) + "%",
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      {active.filter((l) => l.due && l.due < data.now).length}
                    </td>
                    <td>{Math.max(0, u.capacity - active.length)} places</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <section id="waiting" className="panel spaced-panel">
        <div className="panel-heading">
          <div>
            <h2>Waiting for a caller</h2>
            <p>Assignment preserves any existing callback time.</p>
          </div>
          {selected.length > 0 && (
            <button className="button primary" onClick={() => setOpen(true)}>
              Assign {selected.length} enquiries
            </button>
          )}
        </div>
        {waiting.length ? (
          <>
            <div className="bulk-select">
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={selected.length === Math.min(100, waiting.length)}
                  onChange={(e) =>
                    setSelected(
                      e.target.checked
                        ? waiting.slice(0, 100).map((l) => l.id)
                        : [],
                    )
                  }
                />
                Select first {Math.min(100, waiting.length)} waiting enquiries
              </label>
              <span>{selected.length} selected</span>
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Select</th>
                    <th>Student</th>
                    <th>Parent</th>
                    <th>Waiting since</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {waiting.slice(0, 100).map((l) => (
                    <tr key={l.id}>
                      <td>
                        <input
                          type="checkbox"
                          aria-label={"Select " + l.student}
                          checked={selected.includes(l.id)}
                          onChange={(e) =>
                            setSelected(
                              e.target.checked
                                ? [...selected, l.id]
                                : selected.filter((id) => id !== l.id),
                            )
                          }
                        />
                      </td>
                      <td>
                        <Link
                          className="row-title"
                          href={"/admissions/leads/" + l.id}
                        >
                          {l.student}
                        </Link>
                        <small>Grade {l.grade}</small>
                      </td>
                      <td>{l.parent}</td>
                      <td>{timeLabel(l.created)}</td>
                      <td>No available capacity</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <Empty
            title="Every enquiry has a place"
            description="New enquiries are assigned automatically to an available caller."
          />
        )}
      </section>
      {open && (
        <Modal
          title={`Assign ${selected.length} enquiries`}
          description="Choose a caller with capacity. Callback times will stay unchanged."
          onClose={() => setOpen(false)}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              try {
                await command({
                  type: "assign",
                  ids: selected,
                  target,
                  reason,
                });
                setOpen(false);
                setSelected([]);
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <Field label="Caller">
              <select
                required
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              >
                <option value="">Choose a caller</option>
                {callers
                  .filter((u) => u.available)
                  .map((u) => (
                    <option value={u.id} key={u.id}>
                      {u.name} · capacity {u.capacity}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="Reason">
              <textarea
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </Field>
            <ErrorText message={error} />
            <div className="dialog-footer">
              <Submit busy={busy} label="Confirm assignment" />
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
export function TestQueue() {
  const { data, command } = useApp();
  const [tab, setTab] = useState("ready"),
    [modal, setModal] = useState<{ lead: Lead; action: string } | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const groups: Record<string, string[]> = {
    ready: ["READY_FOR_CBT"],
    scheduled: ["CBT_SCHEDULED"],
    results: ["CBT_COMPLETED"],
  };
  const leads = data.leads.filter((l) => groups[tab].includes(l.stage));
  return (
    <>
      <PageTitle
        eyebrow="THE NEXT STEP"
        title="Entrance tests"
        description="Schedule entrance tests, record attendance and share the result with admissions."
      />
      <section className="panel">
        <div className="tabs large-tabs">
          {[
            ["ready", "Ready to schedule"],
            ["scheduled", "Scheduled"],
            ["results", "Results"],
          ].map(([key, label]) => (
            <button
              key={key}
              className={tab === key ? "active" : ""}
              onClick={() => setTab(key)}
            >
              {label}
              <span className="tab-count">
                {data.leads.filter((l) => groups[key].includes(l.stage)).length}
              </span>
            </button>
          ))}
        </div>
        {leads.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Parent / guardian</th>
                  <th>Next step</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <Link
                        className="row-title"
                        href={"/admissions/leads/" + l.id}
                      >
                        {l.student}
                      </Link>
                      <small>Grade {l.grade}</small>
                    </td>
                    <td>
                      {l.parent}
                      <small>{l.phone}</small>
                    </td>
                    <td>
                      {l.nextAction}
                      {l.booking && (
                        <small>
                          {timeLabel(l.booking.at)} · {l.booking.location}
                        </small>
                      )}
                    </td>
                    <td>
                      {tab === "ready" ? (
                        <button
                          className="button secondary compact"
                          onClick={() => {
                            setModal({ lead: l, action: "book" });
                            setError("");
                          }}
                        >
                          <CalendarDays size={15} />
                          Schedule test
                        </button>
                      ) : tab === "scheduled" ? (
                        <div className="button-row">
                          <button
                            className="button secondary compact"
                            onClick={() => {
                              setModal({ lead: l, action: "attendance" });
                              setError("");
                            }}
                          >
                            Attendance
                          </button>
                          <button
                            className="text-button"
                            onClick={() => {
                              setModal({ lead: l, action: "book" });
                              setError("");
                            }}
                          >
                            Reschedule
                          </button>
                        </div>
                      ) : (
                        <button
                          className="button secondary compact"
                          onClick={() => {
                            setModal({ lead: l, action: "result" });
                            setError("");
                          }}
                        >
                          Record result
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title="Nothing waiting here"
            description="Students will appear when they reach this step."
          />
        )}
      </section>
      {modal && (
        <Modal
          title={
            modal.action === "book"
              ? "Schedule entrance test"
              : modal.action === "attendance"
                ? "Did the student attend?"
                : "Record test result"
          }
          description={`${modal.lead.student} · Grade ${modal.lead.grade}`}
          onClose={() => setModal(null)}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const f = Object.fromEntries(new FormData(e.currentTarget));
              setBusy(true);
              setError("");
              try {
                await command({
                  type: modal.action,
                  id: modal.lead.id,
                  version: modal.lead.version,
                  ...f,
                  due: f.due ? fromSchoolTime(String(f.due)) : undefined,
                  attended: f.attended === "yes",
                  progress: f.progress === "yes",
                });
                setModal(null);
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {modal.action === "book" ? (
              <>
                <Field label="Date and time" hint="India Standard Time (IST)">
                  <input
                    name="due"
                    type="datetime-local"
                    required
                    defaultValue={dateInputValue(
                      new Date(Date.parse(data.now) + 86400000).toISOString(),
                    )}
                  />
                </Field>
                <Field label="Test">
                  <input
                    name="test"
                    required
                    defaultValue={
                      "Grade " + modal.lead.grade + " entrance test"
                    }
                  />
                </Field>
                <Field label="Location">
                  <input
                    name="location"
                    required
                    defaultValue="School computer lab"
                  />
                </Field>
              </>
            ) : modal.action === "attendance" ? (
              <Field label="Attendance">
                <select name="attended">
                  <option value="yes">Attended, ready for result</option>
                  <option value="no">
                    Did not attend, follow up to reschedule
                  </option>
                </select>
              </Field>
            ) : (
              <>
                <div className="form-grid">
                  <Field label="Score">
                    <input name="score" type="number" min="0" required />
                  </Field>
                  <Field label="Maximum score">
                    <input
                      name="max"
                      type="number"
                      min="1"
                      defaultValue="100"
                      required
                    />
                  </Field>
                </div>
                <Field label="School decision">
                  <select name="progress">
                    <option value="no">Decision pending</option>
                    <option value="yes">Proceed to admissions</option>
                  </select>
                </Field>
              </>
            )}
            <ErrorText message={error} />
            <div className="dialog-footer">
              <Submit
                busy={busy}
                label={
                  modal.action === "book" ? "Schedule test" : "Save update"
                }
              />
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
export function AdmissionQueue() {
  const { data, command } = useApp();
  const [lead, setLead] = useState<Lead | null>(null),
    [documentLead, setDocumentLead] = useState<Lead | null>(null),
    [note, setNote] = useState(""),
    [documentNote, setDocumentNote] = useState(""),
    [documentStatus, setDocumentStatus] = useState<DocumentStatus>("NOT_STARTED"),
    [search, setSearch] = useState(""),
    [grade, setGrade] = useState(""),
    [status, setStatus] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const list = data.leads.filter(
    (l) =>
      l.stage === "ADMISSION_IN_PROGRESS" &&
      (!grade || l.grade === grade) &&
      (!status || (l.documentStatus || "NOT_STARTED") === status) &&
      (!search ||
        [l.student, l.parent, l.phone, l.id].some((value) =>
          value.toLowerCase().includes(search.toLowerCase()),
        )),
  );
  const reviewActionLabels: Record<DocumentStatus, string> = {
    NOT_STARTED: "Await documents",
    RECEIVED: "Review documents",
    VERIFIED: "Documents confirmed, ready to admit",
    NEEDS_RESUBMISSION: "Request more documents",
  };
  const updateDocumentAction = async (lead: Lead, next: DocumentStatus) => {
    setBusy(true);
    setError("");
    try {
      await command({
        type: "documentReview",
        id: lead.id,
        version: lead.version,
        status: next,
        note: lead.documentNote || "",
      });
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageTitle
        eyebrow="ADMISSIONS"
        title="Admissions"
        description="Confirm the remaining admission requirements and record the final outcome."
      />
      <section className="panel">
        <div className="panel-heading">
          <h2>Admission in progress</h2>
          <span>{list.length} students</span>
        </div>
        <div className="table-toolbar admission-toolbar">
          <input
            aria-label="Search admission students"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search student, parent, phone or ID"
            type="search"
            value={search}
          />
          <select aria-label="Filter by grade" onChange={(event) => setGrade(event.target.value)} value={grade}>
            <option value="">All grades</option>
            {grades.map((value) => <option key={value} value={value}>Grade {value}</option>)}
          </select>
          <select aria-label="Filter by document status" onChange={(event) => setStatus(event.target.value)} value={status}>
            <option value="">All document states</option>
            {Object.entries(documentStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <ErrorText message={error} />
        {list.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Parent</th>
                  <th>CBT result</th>
                  <th>Documents</th>
                  <th>Remaining action</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {list.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <Link
                        className="row-title"
                        href={"/admissions/leads/" + l.id}
                      >
                        {l.student}
                      </Link>
                      <small>Grade {l.grade}</small>
                    </td>
                    <td>
                      {l.parent}
                      <small>{l.phone}</small>
                    </td>
                    <td>
                      {l.booking?.score != null && l.booking.max != null ? (
                        <>
                          <strong>{l.booking.score}/{l.booking.max}</strong>
                          <small>
                            {Math.round((l.booking.score / l.booking.max) * 100)}% · recorded by test team
                          </small>
                        </>
                      ) : (
                        <span className="muted">Result not recorded</span>
                      )}
                    </td>
                    <td>
                      <strong>{documentStatusLabels[l.documentStatus || "NOT_STARTED"]}</strong>
                      {l.documentNote && <small>{l.documentNote}</small>}
                    </td>
                    <td>
                      <select
                        aria-label={`Remaining action for ${l.student}`}
                        className="remaining-action-select"
                        disabled={busy}
                        onChange={(event) =>
                          void updateDocumentAction(
                            l,
                            event.target.value as DocumentStatus,
                          )
                        }
                        value={l.documentStatus || "NOT_STARTED"}
                      >
                        {Object.entries(reviewActionLabels).map(
                          ([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ),
                        )}
                      </select>
                    </td>
                    <td>
                      <div className="admission-actions">
                        <button
                          className="button secondary"
                          onClick={() => {
                            setDocumentLead(l);
                            setDocumentStatus(l.documentStatus || "NOT_STARTED");
                            setDocumentNote(l.documentNote || "");
                            setError("");
                          }}
                        >
                          Review documents
                        </button>
                        {l.documentStatus === "VERIFIED" && (
                          <button
                            className="button primary"
                            onClick={() => {
                              setLead(l);
                              setNote("");
                              setError("");
                            }}
                          >
                            Confirm admission
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title="No admissions waiting"
            description="Students appear here after the test team's progression decision."
          />
        )}
      </section>
      {documentLead && (
        <Modal
          title="Review admission documents"
          description={documentLead.student + " · " + documentLead.parent}
          onClose={() => setDocumentLead(null)}
        >
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              setBusy(true);
              setError("");
              try {
                await command({
                  type: "documentReview",
                  id: documentLead.id,
                  version: documentLead.version,
                  status: documentStatus,
                  note: documentNote,
                });
                setDocumentLead(null);
              } catch (caught) {
                setError((caught as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="info-note">
              Record the Admissions team&apos;s manual review. File uploads and document previews remain a future integration.
            </div>
            <Field label="Document review status">
              <select value={documentStatus} onChange={(event) => setDocumentStatus(event.target.value as DocumentStatus)}>
                {Object.entries(documentStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </Field>
            <Field label="Offline document or review note">
              <textarea
                onChange={(event) => setDocumentNote(event.target.value)}
                placeholder="For example: Original birth certificate checked at front desk; name and date of birth match application."
                rows={4}
                value={documentNote}
              />
            </Field>
            <ErrorText message={error} />
            <div className="dialog-footer">
              <Submit busy={busy} label="Save document review" />
            </div>
          </form>
        </Modal>
      )}
      {lead && (
        <Modal
          title="Confirm admission completion"
          description={lead.student + " · Grade " + lead.grade}
          onClose={() => setLead(null)}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                await command({
                  type: "convert",
                  id: lead.id,
                  version: lead.version,
                  note,
                });
                setLead(null);
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {lead.booking?.score != null && lead.booking.max != null && (
              <div className="info-note">
                <strong>CBT result: {lead.booking.score}/{lead.booking.max}</strong>
                {" · "}{Math.round((lead.booking.score / lead.booking.max) * 100)}%
              </div>
            )}
            <div className="info-note">Documents are marked verified. Admission completion remains a deliberate manual decision.</div>
            <Field label="What confirms that admission is complete?">
              <textarea
                required
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Record the school approval, document or fee confirmation."
                rows={4}
              />
            </Field>
            <ErrorText message={error} />
            <div className="dialog-footer">
              <Submit busy={busy} label="Confirm admission" />
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
export function Reports() {
  const { data } = useApp();
  const valid = data.leads.filter((l) => l.stage !== "INVALID");
  const converted = valid.filter((l) => l.stage === "CONVERTED").length;
  return (
    <>
      <PageTitle
        eyebrow="SCHOOL OVERVIEW"
        title="Reports"
        description="Academic year 2027/28 · Current demo cohort · Updated from shared records"
      />
      <div className="report-totals">
        {[
          ["Valid enquiries", valid.length],
          ["Active opportunities", valid.filter((l) => !isClosed(l)).length],
          ["Admission completed", converted],
          [
            "Closed, not admitted",
            valid.filter((l) => l.stage === "LOST").length,
          ],
        ].map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="report-layout">
        <section className="panel">
          <div className="panel-heading">
            <h2>Current admission stages</h2>
          </div>
          <div className="stage-report">
            {Object.entries(stageLabels).map(([stage, label]) => {
              const count = data.leads.filter((l) => l.stage === stage).length;
              return (
                <div className="stage-line" key={stage}>
                  <span>{label}</span>
                  <div className="progress-track">
                    <div
                      style={{
                        width:
                          Math.max(
                            count ? 2 : 0,
                            (count / Math.max(data.leads.length, 1)) * 100,
                          ) + "%",
                      }}
                    />
                  </div>
                  <strong>{count}</strong>
                </div>
              );
            })}
          </div>
          <p className="report-footnote">
            Current-stage counts, not a sequential conversion funnel. Students
            may enter directly at Ready for test.
          </p>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <h2>Enquiry sources</h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>Source</th>
                <th>Enquiries</th>
                <th>Admissions</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(new Set(valid.map((l) => l.source))).map((source) => (
                <tr key={source}>
                  <td>{source}</td>
                  <td>{valid.filter((l) => l.source === source).length}</td>
                  <td>
                    {
                      valid.filter(
                        (l) => l.source === source && l.stage === "CONVERTED",
                      ).length
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
      <p className="muted report-footnote">
        Invalid enquiries are excluded from the headline cohort. This prototype
        records call attempts manually.
      </p>
    </>
  );
}
export function SettingsPage() {
  const { data, command } = useApp();
  const [edit, setEdit] = useState<User | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <>
      <PageTitle
        eyebrow="TEAM SETTINGS"
        title="Team settings"
        description="Control new assignments. Existing enquiries stay with their owner until reassigned."
      />
      <section className="panel">
        <div className="panel-heading">
          <h2>Calling team availability</h2>
          <span>Least-active-workload allocation</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Caller</th>
                <th>New assignments</th>
                <th>Active lead capacity</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.users
                .filter((u) => u.role === "caller")
                .map((u) => (
                  <tr key={u.id}>
                    <td>
                      <strong>{u.name}</strong>
                    </td>
                    <td>{u.available ? "Enabled" : "Paused"}</td>
                    <td>{u.capacity}</td>
                    <td>
                      <button
                        className="button secondary compact"
                        onClick={() => {
                          setEdit(u);
                          setError("");
                        }}
                      >
                        Edit capacity
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
      {edit && (
        <Modal
          title="Caller availability"
          description={edit.name}
          onClose={() => setEdit(null)}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              setBusy(true);
              try {
                await command({
                  type: "availability",
                  target: edit.id,
                  capacity: Number(f.get("capacity")),
                  available: f.get("available") === "on",
                });
                setEdit(null);
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <Field label="Maximum active enquiries">
              <input
                type="number"
                name="capacity"
                required
                min="0"
                max="1000"
                defaultValue={edit.capacity}
              />
            </Field>
            <label className="check-label">
              <input
                type="checkbox"
                name="available"
                defaultChecked={edit.available}
              />
              Accept new assignments
            </label>
            <p className="muted">
              Lowering capacity does not remove existing leads. New capacity
              will be used to assign waiting enquiries.
            </p>
            <ErrorText message={error} />
            <div className="dialog-footer">
              <Submit busy={busy} label="Save availability" />
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
export function Imports({ path }: { path: string }) {
  const { data, refresh, notify, request } = useApp();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const isNew = path.endsWith("/new"),
    id = path.split("/")[3],
    batch = data.batches.find((b) => b.id === id);
  const download = (b: Batch) => {
    const rows = [
      ["Row", "Student", "Status", "Error"],
      ...b.rows.map((r) => [String(r.row), r.student, r.status, r.error || ""]),
    ];
    const csv = rows
      .map((row) =>
        row
          .map(
            (cell) =>
              '"' + cell.replaceAll('"', '""').replace(/^[=+@-]/, "'") + '"',
          )
          .join(","),
      )
      .join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = b.id + "-results.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
  if (isNew)
    return (
      <>
        <Link className="back-link" href="/admissions/imports">
          ← Back to imports
        </Link>
        <PageTitle
          title="Upload enquiry list"
          description="Upload the school list once. Your team can take it from there."
        />
        <section className="panel import-upload">
          <div className="step-labels">
            <span className="active">1. Choose file</span>
            <ArrowRight size={15} />
            <span>2. Review</span>
            <ArrowRight size={15} />
            <span>3. Import</span>
          </div>
          <div className="info-note">
            This prototype uses a fixed template: Student, Parent, Phone, Grade,
            Source. One worksheet, up to 1,000 rows and 5 MB.
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!file) return;
              setBusy(true);
              setError("");
              const form = new FormData();
              form.set("file", file);
              try {
                const response = await fetch("/api/v1/imports/preview", {
                  method: "POST",
                  body: form,
                });
                const result = await response.json();
                if (!response.ok) throw new Error(result.error);
                await refresh();
                router.push("/admissions/imports/" + result.id);
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <label className="file-drop">
              <span className="upload-icon">
                <FileSpreadsheet size={30} />
              </span>
              <strong>{file ? file.name : "Choose an Excel workbook"}</strong>
              <span>Use an .xlsx file with the template headings</span>
              <input
                aria-label="Choose Excel workbook"
                type="file"
                accept=".xlsx"
                required
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
            <a className="text-button" href="/api/v1/template">
              <Download size={16} />
              Download the enquiry template
            </a>
            <ErrorText message={error} />
            <div className="form-footer">
              <Link href="/admissions/imports" className="button secondary">
                Cancel
              </Link>
              <Submit busy={busy} label="Review file" next />
            </div>
          </form>
        </section>
      </>
    );
  if (id) {
    if (!batch)
      return (
        <Empty
          title="Import not found"
          description="Return to imports to choose an available batch."
        />
      );
    const ready = batch.rows.filter((r) => r.status === "ready").length;
    return (
      <>
        <Link className="back-link" href="/admissions/imports">
          ← Back to imports
        </Link>
        <PageTitle
          title={
            batch.status === "review"
              ? "Review before importing."
              : "Your import is complete."
          }
          description={
            batch.file + " · " + batch.actor + " · " + timeLabel(batch.created)
          }
          action={
            <button
              className="button secondary"
              onClick={() => download(batch)}
            >
              <Download size={16} />
              Download results
            </button>
          }
        />
        <div className="import-summary">
          <div>
            <strong>{batch.rows.length}</strong>
            <span>Total rows</span>
          </div>
          <div>
            <strong>
              {
                batch.rows.filter((r) =>
                  ["ready", "created"].includes(r.status),
                ).length
              }
            </strong>
            <span>
              {batch.status === "review" ? "Ready to import" : "Created"}
            </span>
          </div>
          <div>
            <strong>
              {
                batch.rows.filter(
                  (r) => !["ready", "created"].includes(r.status),
                ).length
              }
            </strong>
            <span>Skipped / needs review</span>
          </div>
        </div>
        {batch.status === "review" && (
          <div className="info-note">
            Possible duplicates and invalid rows will be skipped. Review them
            separately; existing enquiries will not be overwritten.
          </div>
        )}
        <section className="panel">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Row</th>
                  <th>Student</th>
                  <th>Parent / phone</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {batch.rows.slice(0, 100).map((r) => (
                  <tr key={r.row}>
                    <td>{r.row}</td>
                    <td>
                      {r.lead ? (
                        <Link
                          className="row-title"
                          href={"/admissions/leads/" + r.lead}
                        >
                          {r.student}
                        </Link>
                      ) : (
                        r.student
                      )}
                      <small>Grade {r.grade}</small>
                    </td>
                    <td>
                      {r.parent}
                      <small>{r.phone}</small>
                    </td>
                    <td>
                      <span className="badge neutral">{r.status}</span>
                      {r.error && <small>{r.error}</small>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="form-footer">
            <span>
              Showing first {Math.min(100, batch.rows.length)} rows. Download
              for all results.
            </span>
            {batch.status === "review" ? (
              <button
                className="button primary"
                disabled={busy || !ready}
                onClick={async () => {
                  setBusy(true);
                  setError("");
                  try {
                    const result = (await request("imports/commit", {
                      id: batch.id,
                    })) as { message: string };
                    notify(result.message);
                    await refresh();
                  } catch (e) {
                    setError((e as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy
                  ? "Importing…"
                  : `Import ${ready} ${ready === 1 ? "enquiry" : "enquiries"}`}
                <ArrowRight size={16} />
              </button>
            ) : (
              <Link className="button primary" href="/admissions/leads">
                View enquiries
              </Link>
            )}
          </div>
          <ErrorText message={error} />
        </section>
      </>
    );
  }
  return (
    <>
      <PageTitle
        eyebrow="BULK ENQUIRIES"
        title="Imports"
        description="Upload once. Review the records. Let the calling team take over."
        action={
          <Link className="button primary" href="/admissions/imports/new">
            <Upload size={17} />
            Upload enquiry list
          </Link>
        }
      />
      <section className="panel">
        {data.batches.length ? (
          <table>
            <thead>
              <tr>
                <th>File</th>
                <th>Uploaded by</th>
                <th>Rows</th>
                <th>Status</th>
                <th>Review</th>
              </tr>
            </thead>
            <tbody>
              {data.batches.map((b) => (
                <tr key={b.id}>
                  <td>
                    <Link
                      className="row-title"
                      href={"/admissions/imports/" + b.id}
                    >
                      {b.file}
                    </Link>
                    <small>{timeLabel(b.created)}</small>
                  </td>
                  <td>{b.actor}</td>
                  <td>{b.rows.length}</td>
                  <td>
                    {b.status === "review" ? "Needs review" : "Completed"}
                  </td>
                  <td>
                    <Link
                      className="icon-button"
                      href={"/admissions/imports/" + b.id}
                      aria-label={"Open " + b.file}
                    >
                      <ArrowUpRight size={18} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Empty
            title="A whole list. One simple upload."
            description="Start with the template to bring your existing enquiries into the shared workspace."
            action={
              <a className="button secondary" href="/api/v1/template">
                <Download size={17} />
                Download template
              </a>
            }
          />
        )}
      </section>
    </>
  );
}
