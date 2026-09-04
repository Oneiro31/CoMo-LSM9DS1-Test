# CoMo LSM9DS1 Test — Motion Source Evaluation

This project is a lightweight evaluation application built with [CoMo](https://github.com/ircam-ismm/como) and [Soundworks](https://soundworks.dev/).

It records motion frames produced by three different sources:

- **LSM9DS1**
- **CoMote**
- **R-IoT**

The frames are saved in separate `.txt` files for offline analysis and comparison of the sources, including their inertial measurements and temporal behaviour.

## How it works

The Node.js `device` client creates the three motion sources and listens for their frames:

- The **LSM9DS1** is connected directly to the Raspberry Pi through I²C.
- **CoMote** transmits its data through WebSockets on port `8901`.
- The **R-IoT** transmits OSC messages on port `8001`.

For each source, the application records:

- a relative reception time;
- an independent frame index;
- the original CoMo motion frame.

All frames are timestamped by the `device` client relative to a common clock . This provides a common software time reference for aligning the recordings during offline analysis. It does not constitute hardware-level synchronization between the sensors.

## Requirements

- A computer running the Soundworks server
- A Raspberry Pi running the Node.js `device` client
- An LSM9DS1 inertial sensor connected to the Raspberry Pi
- A CoMote and/or R-IoT device
- Node.js and npm
- All devices connected to the same local network

## Installation

Clone the repository:

```bash
git clone https://github.com/Oneiro31/CoMo-LSM9DS1-Test.git
cd CoMo-LSM9DS1-Test
```

Install the dependencies:

```bash
npm install
```

The project must be installed on both the computer running the server and the Raspberry Pi running the `device` client.

## Network configuration

Edit:

```text
config/env-default.yaml
```

Set `serverAddress` to the local IP address of the computer running the Soundworks server:

```yaml
type: development
port: 8000
serverAddress: "192.168.1.xxx"
useHttps: false
```

The computer and the Raspberry Pi must use the same server address and be connected to the same local network.

The external motion sources must send their data to the Raspberry Pi:

- **CoMote:** Raspberry Pi IP address, WebSocket port `8901`
- **R-IoT:** Raspberry Pi IP address, OSC port `8001`

## Running the application

### 1. Start the server

On the computer:

```bash
npm run dev
```

The controller interface is then available at:

```text
http://<server-address>:8000
```

### 2. Start the recording client

On the Raspberry Pi:

```bash
npm run watch device
```

The application starts recording automatically when frames are received from the motion sources.

### 3. Stop the recording

Press:

```text
Ctrl+C
```

This closes the three file writers before stopping the application and ensures that the buffered data are saved correctly.

## Output files

The recordings are stored in the Soundworks logger data directory (`.data/`). The current implementation creates one file per source:

```text
lsm9ds1_imu_data.txt
comote_imu_data.txt
riot_imu_data.txt
```

Each recorded entry follows this general structure:

```json
{
  "time": 5.51,
  "index": 42,
  "frame": [
    {
      "source": "lsm9ds1",
      "timestamp": 3759.17,
      "accelerometer": {},
      "gyroscope": {},
      "magnetometer": {},
      "gravity": {}
    }
  ]
}
```

The `time` field corresponds to the common relative time assigned by the `device` client. The source-specific timestamps and inertial measurements remain available inside the original frame.

## Changing the test configuration

The source parameters are currently defined in:

```text
src/clients/device.js
```

This file can be edited to change:

- the acquisition interval;
- the CoMote and R-IoT communication ports;
- the output file names;
- the logger buffer size;
- the sources included in a test.

The current LSM9DS1 and CoMote acquisition interval is set to `10 ms`.

## Main project files

```text
config/env-default.yaml       Network configuration
src/server.js                 Soundworks and CoMo server
src/clients/controller.js     Browser controller
src/clients/device.js         Source creation and frame recording
```

## Credits

This project uses:

- [CoMo](https://github.com/ircam-ismm/como), 
- [Soundworks](https://soundworks.dev/)

developed by the ISMM team at Ircam

## License

[BSD-3-Clause](./LICENSE)




