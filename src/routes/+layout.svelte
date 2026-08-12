<script>
  import "../app.css";

  let { children } = $props();
</script>

<svelte:head>
  <title>Phoenician Capital · Software Universe</title>
</svelte:head>

{@render children()}
