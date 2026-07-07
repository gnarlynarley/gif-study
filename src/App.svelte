<script lang="ts">
  import HomeView from "$lib/views/HomeView.svelte";
  import { gif } from "./lib/stores/gif.svelte";
  import GifView from "./lib/views/GifView.svelte";
</script>

{#if gif.value}
  <GifView bind:gif={gif.value} />
{:else}
  <HomeView />
{/if}
