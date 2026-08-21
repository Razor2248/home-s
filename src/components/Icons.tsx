import type { ReactElement } from "react";

const P = (d: string, key?: string) => <path d={d} key={key} />;

const PATHS = {
  bolt: P("M13 2 4.5 13.5H11L9.5 22 19 10.5h-6.5L13 2z"),
  droplet: P("M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11z"),
  snow: (
    <>
      {P("M12 2.5v19M2.5 12h19M5 5l14 14M19 5 5 19")}
    </>
  ),
  broom: (
    <>
      {P("M16.5 2.5 11 12.5")}
      {P("M4 21.5l3-8a2.2 2.2 0 0 1 2-1.4h4.2a2.2 2.2 0 0 1 2 1.4l2.3 8H4z")}
      {P("M9 14v7.5M14 14v7.5")}
    </>
  ),
  key: (
    <>
      <circle cx="7.5" cy="15.5" r="4" />
      {P("M10.5 12.5 19.5 3.5M16.5 6.5 19 9M13.8 9.2l2 2")}
    </>
  ),
  paint: (
    <>
      <rect x="3" y="3.5" width="15" height="6" rx="1.5" />
      {P("M18 5.5h1.6A1.4 1.4 0 0 1 21 6.9v3.2a1.9 1.9 0 0 1-1.9 1.9H13v2.5")}
      <rect x="11.4" y="14.5" width="3.2" height="7" rx="1" />
    </>
  ),
  hammer: (
    <>
      {P("M3 21l7.5-7.5")}
      {P("M12.5 3.5 17 8l-3 3-4.5-4.5 3-3z")}
      {P("M17 8l3.5 3.5-2 2L15 10")}
    </>
  ),
  sparkle: (
    <>
      {P("M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9 12 3.5z")}
      {P("M19 16.5v4M17 18.5h4")}
    </>
  ),
  wrench: P("M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"),
  home: (
    <>
      {P("M3 11.5 12 4l9 7.5")}
      {P("M5.5 9.8V20h13V9.8")}
      {P("M10 20v-5.5h4V20")}
    </>
  ),
  bell: (
    <>
      {P("M18 8.5a6 6 0 1 0-12 0c0 6.5-2.5 8-2.5 8h17s-2.5-1.5-2.5-8")}
      {P("M10.3 20.5a1.9 1.9 0 0 0 3.4 0")}
    </>
  ),
  chat: P("M21 11.5a8.4 8.4 0 0 1-8.5 8.3c-1.3 0-2.6-.3-3.7-.8L3 20l1.1-5.2A8.3 8.3 0 1 1 21 11.5z"),
  star: P("M12 2.8l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4L12 17.6l-5.8 3 1.1-6.4-4.7-4.6 6.5-.9L12 2.8z"),
  check: P("M4.5 12.5l5 5L19.5 7"),
  database: (
    <>
      <ellipse cx="12" cy="5.5" rx="7.5" ry="3" />
      {P("M4.5 5.5v13c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-13")}
      {P("M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3")}
    </>
  ),
  code: P("m8 7-5 5 5 5M16 7l5 5-5 5"),
  layers: (
    <>
      {P("M12 3 2.8 8 12 13l9.2-5L12 3z")}
      {P("m3.5 12.5 8.5 4.6 8.5-4.6M3.5 17l8.5 4.6L20.5 17")}
    </>
  ),
  x: P("M6 6l12 12M18 6 6 18"),
  plus: P("M12 5v14M5 12h14"),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      {P("M20.5 20.5 16 16")}
    </>
  ),
  pin: (
    <>
      {P("M12 21.5s-7-5.6-7-11.2a7 7 0 0 1 14 0c0 5.6-7 11.2-7 11.2z")}
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      {P("M12 7v5l3.5 2")}
    </>
  ),
  shield: (
    <>
      {P("M12 3 5 5.8v5.4c0 5 3 8.4 7 9.8 4-1.4 7-4.8 7-9.8V5.8L12 3z")}
      {P("M9 11.8l2 2 4-4")}
    </>
  ),
  chart: P("M4 20h16M7 20v-6.5M12 20V7.5M17 20v-10"),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      {P("M4 21c0-4 3.5-6.5 8-6.5s8 2.5 8 6.5")}
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3.5" />
      {P("M2.5 20c0-3.6 3-5.8 6.5-5.8s6.5 2.2 6.5 5.8")}
      {P("M16 5.5a3.5 3.5 0 0 1 0 6.6M17.5 14.6c2.4.7 4 2.4 4 5.4")}
    </>
  ),
  logout: (
    <>
      {P("M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3")}
      {P("M16 17l5-5-5-5M21 12H9")}
    </>
  ),
  arrowR: P("M4 12h16M14 6l6 6-6 6"),
  send: P("M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"),
  alert: (
    <>
      {P("M12 3.5 2.5 20h19L12 3.5z")}
      {P("M12 9.5V14M12 17h.01")}
    </>
  ),
  trash: P("M4 7h16M9 7V4.5h6V7M6.5 7l1 13.5h9l1-13.5M10 11v6M14 11v6"),
  edit: P("M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"),
  wallet: (
    <>
      <rect x="2.5" y="6" width="19" height="13.5" rx="2.5" />
      {P("M2.5 10h19M16.5 14.5h.01")}
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      {P("M3.5 10h17M8 3v4M16 3v4")}
    </>
  ),
  refresh: P("M3.5 12a8.5 8.5 0 0 1 14.7-5.8L21 9M21 4v5h-5M20.5 12a8.5 8.5 0 0 1-14.7 5.8L3 15M3 20v-5h5"),
  flag: P("M5.5 21.5v-18M5.5 4.5c4-2.6 8 2.6 12.5 0v9.5c-4.5 2.6-8.5-2.6-12.5 0"),
  menu: P("M4 7h16M4 12h16M4 17h16"),
  chevD: P("M6 9.5l6 6 6-6"),
  chevR: P("M9.5 6l6 6-6 6"),
  eye: (
    <>
      {P("M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z")}
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7.5" width="18" height="13" rx="2" />
      {P("M9 7.5V5.5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12.5h18")}
    </>
  ),
  heart: P("M12 20.5S3.5 15.5 3.5 9.6A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8.5 2.6c0 5.9-8.5 10.9-8.5 10.9z"),
  phone: P("M6.5 3h3l1.5 4.5-2 1.5a12 12 0 0 0 6 6l1.5-2 4.5 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3z"),
  tag: (
    <>
      {P("M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9-9-9z")}
      {P("M7.5 7.5h.01")}
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <rect x="9" y="2" width="6" height="4" rx="1" />
      {P("M9 11h6M9 15h4")}
    </>
  ),
  lock: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10.5" rx="2" />
      {P("M8 10.5V7.5a4 4 0 0 1 8 0v3")}
    </>
  ),
} satisfies Record<string, ReactElement>;

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  size = 20,
  className = "",
  filled = false,
  strokeWidth = 1.8,
}: {
  name: IconName;
  size?: number;
  className?: string;
  filled?: boolean;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}

export const CATEGORY_ICON: Record<string, IconName> = {
  dien: "bolt",
  nuoc: "droplet",
  dieuhoa: "snow",
  giupviec: "broom",
  khoa: "key",
  son: "paint",
  noithat: "hammer",
  vesinh: "sparkle",
};

export const FALLBACK_ICON: IconName = "wrench";

export function Logo({ size = 38, withText = true, dark = false }: { size?: number; withText?: boolean; dark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
        <rect width="40" height="40" rx="9" fill="#f4581c" />
        <path d="M20 7.5 7.5 18.5h3.6V32h6.6v-7.4h4.6V32h6.6V18.5h3.6L20 7.5z" fill="#0b1b2e" />
        <path d="M21.7 15.5l-4.4 6.4h3.2l-1.2 5.4 4.9-7h-3.3l.8-4.8z" fill="#f2f2ec" />
      </svg>
      {withText && (
        <span className={`font-display font-bold leading-none tracking-tight ${dark ? "text-white" : "text-ink-900"}`} style={{ fontSize: size * 0.5 }}>
          Home<span className="text-safety-500">Services</span>
        </span>
      )}
    </span>
  );
}
