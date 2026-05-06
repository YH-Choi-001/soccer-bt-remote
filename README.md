# Soccer Remote Controller

Remote control soccer robot from mobile phone via bluetooth.

## Architecture

```
+----------------+   +-------------+   +-------------+
|  Mobile Phone  |---| Bluetooth   |---|   Robot     |
| (App)          |   |             |   | (Firmware)  |
+----------------+   +-------------+   +-------------+
```

## Development

```bash
# Start the web server (mobile phone app)
pnpm run dev --host

# Connect to the web server from mobile phone
# Open https://192.168.X.X:5173/ in mobile phone browser
# You may need to allow the connection in the mobile phone browser

# Check for mobile permission popup
# Wait for the mobile permission popup

# Click the "CLICK ME TO START SENSOR CAPTURE" button
# This will request permission to access motion and orientation sensors

# Click "Allow" to grant permission
# Wait for the mobile permission popup

# After allowing, the sensors should start capturing data
# You should see the sensor data updating in the web browser
```
