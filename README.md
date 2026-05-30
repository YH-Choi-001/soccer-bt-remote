# Soccer Bluetooth Remote Controller

Remote control soccer robot from mobile phone via bluetooth.

Deployed [here](https://sbrc.yhchoi.top)

## Architecture

```
+----------------+   +-------------+   +-------------+
|  Mobile Phone  |---| Bluetooth   |---|   Robot     |
| (App)          |   |             |   | (Firmware)  |
+----------------+   +-------------+   +-------------+
```

## Development

### Run Dev Server

```bash
# Enter frontend/ directory.
cd frontend

# Start the web server (mobile phone app).
pnpm run dev --host

# Connect to the web server from mobile phone.
# Open https://192.168.X.X:5173/ in mobile phone browser.
# Note we use HTTPS instead of HTTP, because
# gyro and bluetooth data access from the browser requires HTTPS.
```

### Run Checks

#### Static Type Check

```bash
# Enter frontend/ directory.
cd frontend

# Run static type check.
pnpm run check
```

#### Linting and Formatting

```bash
# Enter frontend/ directory.
cd frontend

# Run linting.
pnpm run lint

# Fix linting errors.
pnpm run format
```

### Run Tests

#### Unit Tests

```bash
# Enter frontend/ directory.
cd frontend

# Run unit tests.
pnpm test:unit
```

#### End-to-End (E2E) Tests

```bash
# Enter frontend/ directory.
cd frontend

# Run E2E tests.
pnpm test:e2e
```
