<script lang="ts">
  import './layout.css'
  import favicon from '$lib/assets/favicon.svg'
  import AlertStack from '$lib/components/ui/AlertStack.svelte'

  let { children } = $props()
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<AlertStack />
{@render children()}
