<script lang="ts">
  let {
    labelText,
    uuid16 = $bindable(),
    disabled,
    classes = '',
  }: {
    labelText: string
    uuid16: string
    disabled: boolean
    classes?: string
  } = $props()
</script>

<div>
  <label class="input-bordered validator input {classes}">
    {labelText}
    <input
      type="text"
      class="w-12"
      bind:value={uuid16}
      oninput={(e) => (uuid16 = (e.target as HTMLInputElement).value.toUpperCase())}
      required
      placeholder="UUID"
      pattern="^[A-Fa-f0-9]&lcub;4&rcub;$"
      maxlength="4"
      {disabled}
    />
  </label>
  <div class="validator-hint">4 HEX digits</div>
</div>
