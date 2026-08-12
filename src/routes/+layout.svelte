<script>
  import "../app.css";

  let { children } = $props();
</script>

<svelte:head>
  <title>PI Global</title>
</svelte:head>

{@render children()}
