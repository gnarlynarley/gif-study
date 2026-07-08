<script lang="ts">
  import { loadGifFromFile } from "$lib/stores/gif.svelte";
  import { latestFile } from "$lib/stores/latestFile";
  import { settings } from "$lib/stores/settings.svelte";

  const keybinds: [string, string][] = $derived([
    [$settings.keybinds.brush, "Brush"],
    [$settings.keybinds.eraser, "Eraser"],
    [$settings.keybinds.nextFrame, "Next frame"],
    [$settings.keybinds.prevFrame, "Previous frame"],
    [$settings.keybinds.increaseBrushSize, "Increase brush size"],
    [$settings.keybinds.decreaseBrushSize, "Decrease brush size"],
    [$settings.keybinds.panning, "Enable panning by holding down and drag"],
    [$settings.keybinds.togglePlaying, "Toggle play state"],
  ]);
</script>

<div class="wrapper">
  {#if $latestFile}
    <button
      class="button"
      type="button"
      onclick={() => {
        loadGifFromFile($latestFile);
      }}
    >
      Load latest: {$latestFile.name}
    </button>
  {/if}
  <label class="button" for="load-gif">Load</label>
  <input
    id="load-gif"
    type="file"
    accept="image/gif,video/*"
    oninput={(ev) => {
      const file = ev.currentTarget.files?.[0] ?? null;
      if (file) {
        loadGifFromFile(file);
      }
      ev.currentTarget.value = "";
    }}
  />
  <div class="box prose">
    <h3>Keybinds:</h3>
    {#each keybinds as [keybind, label]}
      <p>
        <code>{keybind.toUpperCase()}</code>
        <span>{label}</span>
      </p>
    {/each}
  </div>
</div>

<style>
  .wrapper {
    display: grid;
    gap: var(--spacing);
  }
  .box {
    padding: var(--spacing);
    border-radius: var(--spacing-sm);
    background-color: hsl(from var(--color-accent) h s l / 0.5);
  }

  code {
    padding: var(--spacing-sm);
    border-radius: var(--spacing-sm);
    background-color: var(--color-accent);
  }

  .button {
    padding: var(--spacing);
    background: var(--color-accent);
    border-radius: var(--spacing-sm);
    text-align: center;
    cursor: pointer;
  }

  input[type="file"] {
    display: none;
    visibility: hidden;
  }
</style>
