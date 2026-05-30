<script lang="ts">
  import Footer from './Footer.svelte'
  import type { Snippet } from 'svelte'

  let { children }: { children: Snippet } = $props()
</script>

<div class="flex min-h-svh w-full flex-col">
  <div class="mb-6 flex-grow">
    {@render children()}
  </div>
  <Footer />
</div>
