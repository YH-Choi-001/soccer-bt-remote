<!--
Home page.
-->

<script lang="ts">
  import OptionsPage from '$lib/components/ui/OptionsPage.svelte'
  import { resolve } from '$app/paths'

  let options = [
    {
      title: 'Mobile Controller',
      subtitle: 'Use your mobile phone as a remote controller.',
      link: resolve('/mobile'),
    },
    {
      title: 'Laptop Controller',
      subtitle: 'Use your laptop as a remote controller.',
      link: resolve('/pc'),
    },
  ]
</script>

<OptionsPage {options} />
