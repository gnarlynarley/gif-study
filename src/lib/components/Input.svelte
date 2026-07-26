<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  type Props = HTMLInputAttributes & {
    label?: string;
  };

  let { value = $bindable(), label, ...props }: Props = $props();
  const id = $props.id();
</script>

<div class="wrapper stack">
  {#if label}
    <label for={id}>{label}</label>
  {/if}
  <input {id} {...props} bind:value />
</div>

<style>
  .wrapper {
    --stack-spacing: var(--spacing-sm);
  }

  input {
    font: inherit;
    padding: var(--spacing);
    border: 1px solid var(--color-accent);
    border-radius: var(--spacing);
  }

  label {
    font-size: 0.8em;
  }
</style>
