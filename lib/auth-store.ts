// lib/auth-store.ts
export interface SavedChartEntry { id: string; hoTen: string; gioiTinh: string; ngay: number; thang: number; nam: number; gio: string; namXem: number; }
export interface UserAccount { id: string; displayName: string; username: string; passHash: string; savedCharts: SavedChartEntry[]; }

const USERS_KEY = "tuvi_users_db_v1";
const SESSION_KEY = "tuvi_active_user_v1";

async function hashPass(pw: string): Promise<string> {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("tuvi_salt_" + pw));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getAllUsers(): Record<string, UserAccount> {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem(USERS_KEY) || "{}"); } catch { return {}; }
}

function cacheLocalUser(u: UserAccount) {
    const users = getAllUsers();
    users[u.id] = u;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(SESSION_KEY, u.id);
    window.dispatchEvent(new Event("tuvi-auth-changed"));
}

async function callAuthApi(payload: any): Promise<UserAccount> {
    const res = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || "Lỗi đồng bộ tài khoản Cloud");
    cacheLocalUser(data.user);
    return data.user;
}

export function listLocalUsers(): UserAccount[] { return Object.values(getAllUsers()); }
export function getCurrentUser(): UserAccount | null {
    if (typeof window === "undefined") return null;
    try { const id = localStorage.getItem(SESSION_KEY); return id ? getAllUsers()[id] || null : null; } catch { return null; }
}

export async function registerUser(displayName: string, username: string, password: string): Promise<UserAccount> {
    const id = username.trim().toLowerCase().replace(/[^a-z0-9_@.-]/g, "");
    if (id.length < 3) throw new Error("Tên đăng nhập tối thiểu 3 ký tự");
    if (password.length < 4) throw new Error("Mật khẩu tối thiểu 4 ký tự");
    return await callAuthApi({ action: "register", id, displayName: displayName.trim() || id, passHash: await hashPass(password) });
}

export async function loginUser(username: string, password: string): Promise<UserAccount> {
    const id = username.trim().toLowerCase();
    return await callAuthApi({ action: "login", id, passHash: await hashPass(password) });
}

export async function resetUserPassword(username: string, newPassword: string): Promise<UserAccount> {
    const id = username.trim().toLowerCase();
    if (newPassword.length < 4) throw new Error("Mật khẩu mới tối thiểu 4 ký tự");
    return await callAuthApi({ action: "reset", id, passHash: await hashPass(newPassword) });
}

export function logoutUser(): void {
    if (typeof window !== "undefined") { localStorage.removeItem(SESSION_KEY); window.dispatchEvent(new Event("tuvi-auth-changed")); }
}

export async function saveChartToAccount(entry: Omit<SavedChartEntry, "id">): Promise<void> {
    const user = getCurrentUser();
    if (!user) return;
    const chartId = `${entry.hoTen}_${entry.ngay}_${entry.thang}_${entry.nam}_${entry.gio}`.toLowerCase();
    const nextCharts = [{ ...entry, id: chartId }, ...(user.savedCharts || []).filter((c) => c.id !== chartId)].slice(0, 15);
    cacheLocalUser({ ...user, savedCharts: nextCharts });
    await callAuthApi({ action: "sync_charts", id: user.id, savedCharts: nextCharts }).catch(() => { });
}