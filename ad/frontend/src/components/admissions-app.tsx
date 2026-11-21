"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Phone,
  Users,
  Upload,
  ClipboardCheck,
  SlidersHorizontal,
  BarChart3,
  Settings,
  Bell,
  ChevronDown,
  ArrowUpRight,
  Menu,
  X,
  Check,
  FlaskConical,
  ArrowRight,
  Clock3,
} from "lucide-react";
import {
  Command,
  Snapshot,
  User,
  roles,
  initials,
  timeLabel,
} from "@/lib/types";
import { AppContext } from "./context";
import { Empty, Modal, Pending } from "./ui";
import { Directory, AddEnquiry, LeadDetail } from "./lead-pages";
import { CallerWorkspace } from "./caller-workspace";
import {
  Assignments,
  TestQueue,
  AdmissionQueue,
  Reports,
  SettingsPage,
  Imports,
} from "./operations";
const nav = [
  { path: "my-work", label: "My calls", icon: Phone, roles: ["caller"] },
  {
    path: "leads",
    label: "Enquiries",
    icon: Users,
    roles: ["clerk", "caller", "manager"],
  },
  {
    path: "imports",
    label: "Imports",
    icon: Upload,
    roles: ["clerk", "manager"],
  },
  {
    path: "assignments",
    label: "Assignments",
    icon: SlidersHorizontal,
    roles: ["manager"],
  },
  {
    path: "cbt",
    label: "Entrance tests",
    icon: ClipboardCheck,
    roles: ["test", "manager"],
  },
  {
    path: "admission-queue",
    label: "Admissions",
    icon: Check,
    roles: ["admissions", "manager"],
  },
  { path: "reports", label: "Reports", icon: BarChart3, roles: ["manager"] },
  { path: "settings", label: "Settings", icon: Settings, roles: ["manager"] },
];
export default function AdmissionsApp() {
  const [data, setData] = useState<Snapshot | null>(null),
    [error, setError] = useState(""),
    [toast, setToast] = useState(""),
    [demo, setDemo] = useState(false),
    [notices, setNotices] = useState(false),
    [menu, setMenu] = useState(false),
    [profile, setProfile] = useState(false),
    [dirty, setDirty] = useState(false),
    [allUsers, setAllUsers] = useState<User[]>([]),
    [demoBusy, setDemoBusy] = useState(false),
    [failNext, setFailNext] = useState(false);
  const pathname = usePathname(),
    router = useRouter(),
    keys = useRef(new Map<string, string>());
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  const refresh = useCallback(async () => {
    const r = await fetch("/api/v1/state", { cache: "no-store" });
    const json = await r.json();
    if (!r.ok) throw new Error(json.error);
    setData(json);
    setError("");
  }, []);
  useEffect(() => {
    refresh().catch((e) => setError(e.message));
    const timer = setInterval(() => {
      if (!document.hidden) refresh().catch(() => {});
    }, 30000);
    const focus = () => {
      refresh().catch(() => {});
    };
    window.addEventListener("focus", focus);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", focus);
    };
  }, [refresh]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 5500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);
  const request = async (path: string, body: unknown) => {
    const response = await fetch("/api/v1/" + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    return result;
  };
  const command = async (c: Command) => {
    if (failNext) {
      setFailNext(false);
      throw new Error(
        "Demo save failure. Your entries are still here. Try again.",
      );
    }
    const payload = JSON.stringify(c);
    let key = keys.current.get(payload);
    if (!key) {
      key = crypto.randomUUID();
      keys.current.set(payload, key);
    }
    const response = await fetch("/api/v1/commands", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": key },
      body: payload,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    setDirty(false);
    await refresh();
    setToast(result.message);
    return result;
  };
  const showDemo = async () => {
    try {
      const response = await fetch("/api/v1/demo-users");
      setAllUsers(await response.json());
      setDemo(true);
    } catch {
      setToast("Could not load demo controls.");
    }
  };
  const demoAction = async (body: Record<string, unknown>) => {
    if (
      dirty &&
      !confirm("Discard the unsaved changes before changing demo state?")
    )
      return;
    setDemoBusy(true);
    try {
      if (body.action === "identity") setData(null);
      await request("demo", body);
      setDirty(false);
      await refresh();
      if (body.action === "identity") {
        const user = allUsers.find((u) => u.id === body.user);
        router.push(
          "/admissions/" +
            (user?.role === "caller"
              ? "my-work"
              : user?.role === "test"
                ? "cbt"
                : user?.role === "admissions"
                  ? "admission-queue"
                  : user?.role === "manager"
                    ? "assignments"
                    : "leads"),
        );
      }
      setDemo(false);
      setToast(
        body.action === "advance"
          ? "Demo clock advanced."
          : "Demo workspace updated.",
      );
    } catch (e) {
      setToast((e as Error).message);
    } finally {
      setDemoBusy(false);
    }
  };
  useEffect(() => {
    if (data && pathname === "/admissions") {
      const destination =
        data.user.role === "caller"
          ? "my-work"
          : data.user.role === "test"
            ? "cbt"
            : data.user.role === "admissions"
              ? "admission-queue"
              : data.user.role === "manager"
                ? "assignments"
                : "leads";
      router.replace("/admissions/" + destination);
    }
  }, [data?.user.id, pathname, router]);
  if (!data)
    return (
      <main className="startup">
        <div className="brand-word">
          ACADZA<span>ADMISSIONS</span>
        </div>
        {error ? (
          <Empty
            title="Unable to open the workspace"
            description={error}
            action={
              <button
                className="button primary"
                onClick={() => refresh().catch((e) => setError(e.message))}
              >
                Try again
              </button>
            }
          />
        ) : (
          <p className="loading-text">Opening your workspace…</p>
        )}
      </main>
    );
  const section = pathname.split("/")[2] || "my-work";
  const allowed =
    nav.some(
      (item) => item.path === section && item.roles.includes(data.user.role),
    ) ||
    (section === "leads" &&
      ["test", "admissions"].includes(data.user.role) &&
      pathname.split("/").length > 3);
  const unread = data.notices.filter((n) => !n.read).length;
  const navigate = (e: React.MouseEvent) => {
    const a = (e.target as HTMLElement).closest("a");
    if (
      a &&
      a.getAttribute("href")?.startsWith("/admissions") &&
      dirtyRef.current
    ) {
      if (!confirm("You have unsaved changes. Discard them and leave?"))
        e.preventDefault();
      else setDirty(false);
    }
    setMenu(false);
  };
  let page: React.ReactNode = (
    <Empty
      title="This page is not part of your role"
      description="Choose a page from your navigation, or switch demo identity."
    />
  );
  if (allowed) {
    if (section === "my-work") page = <CallerWorkspace />;
    else if (section === "leads")
      page = pathname.endsWith("/new") ? (
        <AddEnquiry />
      ) : pathname.split("/").length > 3 ? (
        <LeadDetail id={pathname.split("/")[3]} />
      ) : (
        <Directory />
      );
    else if (section === "assignments") page = <Assignments />;
    else if (section === "cbt") page = <TestQueue />;
    else if (section === "admission-queue") page = <AdmissionQueue />;
    else if (section === "reports") page = <Reports />;
    else if (section === "settings") page = <SettingsPage />;
    else if (section === "imports") page = <Imports path={pathname} />;
  }
  return (
    <AppContext.Provider
      value={{ data, refresh, command, notify: setToast, setDirty, request }}
    >
      <div className="application" onClickCapture={navigate}>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        {menu && (
          <button
            className="nav-backdrop"
            aria-label="Close navigation"
            onClick={() => setMenu(false)}
          />
        )}
        <aside className={"sidebar " + (menu ? "open" : "")}>
          <Link
            href={
              "/admissions/" +
              (data.user.role === "caller" ? "my-work" : "leads")
            }
            className="brand-word"
            aria-label="Acadza admissions"
          >
            ACADZA<span>ADMISSIONS</span>
          </Link>
          <div className="nav-caption">WORKSPACE</div>
          <nav aria-label="Main navigation">
            {nav
              .filter((n) => n.roles.includes(data.user.role))
              .map((n) => (
                <Link
                  key={n.path}
                  href={"/admissions/" + n.path}
                  className={"nav-item " + (section === n.path ? "active" : "")}
                  aria-current={section === n.path ? "page" : undefined}
                >
                  <n.icon size={19} />
                  <span>{n.label}</span>
                  {n.path === "my-work" && <span className="nav-dot" />}
                </Link>
              ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="school-seal">GS</div>
            <div>
              <strong>
                {data.user.school === "s1"
                  ? "Greenfield School"
                  : "Other demo school"}
              </strong>
              <small>Admissions office</small>
            </div>
          </div>
        </aside>
        <div className="app-main">
          <header className="topbar">
            <div className="topbar-left">
              <button
                className="icon-button mobile-menu"
                aria-label="Open navigation"
                onClick={() => setMenu(true)}
              >
                <Menu size={21} />
              </button>
              <span className="school-title">
                {data.user.school === "s1"
                  ? "Greenfield School"
                  : "Other demo school"}
              </span>
              <span className="header-divider" />
              <span className="year-label">
                Academic year <strong>2027/28</strong>
              </span>
            </div>
            <div className="topbar-right">
              <button className="demo-button" onClick={showDemo}>
                <FlaskConical size={15} />
                Demo
              </button>
              <button
                className="icon-button notification-trigger"
                aria-label={`Notifications, ${unread} unread`}
                onClick={() => setNotices(true)}
              >
                <Bell size={20} />
                {unread > 0 && <span className="notification-dot" />}
              </button>
              <button
                className="profile-button"
                aria-label="Staff profile"
                onClick={() => setProfile(!profile)}
              >
                <span className="avatar small">{initials(data.user.name)}</span>
                <ChevronDown size={14} />
              </button>
              {profile && (
                <div className="profile-popover">
                  <strong>{data.user.name}</strong>
                  <span>{roles[data.user.role]}</span>
                  <small>
                    {data.user.school === "s1"
                      ? "Greenfield School"
                      : "Other demo school"}
                  </small>
                  <button
                    className="text-button"
                    onClick={() => {
                      setProfile(false);
                      showDemo();
                    }}
                  >
                    Switch demo identity <ArrowUpRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </header>
          <main
            id="main-content"
            className={
              "main-content " + (section === "my-work" ? "calling-page" : "")
            }
            key={pathname + data.user.id}
          >
            {page}
          </main>
          <footer className="app-footer">
            <span>Acadza · School admissions</span>
            <span>Synthetic demo data · {timeLabel(data.now)}</span>
          </footer>
        </div>
        {toast && (
          <div className="toast" role="status">
            <Check size={18} />
            <span>{toast}</span>
            <button
              aria-label="Dismiss notification"
              onClick={() => setToast("")}
            >
              <X size={16} />
            </button>
          </div>
        )}
        {notices && (
          <Modal
            title="Notifications"
            description="Updates from your school team"
            onClose={() => setNotices(false)}
          >
            {data.notices.length ? (
              data.notices
                .slice()
                .reverse()
                .map((n) => (
                  <Link
                    href={"/admissions/leads/" + n.lead}
                    key={n.id}
                    className={"notice " + (!n.read ? "unread" : "")}
                    onClick={() => setNotices(false)}
                  >
                    <span>{n.text}</span>
                    <small>{timeLabel(n.at)}</small>
                    <ArrowRight size={16} />
                  </Link>
                ))
            ) : (
              <Empty
                title="You're up to date"
                description="Callback requests and assigned enquiries will appear here."
              />
            )}
            {unread > 0 && (
              <button
                className="button secondary"
                onClick={() =>
                  command({ type: "read-notices" }).catch((e) =>
                    setToast(e.message),
                  )
                }
              >
                Mark all read
              </button>
            )}
          </Modal>
        )}
        {demo && (
          <Modal
            title="Demo controls"
            description="Synthetic data only. Test the same enquiry across staff roles."
            onClose={() => setDemo(false)}
          >
            <label className="field">
              <span>View as</span>
              <select
                value={data.user.id}
                disabled={demoBusy}
                onChange={(e) =>
                  demoAction({ action: "identity", user: e.target.value })
                }
              >
                {allUsers.map((u) => (
                  <option value={u.id} key={u.id}>
                    {u.name} · {roles[u.role]}
                    {u.school !== "s1" ? " · Other school" : ""}
                  </option>
                ))}
              </select>
            </label>
            <div className="demo-section">
              <h3>Callback clock</h3>
              <p>{timeLabel(data.now)}</p>
              <div className="button-row">
                <button
                  className="button secondary"
                  disabled={demoBusy}
                  onClick={() => demoAction({ action: "advance", hours: 1 })}
                >
                  <Clock3 size={16} />
                  Advance 1 hour
                </button>
                <button
                  className="button secondary"
                  disabled={demoBusy}
                  onClick={() => demoAction({ action: "advance", hours: 24 })}
                >
                  Advance 1 day
                </button>
              </div>
            </div>
            <div className="demo-section">
              <h3>Try a save failure</h3>
              <p>The next workflow save will fail without losing your notes.</p>
              <button
                className="button secondary"
                onClick={() => {
                  setFailNext(true);
                  setDemo(false);
                  setToast("The next save will simulate an error.");
                }}
              >
                Fail next save
              </button>
            </div>
            <div className="demo-section">
              <h3>Reset synthetic data</h3>
              <p>This replaces all demo enquiries and callbacks.</p>
              <div className="button-row">
                {[
                  ["small", "Daily workspace"],
                  ["balanced", "1,000 · capacity 100"],
                  ["overflow", "1,000 · capacity 80"],
                ].map(([value, label]) => (
                  <button
                    className="button secondary"
                    key={value}
                    disabled={demoBusy}
                    onClick={() => {
                      if (
                        confirm(
                          "Replace all synthetic demo data with this scenario?",
                        )
                      )
                        demoAction({ action: "reset", scenario: value });
                    }}
                  >
                    <Pending busy={demoBusy}>{label}</Pending>
                  </button>
                ))}
              </div>
            </div>
          </Modal>
        )}
      </div>
    </AppContext.Provider>
  );
}
