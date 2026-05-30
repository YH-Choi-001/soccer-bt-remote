<!--
PC page.
-->

<script lang="ts">
  import OptionsPage from '$lib/components/ui/OptionsPage.svelte'
  import { resolve } from '$app/paths'

  let options = [
    {
      title: 'Mouse Controller',
      subtitle: 'Control your robot using mouse.',
      link: resolve('/pc/mouse'),
    },
    {
      title: 'Keyboard Controller',
      subtitle: 'Control your robot using WASD or arrow keys.',
      link: resolve('/pc/wasd'),
    },
  ]
</script>

<OptionsPage {options} />
