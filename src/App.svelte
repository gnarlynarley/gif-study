<script lang="ts">
  import { gif, loadGifFromFile } from './lib/stores/gif.svelte';
  import GifView from './lib/views/GifView.svelte';
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
      <p>B: Brush</p>
      <p>E: Eraser</p>
      <p>A: Previous frame</p>
      <p>D: Next frame</p>
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
    background-color: var(--color-accent);
  }
</style>
