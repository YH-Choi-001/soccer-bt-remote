<script lang="ts">
  import { resolve } from '$app/paths'

  const START_YEAR = 2026
  const currentYear = new Date().getFullYear()
  const yearRange = START_YEAR === currentYear ? `${currentYear}` : `${START_YEAR}-${currentYear}`
</script>

<footer class="footer-center footer w-svw bg-base-300 p-4 text-base-content sm:footer-horizontal">
  <aside>
    <p>Copyright © {yearRange} YH Choi - All rights reserved.</p>
    <p>
      By using this application, you agree to the <a
        class="link link-info link-hover"
        href={resolve('/licensing')}
        rel="internal noopener noreferrer">licensing terms</a
      >.
    </p>
  </aside>
</footer>
