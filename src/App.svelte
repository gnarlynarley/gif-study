<script lang="ts">
  import HomeView from "$lib/views/HomeView.svelte";
  import LoadingView from "$lib/views/LoadingView.svelte";
  import { gif, gifPending } from "./lib/stores/gif.svelte";
  import GifView from "./lib/views/GifView.svelte";
</script>

{#if $gifPending}
  <LoadingView />
{:else if gif.value}
  <GifView bind:gif={gif.value} />
{:else}
  <HomeView />
{/if}
