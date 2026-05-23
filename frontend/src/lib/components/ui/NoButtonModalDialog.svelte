<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    isOpen = $bindable(false),
    children,
  }: {
    isOpen: boolean
    children: Snippet
  } = $props()
</script>

<dialog
  {@attach (dialog) => (isOpen ? dialog.showModal() : dialog.close())}
  oncancel={() => (isOpen = false)}
  class="modal"
>
  <div class="modal-box">
    {@render children()}
  </div>
  <form method="dialog" class="modal-backdrop">
    <button onclick={() => (isOpen = false)}>close</button>
  </form>
</dialog>
