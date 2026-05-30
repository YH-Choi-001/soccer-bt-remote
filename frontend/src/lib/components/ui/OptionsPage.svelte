<!--
Home page.
-->

<script lang="ts">
  import Card from '$lib/components/ui/Card.svelte'
  import FooterWrappedPage from '$lib/components/ui/FooterWrappedPage.svelte'
  import type { Snippet } from 'svelte'
  import type { ResolvedPathname } from '$app/types'

  let {
    options,
  }: {
    options: Array<{
      title: string
      subtitle: string
      link: ResolvedPathname
      image?: Snippet
    }>
  } = $props()
</script>

{#snippet card(
  title: string,
  subtitle: string,
  link: ResolvedPathname,
  image: Snippet | undefined = undefined
)}
  <Card {title} {subtitle} {image}>
    {#snippet action()}
      <a href={link}>Start Using</a>
    {/snippet}
  </Card>
{/snippet}

<FooterWrappedPage>
  <div class="p-4">
    <h1 class="mt-4 mb-6 text-center text-2xl">Welcome to Soccer Bluetooth Remote Controller</h1>

    <div class="flex flex-col items-center justify-evenly gap-4 sm:flex-row">
      {#each options as option (option.title + option.subtitle + option.link)}
        {@render card(option.title, option.subtitle, option.link, option.image)}
      {/each}
    </div>
  </div>
</FooterWrappedPage>
