<script lang="ts">
  import { settings } from '$lib/stores/settings.svelte';
  import { gif, loadGifFromFile } from './lib/stores/gif.svelte';
  import GifView from './lib/views/GifView.svelte';

  const keybinds: [string, string][] = $derived([
    [$settings.keybinds.brush, 'Brush'],
    [$settings.keybinds.eraser, 'Eraser'],
    [$settings.keybinds.nextFrame, 'Next frame'],
    [$settings.keybinds.prevFrame, 'Previous frame'],
  ]);
</script>

{#if $gif}
  <GifView bind:gif={$gif} />
{:else}
  <div class="wrapper">
    <label for="load-gif">Load gif:</label>
    <input
      id="load-gif"
      type="file"
      accept="image/gif"
      oninput={(ev) => {
        const file = ev.currentTarget.files?.[0] ?? null;
        if (file) {
          loadGifFromFile(file);
        }
        ev.currentTarget.value = '';
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
{/if}

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
</style>
