import $ from "./Icon.module.scss";

export function SkipPreviousIcon() {
  return (
    <svg
      className={$.icon}
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"></path>
    </svg>
  );
}

export function SkipNextIcon() {
  return (
    <svg
      className={$.icon}
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"></path>
    </svg>
  );
}
export function PlayIcon() {
  return (
    <svg
      className={$.icon}
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M8 5v14l11-7z"></path>
    </svg>
  );
}

export function PauseIcon() {
  return (
    <svg
      className={$.icon}
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>
    </svg>
  );
}

export function MoreIcon() {
  return (
    <svg
      className={$.icon}
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path>
    </svg>
  );
}
