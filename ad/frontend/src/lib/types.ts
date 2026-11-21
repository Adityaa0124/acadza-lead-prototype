export type Role = "clerk" | "caller" | "manager" | "test" | "admissions";
export type DocumentStatus =
  | "NOT_STARTED"
  | "RECEIVED"
  | "VERIFIED"
  | "NEEDS_RESUBMISSION";
export type Stage =
  | "ENQUIRY"
  | "INTERESTED"
  | "READY_FOR_CBT"
  | "CBT_SCHEDULED"
  | "CBT_COMPLETED"
  | "ADMISSION_IN_PROGRESS"
  | "CONVERTED"
  | "LOST"
  | "INVALID";
export interface User {
  id: string;
  name: string;
  role: Role;
  school: string;
  capacity: number;
  available: boolean;
}
export interface Activity {
  id: string;
  at: string;
  actor: string;
  text: string;
}
export interface Lead {
  id: string;
  school: string;
  student: string;
  parent: string;
  phone: string;
  alternate: string;
  grade: string;
  source: string;
  cycle: string;
  stage: Stage;
  caller: string | null;
  nextAction: string;
  due: string | null;
  requested: boolean;
  lastOutcome: string;
  created: string;
  updated: string;
  version: number;
  history: Activity[];
  booking?: {
    at: string;
    test: string;
    location: string;
    attendance: string;
    score?: number;
    max?: number;
  };
  closure?: string;
  documentStatus?: DocumentStatus;
  documentNote?: string;
}
export interface Notice {
  id: string;
  user: string;
  lead: string;
  text: string;
  at: string;
  read: boolean;
}
export interface ImportRow {
  row: number;
  student: string;
  parent: string;
  phone: string;
  grade: string;
  source: string;
  error?: string;
  duplicate?: string;
  status: "ready" | "invalid" | "duplicate" | "created" | "skipped";
  lead?: string;
}
export interface Batch {
  id: string;
  school: string;
  file: string;
  created: string;
  actor: string;
  status: "review" | "complete";
  rows: ImportRow[];
}
export interface State {
  users: User[];
  leads: Lead[];
  notices: Notice[];
  batches: Batch[];
  offset: number;
  idempotency: Record<string, { payload: string; result: unknown }>;
  cursor: number;
}
export interface Snapshot {
  user: User;
  users: User[];
  leads: Lead[];
  notices: Notice[];
  batches: Batch[];
  now: string;
  demo: boolean;
}
export interface Command {
  type: string;
  id?: string;
  version?: number;
  [key: string]: unknown;
}
export const stageLabels: Record<Stage, string> = {
  ENQUIRY: "New enquiry",
  INTERESTED: "Interested",
  READY_FOR_CBT: "Ready for test",
  CBT_SCHEDULED: "Test scheduled",
  CBT_COMPLETED: "Test completed",
  ADMISSION_IN_PROGRESS: "Admission in progress",
  CONVERTED: "Admission completed",
  LOST: "Closed, not admitted",
  INVALID: "Invalid enquiry",
};
export const roles: Record<Role, string> = {
  clerk: "Front desk",
  caller: "Calling team",
  manager: "Admissions manager",
  test: "Test team",
  admissions: "Admissions team",
};
export const documentStatusLabels: Record<DocumentStatus, string> = {
  NOT_STARTED: "Not reviewed",
  RECEIVED: "Documents received",
  VERIFIED: "Documents verified",
  NEEDS_RESUBMISSION: "Needs more documents",
};
export const sources = [
  "Walk-in",
  "Phone",
  "Website",
  "Referral",
  "School event",
];
export const grades = ["6", "7", "8", "9", "10", "11", "12"];
export const isCalling = (l: Lead) =>
  ["ENQUIRY", "INTERESTED"].includes(l.stage);
export const isClosed = (l: Lead) =>
  ["CONVERTED", "LOST", "INVALID"].includes(l.stage);
export function timeLabel(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(value)) + " IST"
    : "Not scheduled";
}
export function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((x) => x[0])
    .join("");
}
