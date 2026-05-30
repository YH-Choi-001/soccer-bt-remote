<!--
Mobile page.
-->

<script lang="ts">
  import OptionsPage from '$lib/components/ui/OptionsPage.svelte'
  import { resolve } from '$app/paths'

  let options = [
    {
      title: 'Gyroscope Controller',
      subtitle: 'Control your robot using gyroscope.',
      link: resolve('/mobile/gyro'),
    },
    {
      title: 'Joystick Controller',
      subtitle: 'Control your robot using joystick.',
      link: resolve('/mobile/joystick'),
    },
  ]
</script>

<OptionsPage {options} />
