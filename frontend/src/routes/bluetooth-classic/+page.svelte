<!--
Bluetooth Classic setup guide.
-->

<script lang="ts">
  import { resolve } from '$app/paths'
  import FooterWrappedPage from '$lib/components/ui/FooterWrappedPage.svelte'
  import { SPP_UUID16 } from '$lib/bluetooth/SerialFacade.svelte'
</script>

<svelte:head>
  <title>Bluetooth Classic Setup | Soccer BT Remote</title>
</svelte:head>

<FooterWrappedPage>
  <article class="mx-auto prose max-w-3xl p-4 md:p-8 prose-a:link prose-a:link-info">
    <h1 class="text-center text-2xl">Bluetooth Classic Setup</h1>

    <p>
      The controller supports two kinds of Bluetooth link. <strong>BLE</strong> (Bluetooth Low
      Energy) works without pairing. <strong>Classic</strong> is for robots with a Bluetooth Classic
      serial module, such as the HC-05 or HC-06, or an ESP32 running <code>BluetoothSerial</code>.
      Classic devices use the Serial Port Profile (SPP) and must be
      <strong>paired with your phone or computer before</strong> the browser can see them.
    </p>

    <div role="alert" class="not-prose alert alert-soft alert-info">
      <span>
        Not sure which one your robot uses? Try <strong>BLE</strong> first. If the device never
        appears in the BLE scan, follow this guide and use <strong>Classic</strong>.
      </span>
    </div>

    <h2>1. Check your browser</h2>
    <p>
      Bluetooth Classic uses the browser's Web Serial API. It is available only in Chromium-based
      browsers:
    </p>
    <div class="not-prose overflow-x-auto">
      <table class="table table-sm">
        <thead>
          <tr>
            <th>Platform</th>
            <th>Supported browsers</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Windows, macOS, Linux, ChromeOS</td>
            <td>Chrome, Edge, or Opera (version 117 or later)</td>
          </tr>
          <tr>
            <td>Android</td>
            <td>Chrome (version 137 or later)</td>
          </tr>
          <tr>
            <td>iPhone / iPad</td>
            <td>
              Not supported. iOS browsers cannot reach Bluetooth Classic devices. Use a BLE robot
              with <a href="https://bluefy.app/" target="_blank" rel="external noopener noreferrer"
                >Bluefy</a
              > instead.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p>
      The page must be opened over <code>https://</code>. The deployed site already uses HTTPS.
    </p>

    <h2>2. Power on the robot</h2>
    <p>
      Turn on the robot and make sure its Bluetooth module is in pairing mode. On an HC-05 or HC-06,
      the LED blinks quickly while it is waiting for a connection.
    </p>

    <h2>3. Pair the robot with your device</h2>
    <p>
      Pair the module in your operating system's Bluetooth settings. You only need to do this once
      per phone or computer. If you are asked for a PIN, try <code>1234</code> or
      <code>0000</code>; these are the factory defaults on most modules.
    </p>

    <h3>Android</h3>
    <ol>
      <li>Open <strong>Settings → Connected devices → Pair new device</strong>.</li>
      <li>Tap the robot's module (for example <code>HC-05</code>) and enter the PIN.</li>
      <li>
        When Chrome first asks for access to <strong>Nearby devices</strong>, tap
        <strong>Allow</strong>.
      </li>
    </ol>

    <h3>Windows</h3>
    <ol>
      <li>
        Open <strong>Settings → Bluetooth &amp; devices → Add device → Bluetooth</strong>.
      </li>
      <li>Select the robot's module and enter the PIN.</li>
    </ol>

    <h3>macOS</h3>
    <ol>
      <li>Open <strong>System Settings → Bluetooth</strong>.</li>
      <li>Click <strong>Connect</strong> next to the robot's module and enter the PIN.</li>
      <li>
        If Chrome cannot see the device, allow it under
        <strong>System Settings → Privacy &amp; Security → Bluetooth</strong>.
      </li>
    </ol>

    <h3>Linux</h3>
    <ol>
      <li>
        Pair the module from your desktop's Bluetooth settings, or run
        <code>bluetoothctl</code> and use <code>scan on</code>, <code>pair &lt;address&gt;</code>
        and <code>trust &lt;address&gt;</code>.
      </li>
    </ol>

    <p>
      Pairing is enough. You do not need to stay "connected" in the system settings; the browser
      opens the connection itself.
    </p>

    <h2>4. Connect from the controller</h2>
    <ol>
      <li>
        Open a controller: <a href={resolve('/mobile')}>Mobile</a> or
        <a href={resolve('/pc')}>Laptop</a>.
      </li>
      <li>Select <strong>Classic</strong> in the Bluetooth type switch.</li>
      <li>
        Leave <strong>Service</strong> at <code>{SPP_UUID16}</code> (Serial Port Profile), unless your
        robot's firmware uses a custom RFCOMM service UUID.
      </li>
      <li>
        Tap <strong>Scan &amp; Connect</strong>. Pick the robot from the list the browser shows and
        tap <strong>Connect</strong>.
      </li>
      <li>The status badge turns green when the link is open, and commands start sending.</li>
    </ol>
    <p>
      The browser does not tell the page the device's Bluetooth name, so the badge shows "Bluetooth
      Classic device" instead of the module name.
    </p>

    <h2>Troubleshooting</h2>
    <ul>
      <li>
        <strong>The robot is not in the list.</strong> Make sure it is paired (step 3) and powered
        on. If your firmware uses a custom service UUID, enter it in the <strong>Service</strong> field.
      </li>
      <li>
        <strong>Connection fails or drops immediately.</strong> A Classic module accepts one connection
        at a time. Close any other app or device connected to it, then try again.
      </li>
      <li>
        <strong>The robot receives garbled data.</strong> The baud rate between the Bluetooth module and
        the robot's microcontroller must match the firmware. The browser side does not have a baud rate
        setting.
      </li>
      <li>
        <strong>Android does not notice the robot turning off.</strong> Chrome on Android cannot
        always report a lost Bluetooth Classic link. If the robot stops responding, tap
        <strong>Disconnect</strong> and connect again.
      </li>
      <li>
        <strong>Testing the link.</strong> Use the
        <a href={resolve('/debug/bluetooth')}>Bluetooth Terminal</a> to send and receive raw text.
      </li>
    </ul>

    <p class="text-center">
      <a href={resolve('/')}>← Back to home</a>
    </p>
  </article>
</FooterWrappedPage>
