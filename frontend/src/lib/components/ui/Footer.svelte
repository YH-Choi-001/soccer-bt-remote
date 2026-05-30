<script lang="ts">
  const START_YEAR = 2026
  const currentYear = new Date().getFullYear()
  const yearRange = START_YEAR === currentYear ? `${currentYear}` : `${START_YEAR}-${currentYear}`
</script>

<footer class="footer-center footer w-lvw bg-base-300 p-4 text-base-content sm:footer-horizontal">
  <aside>
    <p>Copyright © {yearRange} YH Choi - All rights reserved.</p>
  </aside>
</footer>
