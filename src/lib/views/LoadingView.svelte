<script lang="ts">
  type Props = {
    progress: number;
  };

  const { progress }: Props = $props();
</script>

<div class="wrapper" style:--progress={progress}>
  <div class="text">
    <p>Loading</p>
    <span class="spinner"></span>
  </div>
  <div class="bar"></div>
</div>

<style>
  .wrapper {
    display: grid;
    gap: var(--spacing);
  }
  .text {
    display: flex;
    align-items: center;
    gap: var(--spacing);

    &::after {
      content: "";
    }
  }

  .bar {
    height: var(--spacing);
    background: var(--color-accent);
    position: relative;

    &::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: currentColor;
      transform-origin: top left;
      scale: var(--progress) 1;
    }
  }

  .spinner {
    width: 1em;
    height: 1em;
    display: inline-block;
    border: 3px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: 500ms forwards linear infinite spin;
  }

  @keyframes spin {
    from {
      rotate: 0deg;
    }
    to {
      rotate: 360deg;
    }
  }
</style>
