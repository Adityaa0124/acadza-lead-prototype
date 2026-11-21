"use client";
import {
  useEffect,
  useRef,
  useId,
  Children,
  cloneElement,
  type ReactElement,
} from "react";
import { X, ArrowRight, Inbox, LoaderCircle } from "lucide-react";
import { Lead, stageLabels } from "@/lib/types";
export function Badge({ lead }: { lead: Lead }) {
  const tone =
    lead.stage === "CONVERTED"
      ? "success"
      : ["LOST", "INVALID"].includes(lead.stage)
        ? "neutral"
        : lead.stage === "INTERESTED"
          ? "blue"
          : lead.stage === "ADMISSION_IN_PROGRESS"
            ? "amber"
            : "neutral";
  return <span className={"badge " + tone}>{stageLabels[lead.stage]}</span>;
}
export function PageTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {action && <div className="heading-actions">{action}</div>}
    </header>
  );
}
export function Empty({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Inbox size={25} />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  const generatedId = useId();
  const control = Children.only(children) as ReactElement<{
    id?: string;
    "aria-describedby"?: string;
  }>;
  const controlId = control.props.id || generatedId;
  const hintId = hint ? generatedId + "-hint" : undefined;
  return (
    <div className="field">
      <label htmlFor={controlId}>{label}</label>
      {cloneElement(control, {
        id: controlId,
        "aria-describedby":
          [control.props["aria-describedby"], hintId]
            .filter(Boolean)
            .join(" ") || undefined,
      })}
      {hint && <small id={hintId}>{hint}</small>}
    </div>
  );
}
export function Pending({
  busy,
  children,
}: {
  busy: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      {busy && <LoaderCircle aria-hidden="true" size={16} className="spin" />}
      {children}
    </>
  );
}
export function Modal({
  title,
  description,
  children,
  onClose,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    ref.current?.showModal();
    const dialog = ref.current;
    dialog
      ?.querySelector<HTMLElement>(
        "input:not([disabled]), select:not([disabled]), textarea:not([disabled])",
      )
      ?.focus();
    return () => {
      dialog?.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]',
          ),
        ).filter((element) => element.getClientRects().length > 0);
        const first = controls[0],
          last = controls.at(-1);
        if (!first) {
          event.preventDefault();
          return;
        }
        if (
          event.shiftKey &&
          (document.activeElement === first ||
            !event.currentTarget.contains(document.activeElement))
        ) {
          event.preventDefault();
          last?.focus();
        } else if (
          !event.shiftKey &&
          (document.activeElement === last ||
            !event.currentTarget.contains(document.activeElement))
        ) {
          event.preventDefault();
          first.focus();
        }
      }}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <div className="modal-header">
        <div>
          <h2 id={titleId}>{title}</h2>
          {description && <p id={descriptionId}>{description}</p>}
        </div>
        <button
          type="button"
          className="icon-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>
      <div className="modal-body">{children}</div>
    </dialog>
  );
}
export function Submit({
  busy,
  label = "Save",
  next = false,
  disabled = false,
}: {
  busy: boolean;
  label?: string;
  next?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      className="button primary"
      disabled={busy || disabled}
      aria-busy={busy}
      type="submit"
    >
      <Pending busy={busy}>{busy ? "Saving…" : label}</Pending>
      {next && !busy && <ArrowRight size={17} />}
    </button>
  );
}
export function ErrorText({ message }: { message: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (message) ref.current?.focus();
  }, [message]);
  return message ? (
    <div ref={ref} tabIndex={-1} role="alert" className="error-message">
      {message}
    </div>
  ) : null;
}
export function dateInputValue(value?: string) {
  const date = value ? new Date(value) : new Date(Date.now() + 3600000);
  return new Date(date.getTime() + 330 * 60000).toISOString().slice(0, 16);
}
export function fromSchoolTime(value: string) {
  return new Date(value + ":00+05:30").toISOString();
}
