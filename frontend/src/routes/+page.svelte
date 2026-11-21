<!--
Home page.
-->

<script lang="ts">
  import OptionsPage from '$lib/components/ui/OptionsPage.svelte'
  import { asset, resolve } from '$app/paths'

  const SAMPLE_SKETCH_SOURCE_URL =
    'https://github.com/YH-Choi-001/soccer-bt-remote/blob/main/frontend/static/examples/sample.ino'

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
  <p class="mt-2 text-center text-sm">
    Programming your robot?
    <a class="link link-info link-hover" href={asset('/examples/sample.ino')} download="sample.ino"
      >Download the sample Arduino sketch</a
    >
    (<a
      class="link link-info link-hover"
      href={SAMPLE_SKETCH_SOURCE_URL}
      target="_blank"
      rel="external noopener noreferrer">view source</a
    >).
  </p>
</OptionsPage>
