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
export function DownloadIcon() {
  return (
    <svg
      className={$.icon}
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M11 40q-1.2 0-2.1-.9Q8 38.2 8 37v-7.15h3V37h26v-7.15h3V37q0 1.2-.9 2.1-.9.9-2.1.9Zm13-7.65-9.65-9.65 2.15-2.15 6 6V8h3v18.55l6-6 2.15 2.15Z" />
    </svg>
  );
}
export function CloseIcon() {
  return (
    <svg
      className={$.icon}
      focusable="false"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5l5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6Z" />{" "}
    </svg>
  );
}
