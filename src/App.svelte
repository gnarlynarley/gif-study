<script lang="ts">
  import HomeView from "$lib/views/HomeView.svelte";
  import { gif } from "./lib/stores/gif.svelte";
  import GifView from "./lib/views/GifView.svelte";
</script>

{#if $gif}
  <GifView bind:gif={$gif} />
{:else}
  <HomeView />
{/if}
