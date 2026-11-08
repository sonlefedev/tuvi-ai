// lib/auth-store.ts
export interface SavedChartEntry {
    id: string;
    hoTen: string;
    gioiTinh: string;
    ngay: number;
    thang: number;
    nam: number;
    gio: string;
    namXem: number;
}

export interface UserAccount {
    id: string;
    displayName: string;
    username: string;
    passHash: string;
    savedCharts: SavedChartEntry[];
}

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

export function getCurrentUser(): UserAccount | null {
    if (typeof window === "undefined") return null;
    try {
        const id = localStorage.getItem(SESSION_KEY);
        return id ? getAllUsers()[id] || null : null;
    } catch { return null; }
}

export async function registerUser(displayName: string, username: string, password: string): Promise<UserAccount> {
    const id = username.trim().toLowerCase().replace(/[^a-z0-9_@.-]/g, "");
    if (id.length < 3) throw new Error("Tên đăng nhập tối thiểu 3 ký tự");
    if (password.length < 4) throw new Error("Mật khẩu tối thiểu 4 ký tự");
    const users = getAllUsers();
    if (users[id]) throw new Error("Tài khoản này đã tồn tại");

    const user: UserAccount = { id, displayName: displayName.trim() || id, username: id, passHash: await hashPass(password), savedCharts: [] };
    users[id] = user;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(SESSION_KEY, id);
    window.dispatchEvent(new Event("tuvi-auth-changed"));
    return user;
}

export async function loginUser(username: string, password: string): Promise<UserAccount> {
    const id = username.trim().toLowerCase();
    const user = getAllUsers()[id];
    if (!user || user.passHash !== (await hashPass(password))) throw new Error("Sai tên đăng nhập hoặc mật khẩu");
    localStorage.setItem(SESSION_KEY, id);
    window.dispatchEvent(new Event("tuvi-auth-changed"));
    return user;
}

export function logoutUser(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new Event("tuvi-auth-changed"));
}

export function saveChartToAccount(entry: Omit<SavedChartEntry, "id">): void {
    const user = getCurrentUser();
    if (!user) return;
    const users = getAllUsers();
    const chartId = `${entry.hoTen}_${entry.ngay}_${entry.thang}_${entry.nam}_${entry.gio}`.toLowerCase();
    const filtered = (user.savedCharts || []).filter((c) => c.id !== chartId);
    users[user.id] = { ...user, savedCharts: [{ ...entry, id: chartId }, ...filtered].slice(0, 15) };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    window.dispatchEvent(new Event("tuvi-auth-changed"));
}