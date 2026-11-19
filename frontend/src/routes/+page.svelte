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

<OptionsPage {options}>
  <p class="mt-8 text-center text-sm">
    Robot uses Bluetooth Classic (e.g. HC-05)?
    <a class="link link-info link-hover" href={resolve('/bluetooth-classic')}
      >Read the setup guide</a
    >.
  </p>
</OptionsPage>
