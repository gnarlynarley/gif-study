<div class="wrapper">
  <p>Loading</p>
  <span class="spinner"></span>
</div>

<style>
  .wrapper {
    display: flex;
    align-items: center;
    gap: var(--spacing);
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
