"use client";
import { useState } from "react";
import { Lead, isCalling, isClosed } from "@/lib/types";
import { useApp } from "./context";
import {
  Modal,
  Field,
  Submit,
  ErrorText,
  dateInputValue,
  fromSchoolTime,
} from "./ui";
export function ManageLead({ lead }: { lead: Lead }) {
  const { data, command } = useApp();
  const [action, setAction] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  if (!["clerk", "manager"].includes(data.user.role)) return null;
  return (
    <>
      <details className="manage-actions">
        <summary>More actions</summary>
        <button
          className="text-button"
          onClick={() => {
            setError("");
            setAction("contact");
          }}
        >
          Edit contact details
        </button>
        {data.user.role === "manager" && isCalling(lead) && (
          <button
            className="text-button"
            onClick={() => {
              setError("");
              setAction("assign");
            }}
          >
            Change caller
          </button>
        )}
        {data.user.role === "manager" && isClosed(lead) && (
          <button
            className="text-button"
            onClick={() => {
              setError("");
              setAction("reopen");
            }}
          >
            Reopen enquiry
          </button>
        )}
      </details>
      {action && (
        <Modal
          title={
            action === "contact"
              ? "Edit contact details"
              : action === "assign"
                ? "Change assigned caller"
                : "Reopen enquiry"
          }
          description={lead.student + " · " + lead.id}
          onClose={() => setAction("")}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const f = Object.fromEntries(new FormData(e.currentTarget));
              setBusy(true);
              setError("");
              try {
                await command({
                  type: action,
                  id: lead.id,
                  version: lead.version,
                  ids: [lead.id],
                  ...f,
                  due: f.due ? fromSchoolTime(String(f.due)) : undefined,
                });
                setAction("");
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {action === "contact" ? (
              <>
                <Field label="Parent / guardian name">
                  <input name="parent" required defaultValue={lead.parent} />
                </Field>
                <Field label="Phone number">
                  <input
                    name="phone"
                    type="tel"
                    required
                    defaultValue={lead.phone}
                  />
                </Field>
                <Field label="Alternate phone (optional)">
                  <input
                    name="alternate"
                    type="tel"
                    defaultValue={lead.alternate}
                  />
                </Field>
              </>
            ) : action === "assign" ? (
              <>
                <Field label="New caller">
                  <select name="target" defaultValue="" required>
                    <option value="" disabled>
                      Choose an available caller
                    </option>
                    {data.users
                      .filter(
                        (u) =>
                          u.role === "caller" &&
                          u.available &&
                          u.id !== lead.caller,
                      )
                      .map((u) => (
                        <option value={u.id} key={u.id}>
                          {u.name}
                        </option>
                      ))}
                  </select>
                </Field>
                <Field label="Reason">
                  <textarea name="reason" required rows={3} />
                </Field>
                <p className="muted">
                  Existing callback times and conversation history stay with the
                  enquiry.
                </p>
              </>
            ) : (
              <>
                <Field label="Reason for reopening">
                  <textarea name="reason" required rows={3} />
                </Field>
                <Field label="Next callback" hint="School time · IST">
                  <input
                    name="due"
                    type="datetime-local"
                    required
                    defaultValue={dateInputValue(
                      new Date(Date.parse(data.now) + 3600000).toISOString(),
                    )}
                  />
                </Field>
              </>
            )}
            <ErrorText message={error} />
            <div className="dialog-footer">
              <button
                className="button secondary"
                type="button"
                onClick={() => setAction("")}
              >
                Cancel
              </button>
              <Submit
                busy={busy}
                label={
                  action === "contact"
                    ? "Save contact"
                    : action === "assign"
                      ? "Confirm change"
                      : "Reopen enquiry"
                }
              />
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
