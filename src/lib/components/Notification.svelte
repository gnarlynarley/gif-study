<script lang="ts">
  import {
    removeNotification,
    type NotificationEntry,
  } from "$lib/stores/notifications.svelte";

  type Props = {
    notification: NotificationEntry;
  };

  const { notification }: Props = $props();
  const id = $derived(notification.id);
  const duration = $derived(notification.duration);

  $effect(() => {
    const timeoutId = setTimeout(() => {
      removeNotification(id);
    }, duration);
    return () => clearTimeout(timeoutId);
  });
</script>

<button
  type="button"
  class="notification"
  class:is-error={notification.type === "error"}
  onclick={() => removeNotification(id)}
>
  {notification.message}
</button>

<style>
  .notification {
    padding: var(--spacing);
    background-color: var(--color-accent);
    border-radius: var(--spacing-sm);
    text-align: left;

    &.is-error {
      background-color: var(--color-error);
    }
  }
</style>
