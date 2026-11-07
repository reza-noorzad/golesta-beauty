export type AdminRole = "superadmin" | "admin" | "editor";
export type SessionUser = { uid: string; email: string | null };
export type SessionState =
  | { status: "checking" | "anonymous" }
  | { status: "allowed"; uid: string; email: string; role: AdminRole }
  | { status: "error" | "denied"; message: string };
export const SESSION_TIMEOUT_MS = 15_000;
export const SESSION_TIMEOUT_MESSAGE = "Die Zugriffsprüfung dauert zu lange. Bitte prüfe deine Verbindung und versuche es erneut.";

/** Late results, user switches, and disposed observers can never grant access. */
export function monitorAdminSession<User extends SessionUser>(dependencies: {
  subscribe: (next: (user: User | null) => void, fail: () => void) => () => void;
  authorize: (user: User) => Promise<{ uid: string; role: AdminRole }>;
  changed: (state: SessionState) => void;
  timeoutMs?: number;
}) {
  let generation = 0;
  let disposed = false;
  let allowedUid: string | null = null;
  let timer: ReturnType<typeof setTimeout>;
  function begin(showChecking = true) {
    const current = ++generation;
    clearTimeout(timer);
    if (showChecking) dependencies.changed({ status: "checking" });
    timer = setTimeout(() => {
      if (disposed || current !== generation) return;
      generation++;
      allowedUid = null;
      dependencies.changed({ status: "error", message: SESSION_TIMEOUT_MESSAGE });
    }, dependencies.timeoutMs ?? SESSION_TIMEOUT_MS);
    return current;
  }
  begin();
  const stop = dependencies.subscribe((user) => {
    if (disposed) return;
    const current = begin(!user || user.uid !== allowedUid);
    if (!user) { allowedUid = null; clearTimeout(timer); dependencies.changed({ status: "anonymous" }); return; }
    void dependencies.authorize(user).then((session) => {
      if (disposed || current !== generation) return;
      clearTimeout(timer);
      if (session.uid !== user.uid) throw new Error("Die Sitzung konnte nicht bestätigt werden. Bitte erneut anmelden.");
      allowedUid = user.uid;
      dependencies.changed({ status: "allowed", uid: user.uid, email: user.email || "", role: session.role });
    }).catch((error: unknown) => {
      if (disposed || current !== generation) return;
      clearTimeout(timer);
      allowedUid = null;
      const status = error && typeof error === "object" && "status" in error ? error.status : 0;
      dependencies.changed({ status: status === 401 || status === 403 ? "denied" : "error",
        message: error instanceof Error ? error.message : "Die Berechtigung konnte nicht geprüft werden. Bitte erneut versuchen." });
    });
  }, () => {
    if (disposed) return;
    generation++;
    clearTimeout(timer);
    dependencies.changed({ status: "error", message: "Die Anmeldung konnte nicht geladen werden. Bitte erneut versuchen." });
  });
  return () => { disposed = true; generation++; clearTimeout(timer); stop(); };
}

export function adminDestination(value: string | null) {
  return value && /^\/admin(?:\/[a-z0-9-]+)*$/.test(value) && value !== "/admin/login" ? value : "/admin";
}
