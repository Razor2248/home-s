import { useSyncExternalStore } from "react";
import type { DB, User } from "./types";
import { BASE_DISTRICTS, seedDB } from "./seed";

const KEY = "home_services_db_v1";
const SESSION_KEY = "home_services_session_v1";

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

function load(): DB {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DB;
      // tương thích dữ liệu lưu từ phiên bản cũ (chưa có payments / settings)
      return {
        ...parsed,
        payments: parsed.payments ?? [],
        settings: parsed.settings ?? { platformFee: 10 },
        categoryChanges: parsed.categoryChanges ?? [],
        passwordResets: parsed.passwordResets ?? [],
        districts: parsed.districts ?? BASE_DISTRICTS,
      };
    }
  } catch {
    /* ignore */
  }
  const fresh = seedDB();
  try {
    localStorage.setItem(KEY, JSON.stringify(fresh));
  } catch {
    /* ignore */
  }
  return fresh;
}

let state: DB = load();

export function getDB(): DB {
  return state;
}

/** Thay đổi dữ liệu: fn nhận bản sao nông của db, phải gán lại mảng mới khi sửa. */
export function mutate(fn: (draft: DB) => void) {
  const draft: DB = { ...state };
  fn(draft);
  state = draft;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  emit();
}

export function useDB(): DB {
  return useSyncExternalStore(subscribe, () => state);
}

/* ---------- session ---------- */
export function getSessionId(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export function setSession(userId: string | null) {
  try {
    if (userId) localStorage.setItem(SESSION_KEY, userId);
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
  emit();
}

export function useSession(): User | null {
  const db = useDB();
  const id = getSessionId();
  return db.users.find((u) => u.id === id) ?? null;
}

/**
 * Nạp dữ liệu từ server vào store (chế độ API).
 * users được gộp theo id (giữ bản server), các collection khác thay mới.
 */
export function hydrateDB(partial: Partial<DB>) {
  mutate((d) => {
    if (partial.users) {
      const serverUsers = new Map(partial.users.map((u) => [u.id, u]));
      d.users = [
        ...partial.users,
        ...d.users.filter((u) => !serverUsers.has(u.id)),
      ];
    }
    if (partial.categories) d.categories = partial.categories;
    if (partial.workers) d.workers = partial.workers;
    if (partial.jobs) d.jobs = partial.jobs;
    if (partial.quotes) d.quotes = partial.quotes;
    if (partial.reviews) d.reviews = partial.reviews;
    if (partial.chats) d.chats = partial.chats;
    if (partial.notifications) d.notifications = partial.notifications;
    if (partial.payments) d.payments = partial.payments;
    if (partial.settings) d.settings = partial.settings;
    if (partial.categoryChanges) d.categoryChanges = partial.categoryChanges;
    if (partial.districts) d.districts = partial.districts;
  });
}

export function resetDemo() {
  state = seedDB();
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
  emit();
}
