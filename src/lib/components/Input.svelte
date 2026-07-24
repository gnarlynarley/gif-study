<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  type Props = HTMLInputAttributes;

  let { value = $bindable(), ...props }: Props = $props();
</script>

<input {...props} bind:value />
