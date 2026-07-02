<script>
  import { gif } from './lib/stores/gif.svelte';
  import GifView from './lib/views/GifView.svelte';
</script>

{#if gif.parsed}
  <GifView gif={gif.parsed} />
{:else}
  <label for="load-gif">Load gif:</label>
  <input
    id="load-gif"
    type="file"
    accept="image/gif"
    oninput={(ev) => {
      const file = ev.currentTarget.files?.[0] ?? null;
      if (file) {
        gif.setFile(file);
      }
      ev.currentTarget.value = '';
    }}
  />
{/if}
