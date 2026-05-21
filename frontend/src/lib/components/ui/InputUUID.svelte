<script lang="ts">
  //
  let {
    labelText,
    uuid16 = $bindable(),
    disabled,
  }: {
    labelText: string
    uuid16: string
    disabled: boolean
  } = $props()
</script>

<div>
  <label class="input-small input-bordered validator input">
    {labelText}
    <input
      type="text"
      class="w-12"
      bind:value={uuid16}
      required
      placeholder="UUID"
      pattern="^[A-Fa-f0-9]&lcub;4&rcub;$"
      maxlength="4"
      {disabled}
    />
  </label>
  <div class="validator-hint">4 HEX digits</div>
</div>
