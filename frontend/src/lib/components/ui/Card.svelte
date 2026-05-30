<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    title,
    subtitle,
    image,
    action,
  }: {
    title: string
    subtitle: string
    image?: Snippet
    action?: Snippet
  } = $props()
</script>

<div class="card w-full bg-primary/20 shadow-sm sm:w-72 md:w-80 lg:w-96">
  {#if image}
    <figure class="px-4 pt-4">
      {@render image()}
    </figure>
  {/if}
  <div class="card-body">
    <h2 class="card-title">{title}</h2>
    <p>{subtitle}</p>
    <div class="card-actions justify-end">
      <button class="btn btn-primary">
        {#if action}
          {@render action()}
        {/if}
      </button>
    </div>
  </div>
</div>
