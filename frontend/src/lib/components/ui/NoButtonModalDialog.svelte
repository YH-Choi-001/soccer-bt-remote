<script lang="ts">
  import type { Snippet } from 'svelte'

  let {
    isOpen = $bindable(false),
    children,
  }: {
    isOpen: boolean
    children: Snippet
  } = $props()

  let dialog = $state<HTMLDialogElement | undefined>(undefined)

  const onCancel = (e: Event) => {
    // We consume the cancel event to prevent the dialog from closing immediately.
    // Instead, we set `isOpen` to false to play the transition.
    e.preventDefault()
    isOpen = false
  }

  $effect(() => {
    if (isOpen) {
      dialog?.showModal()
      dialog?.addEventListener('cancel', onCancel)
    }
    // No need to close the dialog here,
    // because the dialog will be unbinded when `isOpen` is set to false.
  })
</script>

<dialog bind:this={dialog} class="modal">
  <div class="modal-box">
    {@render children()}
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
