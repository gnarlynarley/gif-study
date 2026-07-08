<script>
  import { notificationsStore } from "$lib/stores/notifications.svelte";
  import { blur } from "svelte/transition";
  import Notification from "./Notification.svelte";
  import { flip } from "svelte/animate";
</script>

<div class="wrapper">
  {#each $notificationsStore as notification (notification.id)}
    <div transition:blur>
      <Notification {notification} />
    </div>
  {/each}
</div>

<style>
  .wrapper {
    position: fixed;
    bottom: var(--spacing);
    right: var(--spacing);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    max-width: 15em;
  }
</style>
