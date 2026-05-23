<script lang="ts">
  import type { Snippet } from 'svelte'
  import type { Attachment } from 'svelte/attachments'
  import { on } from 'svelte/events'

  let {
    isOpen = $bindable(false),
    children,
  }: {
    isOpen: boolean
    children: Snippet
  } = $props()

  const onToggled: Attachment<HTMLDialogElement> = (dialog: HTMLDialogElement) => {
    if (isOpen) {
      dialog.showModal()
      on(dialog, 'cancel', () => {
        isOpen = false
      })
    } else {
      dialog.close()
    }
  }
</script>

<dialog {@attach onToggled} class="modal">
  <div class="modal-box">
    {@render children()}
  </div>
  <form method="dialog" class="modal-backdrop">
    <button
      onclick={() => {
        isOpen = false
      }}>close</button
    >
  </form>
</dialog>
