"use client";
import { useState, useEffect } from "react";
import { ManageLead } from "./manage-lead";
import { WhatsAppContact } from "./whatsapp-contact";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  ArrowUpRight,
  ArrowLeft,
  Phone,
  Clock3,
  UserRound,
  MessageSquare,
  ChevronDown,
  Check,
  ArrowRight,
  Upload,
} from "lucide-react";
import { useApp } from "./context";
import {
  Badge,
  PageTitle,
  Field,
  Submit,
  ErrorText,
  Empty,
  Modal,
  dateInputValue,
  fromSchoolTime,
} from "./ui";
import {
  Lead,
  grades,
  sources,
  stageLabels,
  Stage,
  timeLabel,
  isCalling,
  isClosed,
} from "@/lib/types";
export function Directory() {
  const { data } = useApp();
  const initialParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : "",
  );
  const [search, setSearch] = useState(initialParams.get("q") || ""),
    [stage, setStage] = useState(initialParams.get("stage") || ""),
    [page, setPage] = useState(
      Math.max(0, Number(initialParams.get("page")) || 0),
    ),
    [filters, setFilters] = useState(false),
    [grade, setGrade] = useState(initialParams.get("grade") || "");
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (stage) params.set("stage", stage);
    if (grade) params.set("grade", grade);
    if (page) params.set("page", String(page));
    window.history.replaceState(
      null,
      "",
      window.location.pathname + (params.size ? "?" + params.toString() : ""),
    );
  }, [search, stage, grade, page]);
  const matches = data.leads.filter(
    (l) =>
      (!stage || l.stage === stage) &&
      (!grade || l.grade === grade) &&
      [l.student, l.parent, l.phone, l.id].some((v) =>
        v.toLowerCase().includes(search.toLowerCase()),
      ),
  );
  const visible = matches.slice(page * 10, page * 10 + 10);
  return (
    <>
      <PageTitle
        eyebrow="ADMISSIONS OFFICE"
        title="Enquiries"
        description="Find a parent, check the next step, or welcome a new student."
        action={
          ["clerk", "manager"].includes(data.user.role) ? (
            <Link className="button primary" href="/admissions/leads/new">
              <Plus size={18} />
              Add enquiry
            </Link>
          ) : undefined
        }
      />
      <section className="directory panel">
        <div className="table-toolbar">
          <div className="search-input">
            <Search size={18} />
            <input
              aria-label="Search enquiries"
              placeholder="Search student, parent or phone"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
          </div>
          <select
            aria-label="Filter by stage"
            value={stage}
            onChange={(e) => {
              setStage(e.target.value);
              setPage(0);
            }}
          >
            <option value="">All stages</option>
            {Object.entries(stageLabels).map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            className={"button quiet " + (filters ? "selected" : "")}
            onClick={() => setFilters(!filters)}
          >
            Filters <ChevronDown size={15} />
          </button>
          {["clerk", "manager"].includes(data.user.role) && (
            <Link
              className="text-button toolbar-import"
              href="/admissions/imports/new"
            >
              <Upload size={16} />
              Upload list
            </Link>
          )}
        </div>
        {filters && (
          <div className="filter-extension">
            <Field label="Grade">
              <select
                value={grade}
                onChange={(e) => {
                  setGrade(e.target.value);
                  setPage(0);
                }}
              >
                <option value="">All grades</option>
                {grades.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </Field>
            <button
              className="text-button"
              onClick={() => {
                setSearch("");
                setStage("");
                setGrade("");
                setPage(0);
              }}
            >
              Clear filters
            </button>
          </div>
        )}
        <div className="table-meta">
          <span>{matches.length} enquiries</span>
          <span>Academic year 2027/28</span>
        </div>
        {visible.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Parent / guardian</th>
                  <th>Stage</th>
                  <th>Next step</th>
                  <th>Caller</th>
                  <th>
                    <span className="sr-only">Open</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <Link
                        className="row-title"
                        href={"/admissions/leads/" + l.id}
                      >
                        {l.student}
                      </Link>
                      <small>
                        Grade {l.grade} · {l.source}
                      </small>
                    </td>
                    <td>
                      {l.parent}
                      <small>{l.phone}</small>
                    </td>
                    <td>
                      <Badge lead={l} />
                    </td>
                    <td>
                      {l.nextAction || "No pending action"}
                      {l.due && (
                        <small
                          className={l.due < data.now ? "overdue-text" : ""}
                        >
                          {timeLabel(l.due)}
                        </small>
                      )}
                    </td>
                    <td>
                      {data.users.find((u) => u.id === l.caller)?.name ||
                        "Waiting for caller"}
                    </td>
                    <td>
                      <Link
                        className="icon-button"
                        href={"/admissions/leads/" + l.id}
                        aria-label={"Open " + l.student}
                      >
                        <ArrowUpRight size={17} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title="No enquiries found"
            description="Try a different name or clear your filters."
            action={
              <button
                className="button secondary"
                onClick={() => {
                  setSearch("");
                  setStage("");
                  setGrade("");
                  setPage(0);
                }}
              >
                Clear filters
              </button>
            }
          />
        )}
        <div className="pagination">
          <span>
            {matches.length
              ? `${page * 10 + 1} to ${Math.min(page * 10 + 10, matches.length)} of ${matches.length}`
              : "0 enquiries"}
          </span>
          <div className="button-row">
            <button
              className="button secondary compact"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <button
              className="button secondary compact"
              disabled={(page + 1) * 10 >= matches.length}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
export function AddEnquiry() {
  const { data, command, setDirty } = useApp();
  const router = useRouter();
  const [phone, setPhone] = useState(""),
    [ready, setReady] = useState(false),
    [more, setMore] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [separate, setSeparate] = useState(false);
  const matches =
    phone.replace(/\D/g, "").length >= 8
      ? data.leads.filter((l) => l.phone.includes(phone.replace(/\D/g, "")))
      : [];
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const fields = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const result = await command({ type: "create", ...fields, phone, ready });
      router.push("/admissions/leads/" + result.id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Link href="/admissions/leads" className="back-link">
        <ArrowLeft size={15} />
        Back to enquiries
      </Link>
      <PageTitle
        title="Add enquiry"
        description="Just the essentials. We'll take care of assigning the next step."
      />
      <div className="capture-layout">
        <form
          className="capture-form panel"
          onSubmit={submit}
          onChange={() => setDirty(true)}
        >
          <div className="form-section">
            <div className="section-number">01</div>
            <div className="section-content">
              <h2>Who should we contact?</h2>
              <p className="section-description">
                We'll check for an existing enquiry using this number.
              </p>
              <div className="form-grid">
                <Field label="Parent's phone number *">
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="e.g. 9000012345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    autoComplete="tel"
                  />
                </Field>
                <Field label="Parent / guardian name *">
                  <input
                    name="parent"
                    required
                    placeholder="Full name"
                    autoComplete="off"
                  />
                </Field>
              </div>
              {matches.length > 0 && (
                <div className="match-panel">
                  <strong>
                    {matches.length} existing{" "}
                    {matches.length === 1 ? "enquiry" : "enquiries"} with this
                    number
                  </strong>
                  {matches.map((l) => (
                    <Link href={"/admissions/leads/" + l.id} key={l.id}>
                      {l.student} · Grade {l.grade}
                      <ArrowUpRight size={15} />
                    </Link>
                  ))}
                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={separate}
                      onChange={(e) => setSeparate(e.target.checked)}
                    />
                    This is a different child or application
                  </label>
                  {separate && (
                    <Field label="Reason for separate application">
                      <input
                        name="duplicateReason"
                        required
                        placeholder="For example, enquiry for a sibling"
                      />
                    </Field>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="form-section">
            <div className="section-number">02</div>
            <div className="section-content">
              <h2>A little about the student</h2>
              <div className="form-grid">
                <Field label="Student's full name *">
                  <input required name="student" placeholder="Full name" />
                </Field>
                <Field label="Applying for grade *">
                  <select name="grade" defaultValue="" required>
                    <option value="" disabled>
                      Select grade
                    </option>
                    {grades.map((g) => (
                      <option value={g} key={g}>
                        Grade {g}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="How did they enquire? *">
                  <select name="source" defaultValue="Walk-in">
                    {sources.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <div className="read-only-field">
                  <span>Academic year</span>
                  <strong>2027/28</strong>
                  <small>Greenfield School</small>
                </div>
              </div>
              <button
                type="button"
                className="text-button disclosure"
                onClick={() => setMore(!more)}
              >
                <Plus size={15} />
                {more ? "Hide optional details" : "More details (optional)"}
              </button>
              {more && (
                <div className="form-grid expanded-fields">
                  <Field label="Alternate phone">
                    <input type="tel" name="alternate" />
                  </Field>
                  <Field label="Anything the team should know?">
                    <textarea
                      name="note"
                      rows={3}
                      placeholder="For example, best time to contact the parent"
                    />
                  </Field>
                </div>
              )}
            </div>
          </div>
          <div className="form-section">
            <div className="section-number">03</div>
            <div className="section-content">
              <h2>What should happen next?</h2>
              <div className="route-choices">
                <label className={"route-choice " + (!ready ? "chosen" : "")}>
                  <input
                    type="radio"
                    name="route"
                    checked={!ready}
                    onChange={() => setReady(false)}
                  />
                  <span>
                    <strong>Arrange a call</strong>
                    <small>A caller will answer their questions.</small>
                  </span>
                  <Phone size={18} />
                </label>
                <label className={"route-choice " + (ready ? "chosen" : "")}>
                  <input
                    type="radio"
                    name="route"
                    checked={ready}
                    onChange={() => setReady(true)}
                  />
                  <span>
                    <strong>Ready for the entrance test</strong>
                    <small>Send directly to the test team.</small>
                  </span>
                  <ArrowRight size={18} />
                </label>
              </div>
            </div>
          </div>
          <ErrorText message={error} />
          <div className="form-footer">
            <span>* Required information</span>
            <Submit busy={busy} label="Save enquiry" next />
          </div>
        </form>
        <aside className="capture-aside">
          <div className="aside-line" />
          <h3>What happens next?</h3>
          <p>
            {ready
              ? "The test team receives this enquiry and schedules the entrance test."
              : "An available caller receives this enquiry and contacts the parent."}
          </p>
          <p>
            You can check the assigned person and progress from the enquiry
            record.
          </p>
          <div className="quiet-note">
            Already spoken to this parent?
            <br />
            Check the matches before adding a new enquiry.
          </div>
        </aside>
      </div>
    </>
  );
}
export function LeadDetail({ id }: { id: string }) {
  const { data, command, setDirty } = useApp();
  const lead = data.leads.find((l) => l.id === id);
  const [tab, setTab] = useState("activity"),
    [note, setNote] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [callback, setCallback] = useState(false),
    [due, setDue] = useState(dateInputValue()),
    [callbackNote, setCallbackNote] = useState("");
  if (!lead)
    return (
      <Empty
        title="Enquiry not available"
        description="It may belong to another team or have been reassigned."
        action={
          <Link href="/admissions" className="button secondary">
            Return to workspace
          </Link>
        }
      />
    );
  const caller = data.users.find((u) => u.id === lead.caller);
  const taskTeam = isCalling(lead)
    ? "Calling team"
    : ["READY_FOR_CBT", "CBT_SCHEDULED", "CBT_COMPLETED"].includes(lead.stage)
      ? "Test team"
      : lead.stage === "ADMISSION_IN_PROGRESS"
        ? "Admissions team"
        : "Completed";
  async function saveNote(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await command({
        type: "note",
        id: lead!.id,
        version: lead!.version,
        note,
      });
      setNote("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Link href="/admissions/leads" className="back-link">
        <ArrowLeft size={15} />
        Back to enquiries
      </Link>
      <PageTitle
        eyebrow={lead.id}
        title={lead.student}
        description={"Grade " + lead.grade + " · Academic year " + lead.cycle}
        action={<Badge lead={lead} />}
      />
      <div className="record-layout">
        <section className="panel record-main">
          <div className="contact-strip">
            <span className="avatar">
              <UserRound size={22} />
            </span>
            <div>
              <small>PARENT / GUARDIAN</small>
              <h2>{lead.parent}</h2>
              <a href={"tel:" + lead.phone} className="phone-link">
                {lead.phone}
              </a>
            </div>
            <a className="button secondary" href={"tel:" + lead.phone}>
              <Phone size={17} />
              Call parent
            </a>
            <WhatsAppContact lead={lead} />
          </div>
          <div className="tabs">
            <button
              className={tab === "activity" ? "active" : ""}
              onClick={() => setTab("activity")}
            >
              Activity
            </button>
            <button
              className={tab === "details" ? "active" : ""}
              onClick={() => setTab("details")}
            >
              Details
            </button>
          </div>
          {tab === "activity" ? (
            <div className="record-body">
              <form onSubmit={saveNote} className="note-form">
                <label htmlFor="internal-note">Leave a note for the team</label>
                <textarea
                  id="internal-note"
                  value={note}
                  onChange={(e) => {
                    setNote(e.target.value);
                    setDirty(true);
                  }}
                  required
                  placeholder="An internal note. Nothing is sent to the parent."
                  rows={3}
                />
                <div>
                  <ErrorText message={error} />
                  <button
                    disabled={busy || !note.trim()}
                    className="button secondary"
                    type="submit"
                  >
                    {busy ? "Saving…" : "Add note"}
                  </button>
                </div>
              </form>
              <h3 className="timeline-title">Conversation & history</h3>
              <div className="timeline">
                {lead.history
                  .slice()
                  .reverse()
                  .map((a) => (
                    <div key={a.id} className="timeline-item">
                      <span className="timeline-icon">
                        <MessageSquare size={15} />
                      </span>
                      <div>
                        <div className="timeline-meta">
                          <strong>{a.actor}</strong>
                          <time>{timeLabel(a.at)}</time>
                        </div>
                        <p>{a.text}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="record-body detail-grid">
              {[
                ["Student", lead.student],
                ["Grade", "Grade " + lead.grade],
                ["Parent", lead.parent],
                ["Phone", lead.phone],
                ["Alternate phone", lead.alternate || "Not provided"],
                ["Source", lead.source],
                ["Year", lead.cycle],
                ["Created", timeLabel(lead.created)],
              ].map(([label, value]) => (
                <div key={label}>
                  <small>{label}</small>
                  <p>{value}</p>
                </div>
              ))}
            </div>
          )}
        </section>
        <aside>
          <section className="panel next-action-panel">
            <div className="section-kicker">
              <Clock3 size={16} />
              NEXT STEP
            </div>
            <h2>{lead.nextAction || "No pending action"}</h2>
            {lead.due && <p className="due-time">{timeLabel(lead.due)}</p>}
            {lead.requested && (
              <span className="subtle-tag">Requested by parent</span>
            )}
            <div className="owner-summary">
              <small>Responsible team</small>
              <strong>{taskTeam}</strong>
              {caller && (
                <>
                  <small>Calling contact</small>
                  <span>{caller.name}</span>
                </>
              )}
            </div>
            {isCalling(lead) &&
              ["clerk", "caller", "manager"].includes(data.user.role) && (
                <button
                  className="button secondary full"
                  onClick={() => setCallback(true)}
                >
                  Request callback
                </button>
              )}
            {isCalling(lead) &&
              ["clerk", "manager"].includes(data.user.role) && (
                <button
                  className="text-button"
                  onClick={async () => {
                    try {
                      await command({
                        type: "handover",
                        id: lead.id,
                        version: lead.version,
                      });
                    } catch (e) {
                      setError((e as Error).message);
                    }
                  }}
                >
                  Ready for test <ArrowRight size={15} />
                </button>
              )}
            {data.user.role === "caller" && isCalling(lead) && (
              <Link
                href={"/admissions/my-work?lead=" + lead.id}
                className="button primary full"
              >
                Record a call
              </Link>
            )}
            {isClosed(lead) && <p className="closure-note">{lead.closure}</p>}
            <ManageLead lead={lead} />
          </section>
        </aside>
      </div>
      {callback && (
        <Modal
          title="When should we call?"
          description={lead.parent + " · " + lead.student}
          onClose={() => setCallback(false)}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              try {
                await command({
                  type: "callback",
                  id: lead.id,
                  version: lead.version,
                  due: fromSchoolTime(due),
                  note: callbackNote,
                });
                setCallback(false);
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <Field
              label="Callback date and time"
              hint="School time · India Standard Time (IST)"
            >
              <input
                type="datetime-local"
                required
                value={due}
                onChange={(e) => setDue(e.target.value)}
              />
            </Field>
            <Field label="What did the parent say?">
              <textarea
                value={callbackNote}
                onChange={(e) => setCallbackNote(e.target.value)}
                rows={3}
              />
            </Field>
            <ErrorText message={error} />
            <div className="dialog-footer">
              <button
                type="button"
                className="button secondary"
                onClick={() => setCallback(false)}
              >
                Cancel
              </button>
              <Submit busy={busy} label="Schedule callback" />
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
