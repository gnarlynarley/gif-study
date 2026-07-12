<script lang="ts">
  interface Props {
    src: string;
    poster?: string;
    start: number;
    end: number;
    videoElement?: HTMLVideoElement | null;
  }

  let {
    src,
    poster,
    start = $bindable(),
    end = $bindable(),
    videoElement = $bindable(),
  }: Props = $props();

  let barElement: HTMLDivElement;

  let playing = $state(false);
  let currentTime = $state(0);
  let duration = $state(0);
  let dragging = $state(false);

  let scrubTime = $state(0);
  let displayTime = $derived(dragging ? scrubTime : currentTime);
  let progress = $derived(duration ? displayTime / duration : 0);
  let startRatio = $derived(duration ? start / duration : 0);
  let endRatio = $derived(duration ? end / duration : 0);

  let draggingHandle = $state<"start" | "end" | null>(null);

  function timeFromPointer(clientX: number): number {
    const rect = barElement.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return ratio * duration;
  }

  function onHandlePointerDown(handle: "start" | "end", e: PointerEvent) {
    e.stopPropagation();
    draggingHandle = handle;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onHandlePointerMove(e: PointerEvent) {
    if (!videoElement) return;
    if (!draggingHandle) return;
    const t = timeFromPointer(e.clientX);
    if (draggingHandle === "start") {
      start = Math.min(t, end);
      videoElement.currentTime = start;
    } else {
      end = Math.max(t, start);
      videoElement.currentTime = end;
    }
  }

  function onHandlePointerUp(e: PointerEvent) {
    if (!draggingHandle) return;
    draggingHandle = null;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
  }

  function togglePlay() {
    if (!videoElement) return;
    if (playing) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
  }

  function onTimeUpdate() {
    if (!videoElement) return;
    if (!dragging) currentTime = videoElement.currentTime;
  }

  function onLoadedMetadata() {
    if (!videoElement) return;
    duration = videoElement.duration;
    if (end === 0) end = duration;
  }

  function onPointerDown(e: PointerEvent) {
    dragging = true;
    scrubTime = timeFromPointer(e.clientX);
    barElement.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent) {
    if (!dragging) return;
    scrubTime = timeFromPointer(e.clientX);
  }

  function onPointerUp(e: PointerEvent) {
    if (!videoElement) return;
    if (!dragging) return;
    dragging = false;
    videoElement.currentTime = scrubTime;
    currentTime = scrubTime;
    barElement.releasePointerCapture(e.pointerId);
  }
</script>

<div class="player">
  <!-- svelte-ignore a11y_media_has_caption -->
  <video
    bind:this={videoElement}
    {src}
    {poster}
    ontimeupdate={onTimeUpdate}
    onloadedmetadata={onLoadedMetadata}
    onplay={() => (playing = true)}
    onpause={() => (playing = false)}
    onclick={togglePlay}
  ></video>

  <div class="controls">
    <button
      class="play-btn"
      onclick={togglePlay}
      aria-label={playing ? "Pause" : "Play"}
    >
      {#if playing}
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <rect x="6" y="5" width="4" height="14" />
          <rect x="14" y="5" width="4" height="14" />
        </svg>
      {:else}
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      {/if}
    </button>

    <div
      class="bar"
      bind:this={barElement}
      onpointerdown={onPointerDown}
      onpointermove={onPointerMove}
      onpointerup={onPointerUp}
      role="slider"
      tabindex="0"
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={duration}
      aria-valuenow={displayTime}
      style:--start={startRatio}
      style:--end={endRatio}
      style:--progress={progress}
    >
      <div class="bar-track"></div>

      <div class="bar-fill"></div>
      <div class="bar-thumb" class:dragging></div>

      <div
        class="trim-handle start"
        class:dragging={draggingHandle === "start"}
        onpointerdown={(e) => onHandlePointerDown("start", e)}
        onpointermove={onHandlePointerMove}
        onpointerup={onHandlePointerUp}
        role="slider"
        tabindex="0"
        aria-label="Trim start"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={start}
      ></div>

      <div
        class="trim-handle end"
        class:dragging={draggingHandle === "end"}
        onpointerdown={(e) => onHandlePointerDown("end", e)}
        onpointermove={onHandlePointerMove}
        onpointerup={onHandlePointerUp}
        role="slider"
        tabindex="0"
        aria-label="Trim end"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={end}
      ></div>
    </div>
  </div>
</div>

<style>
  .player {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    position: relative;
    flex-grow: 1;
  }

  video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: block;
    border-radius: 8px;
    background: black;
    cursor: pointer;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: var(--spacing);
    padding: var(--spacing);
    position: absolute;
    left: var(--spacing);
    bottom: var(--spacing);
    width: calc(100% - (var(--spacing) * 2));
    background-color: hsl(from var(--color-accent) h s l / 0.8);
    border-radius: var(--spacing);
    backdrop-filter: blur(var(--spacing));
  }

  .play-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    color: white;
    cursor: pointer;
    flex-shrink: 0;
  }

  .play-btn:hover {
    background: #333;
  }

  .bar {
    --bar-height: var(--spacing-sm);
    position: relative;
    flex: 1;
    height: 20px;
    display: flex;
    align-items: center;
    cursor: pointer;
    touch-action: none;
  }

  .bar-track {
    position: absolute;
    left: 0;
    right: 0;
    height: var(--bar-height);
    border-radius: 2px;
    background: hsl(from var(--color-primary) h s l / 0.3);
  }

  .bar-fill {
    position: absolute;
    left: 0;
    height: var(--bar-height);
    background: var(--color-primary);
    pointer-events: none;
    width: calc(100% * var(--progress));
  }

  .bar-thumb {
    position: absolute;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--color-primary);
    transform: translateX(-50%);
    pointer-events: none;
    transition: transform 0.1s;
    left: calc(100% * var(--progress));
  }

  .bar-thumb.dragging {
    transform: translateX(-50%) scale(1.3);
  }

  .trim-handle {
    position: absolute;
    width: 8px;
    height: 20px;
    border-radius: 3px;
    background: var(--color-primary);
    transform: translateX(-50%);
    cursor: ew-resize;
    touch-action: none;
    transition: transform 0.1s;

    &.start {
      left: calc(100% * var(--start));
    }

    &.end {
      left: calc(100% * var(--end));
    }
  }

  .trim-handle.dragging {
    transform: translateX(-50%) scale(1.15);
  }

  .trim-handle.start {
    z-index: 2;
  }

  .trim-handle.end {
    z-index: 2;
  }
</style>
