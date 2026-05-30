<!--
Debug page.
-->

<script lang="ts">
  import OptionsPage from '$lib/components/ui/OptionsPage.svelte'
  import { resolve } from '$app/paths'

  let options = [
    {
      title: 'Bluetooth Terminal',
      subtitle: 'Communicate with robot via bluetooth terminal.',
      link: resolve('/debug/bluetooth'),
    },
    {
      title: 'Gyroscope Test',
      subtitle: 'Check gyroscope data in real-time.',
      link: resolve('/debug/gyro'),
    },
  ]
</script>

<OptionsPage {options} />
