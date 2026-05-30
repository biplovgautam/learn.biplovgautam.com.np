# Building a Bidirectional IoT Control Loop with ESP32, micro-ROS, and ROS 2

**Live temperature sensor data from an ESP32 streaming over Wi-Fi/UDP into ROS 2 — and ROS 2 sending commands back to control on-board LEDs in real time.**

In this tutorial you will build a complete hardware-in-the-loop system: an ESP32 reads temperature from a DHT11 sensor and publishes it to a ROS 2 topic via micro-ROS over UDP. A Python ROS 2 node subscribes to that topic, runs threshold logic, and publishes a command back to the ESP32, which turns a red or blue LED on accordingly. Everything runs inside a Docker container so your host machine stays clean.

This is a full IoT control loop — exactly the architecture used in real robotics, smart-home automation, and industrial monitoring systems.

---

## What You Will Learn

- How to set up a Dockerized ROS 2 Humble environment with VNC desktop access
- How micro-ROS extends ROS 2 to microcontrollers like the ESP32
- How UDP transport works between an ESP32 and a Docker container
- How to write a ROS 2 publisher/subscriber node in Python (`rclpy`)
- How QoS (Quality of Service) profiles affect publisher-subscriber compatibility
- How to wire a DHT11 sensor and LEDs to safe ESP32 GPIO pins
- How to build, source, and run multiple ROS 2 workspaces side by side
- How to compile the `micro_ros_agent` from source
- How to troubleshoot common errors at every layer of the stack

---

## Prerequisites

### Knowledge
- Comfortable with the Linux terminal (cd, ls, source, etc.)
- Basic understanding of Python and C/C++ syntax
- A working Docker installation on your host machine
- Familiarity with ROS 2 concepts (nodes, topics, publishers, subscribers). If you are brand new, finish the official ROS 2 beginner tutorials first.

### Hardware
| Component | Purpose |
|---|---|
| ESP32 WROOM (or any ESP32 dev board) | Microcontroller running micro-ROS |
| DHT11 temperature/humidity sensor (3-pin module) | Reads ambient temperature |
| 1 × Red LED | Indicates "hot" state (≥ 29 °C) |
| 1 × Blue LED | Indicates "cold" state (< 29 °C) |
| 2 × 220 Ω or 330 Ω resistors | Current limiting for LEDs |
| Breadboard + jumper wires | Wiring |
| USB cable | Programming + power for the ESP32 |
| Mobile hotspot or Wi-Fi router | ESP32 and your computer must share the same network |

> **Note:** This tutorial **does not work on an ESP8266**. The `micro_ros_arduino` library requires the FreeRTOS networking stack and 32-bit architecture that the ESP8266 does not have. Use an ESP32 or one of the supported 32-bit Arduino boards (Portenta H7, Nano RP2040 Connect, GIGA R1 WiFi).

### Software
- Docker Desktop (Windows/macOS) or Docker Engine (Linux)
- Arduino IDE (≥ 2.0) installed on your host computer
- Modern web browser (Chrome/Firefox/Safari)

---

## System Architecture

```
┌──────────────┐    DHT11      ┌──────────────┐    Wi-Fi (UDP 8888)    ┌─────────────────────┐
│   DHT11      │ ───────────▶  │              │ ──────────────────────▶│ micro_ros_agent     │
│   Sensor     │               │   ESP32      │                        │ (inside Docker)     │
└──────────────┘               │              │ ◀──────────────────────│                     │
                               │   (micro-ROS │                        └──────────┬──────────┘
                               │    client)   │                                   │
                               │              │                                   │ ROS 2 DDS
                               │  Red/Blue    │                                   │
                               │     LEDs     │                                   ▼
                               │              │                        ┌─────────────────────┐
                               └──────────────┘                        │  Python Logic Node  │
                                                                       │  (env_controller)   │
                                                                       │                     │
                                                                       │  if temp ≥ 29:      │
                                                                       │     send RED        │
                                                                       │  else:              │
                                                                       │     send BLUE       │
                                                                       └─────────────────────┘
```

**Data flow:**

1. **ESP32 → ROS 2:** DHT11 → ESP32 reads temperature → publishes `std_msgs/Float32` to topic `/temperature_data`
2. **ROS 2 logic:** Python node subscribes to `/temperature_data` → applies threshold (≥ 29 °C) → publishes `std_msgs/Bool` to `/led_trigger`
3. **ROS 2 → ESP32:** ESP32 subscribes to `/led_trigger` → callback flips LED pins accordingly

The `micro_ros_agent` acts as a translator between the lightweight micro-ROS protocol (over UDP) and the full ROS 2 DDS network. Without it, the ESP32 cannot participate in the ROS 2 graph.

---

## Phase 1 — Docker Environment Setup

We use the [tiryoh/ros2-desktop-vnc:humble](https://github.com/Tiryoh/docker-ros2-desktop-vnc) image. It bundles Ubuntu, ROS 2 Humble Hawksbill, a VNC desktop, and noVNC (so you access the desktop in your browser).

### 1.1 Run the container with UDP port exposed

```bash
docker run -d \
  -p 6080:80 \
  -p 8888:8888/udp \
  --name ros2_udp_demo \
  --security-opt seccomp=unconfined \
  --shm-size=512m \
  ghcr.io/tiryoh/ros2-desktop-vnc:humble
```

**What each flag does:**

| Flag | Purpose |
|---|---|
| `-d` | Detached mode — runs in the background, your terminal stays free |
| `-p 6080:80` | Maps host port 6080 to container port 80 (noVNC web client) |
| `-p 8888:8888/udp` | **Critical** — opens UDP port 8888 so the ESP32 can reach micro_ros_agent inside the container |
| `--name ros2_udp_demo` | Friendly container name (use `docker stop ros2_udp_demo` later) |
| `--security-opt seccomp=unconfined` | Relaxes kernel syscall restrictions so ROS 2 real-time scheduling and shared memory work properly |
| `--shm-size=512m` | Bumps shared memory from 64 MB default → 512 MB. ROS 2 DDS uses shared memory for fast inter-node messaging. Too small = dropped messages. |
| `ghcr.io/tiryoh/ros2-desktop-vnc:humble` | The image: pre-built Ubuntu + ROS 2 Humble + VNC desktop |

> **Already have a saved image?** If you committed a previous container as `ros2-saved`, swap the image name on the last line.

### 1.2 Access the desktop

Open your browser and go to **http://localhost:6080**

You should see a noVNC connect page. Click **Connect**.

When prompted for the password, enter:

```
ubuntu
```

You will now see a full Ubuntu desktop running inside Docker, accessible right in your browser.

### 1.3 Open a terminal

Right-click on the desktop → **Open Terminal Here**, or use the taskbar.

---

## Phase 2 — Compile the micro-ROS Agent

The `micro_ros_agent` is the bridge between the ESP32 and ROS 2. It is **not** pre-installed in this Docker image — we have to build it from source.

We will keep this build in a **separate workspace** (`~/ros_udp_ws`) so it does not interfere with any class code in `~/ros_ws`.

### 2.1 Create the workspace

```bash
mkdir -p ~/ros_udp_ws/src
cd ~/ros_udp_ws/src
```

### 2.2 Clone the micro-ROS setup tool

```bash
git clone -b humble https://github.com/micro-ROS/micro_ros_setup.git
```

### 2.3 Install dependencies + build the setup tool

```bash
cd ~/ros_udp_ws
sudo apt update
source /opt/ros/humble/setup.bash
rosdep update
rosdep install --from-paths src --ignore-src -y
colcon build
source install/local_setup.bash
```

> **If `rosdep` complains about `clang-tidy`:** run `sudo apt update` first. The Docker image's package list is sometimes outdated.

### 2.4 Build the actual micro-ROS agent

This step compiles the agent binary. It takes 2–4 minutes — let it finish completely.

```bash
ros2 run micro_ros_setup create_agent_ws.sh
ros2 run micro_ros_setup build_agent.sh
source install/setup.bash
```

### 2.5 Verify the agent is installed

```bash
ros2 pkg list | grep micro_ros_agent
```

If you see `micro_ros_agent` in the output, you are good. Keep this terminal open — we will come back to start the agent in Phase 5.

---

## Phase 3 — Create the ROS 2 Logic Node

This is the "brain" of the system. A Python ROS 2 node that:

1. Subscribes to `/temperature_data` (sensor input from ESP32)
2. Compares the temperature against a 29 °C threshold
3. Publishes `True`/`False` to `/led_trigger` (LED command back to ESP32)

### 3.1 Create the Python package

```bash
cd ~/ros_udp_ws/src
ros2 pkg create --build-type ament_python --license Apache-2.0 env_controller
```

This creates the standard ROS 2 Python package skeleton:

```
env_controller/
├── env_controller/
│   └── __init__.py
├── package.xml
├── resource/env_controller
├── setup.cfg
├── setup.py
└── test/
```

### 3.2 Write the node

Create the source file:

```bash
touch ~/ros_udp_ws/src/env_controller/env_controller/temp_logic.py
```

Open it in your editor (`gedit`, `nano`, or VS Code via VNC) and paste:

```python
import rclpy
from rclpy.node import Node
from std_msgs.msg import Float32, Bool
from rclpy.qos import qos_profile_sensor_data  # Best Effort QoS — required for micro-ROS sensor publishers


class TempLogicNode(Node):
    def __init__(self):
        super().__init__('temp_logic_node')

        # Subscribe to ESP32 temperature publisher.
        # micro-ROS publishes with Best Effort QoS, so the subscriber
        # MUST also use Best Effort or it will silently ignore all messages.
        self.subscription = self.create_subscription(
            Float32,
            'temperature_data',
            self.temp_callback,
            qos_profile_sensor_data,
        )

        # Publish LED commands back to the ESP32.
        # Reliable QoS here is fine — small Bool messages, infrequent.
        self.publisher_ = self.create_publisher(Bool, 'led_trigger', 10)

    def temp_callback(self, msg):
        temp = msg.data
        led_msg = Bool()

        if temp >= 29.0:
            led_msg.data = True   # Red LED
            self.get_logger().info(f'Temp: {temp:.2f} >= 29. Sending RED command.')
        else:
            led_msg.data = False  # Blue LED
            self.get_logger().info(f'Temp: {temp:.2f} < 29. Sending BLUE command.')

        self.publisher_.publish(led_msg)


def main(args=None):
    rclpy.init(args=args)
    node = TempLogicNode()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()


if __name__ == '__main__':
    main()
```

#### Code walkthrough

- **`qos_profile_sensor_data`** — a built-in ROS 2 QoS profile that uses *Best Effort* reliability. micro-ROS publishers also use Best Effort by default, so this profile makes them compatible. If you used the default (`10` = Reliable), the subscriber would log:
  ```
  New publisher discovered ... offering incompatible QoS. ... Last incompatible policy: RELIABILITY
  ```
- **`create_subscription(MsgType, topic, callback, qos)`** — standard rclpy subscription
- **`create_publisher(MsgType, topic, qos_depth)`** — `10` here is the queue depth (max buffered messages), which implicitly uses Reliable QoS
- **`Bool` message** — chosen because we only need ON/OFF semantics. For multi-state actuators, you would use `Int32`, `Float32`, or a custom interface.

### 3.3 Update `package.xml`

Add these two lines after `<license>` but before `<export>`:

```xml
<exec_depend>rclpy</exec_depend>
<exec_depend>std_msgs</exec_depend>
```

These tell ROS 2 the runtime dependencies of your package.

### 3.4 Update `setup.py`

Inside the `entry_points` block, register the executable name:

```python
entry_points={
    'console_scripts': [
        'temp_controller = env_controller.temp_logic:main',
    ],
},
```

Format: `<executable_name> = <package>.<module>:<function>`

This is what lets you run `ros2 run env_controller temp_controller`.

### 3.5 Build and source

```bash
cd ~/ros_udp_ws
rosdep install -i --from-path src --rosdistro humble -y
colcon build --symlink-install --packages-select env_controller
source install/setup.bash
```

> **What does `--symlink-install` do?** It creates symbolic links from the install directory to your source files instead of copying them. For Python packages, this means edits to `temp_logic.py` take effect immediately without rebuilding — perfect for fast iteration. This flag is **only useful for interpreted languages** (Python). C++ packages still need a full rebuild on every change.

### 3.6 Verify

```bash
ros2 pkg executables env_controller
```

Should print:

```
env_controller temp_controller
```

---

## Phase 4 — ESP32 Firmware (Arduino IDE)

Now switch to your **host computer** (not the VNC desktop) where the Arduino IDE is installed.

### 4.1 Install the ESP32 board package

1. Open Arduino IDE → **File → Preferences** (or **Arduino IDE → Settings** on macOS)
2. In **Additional Boards Manager URLs**, add the ESP32 URL. If you already have ESP8266 there, separate with a comma:
   ```
   http://arduino.esp8266.com/stable/package_esp8266com_index.json,https://espressif.github.io/arduino-esp32/package_esp32_index.json
   ```
3. Click **OK**
4. Go to **Tools → Board → Boards Manager**
5. Search for `esp32` → install **"esp32 by Espressif Systems"** (this takes a few minutes)
6. Once installed, select **Tools → Board → esp32 → ESP32 Dev Module**

### 4.2 Install required libraries

In **Sketch → Include Library → Manage Libraries**:

| Library | Author | Purpose |
|---|---|---|
| **micro_ros_arduino** | (manual install — see below) | Native micro-ROS client for Arduino |
| **DHT sensor library** | Adafruit | DHT11/DHT22 driver |
| **Adafruit Unified Sensor** | Adafruit | DHT dependency |

**Installing `micro_ros_arduino` (manual):**

1. Go to [github.com/micro-ROS/micro_ros_arduino/releases](https://github.com/micro-ROS/micro_ros_arduino/releases)
2. Download the ZIP for **humble** (matching your ROS 2 distro)
3. In Arduino IDE: **Sketch → Include Library → Add .ZIP Library...** → select the ZIP

### 4.3 Wire the hardware

#### DHT11 sensor (3-pin breakout)

| DHT11 Pin | ESP32 Pin | Notes |
|---|---|---|
| VCC (+) | **3V3** | Do not use 5 V — ESP32 GPIOs are 3.3 V only |
| GND (-) | **GND** | Any GND pin |
| DATA (OUT) | **GPIO 4** | |

#### LEDs

| Component | ESP32 Pin | Wiring |
|---|---|---|
| Red LED anode (long leg) | **GPIO 26** | Cathode → 220 Ω resistor → GND |
| Blue LED anode (long leg) | **GPIO 27** | Cathode → 220 Ω resistor → GND |

> **Why GPIO 26 and 27?** Some ESP32 pins are "strapping pins" that affect boot behavior. GPIO 0, 2, 5, 12, 15 are risky. GPIO 4, 26, 27 are 100% safe general-purpose pins.

### 4.4 The Arduino sketch

Open a new sketch, delete everything, and paste:

```cpp
#include <micro_ros_arduino.h>
#include <stdio.h>
#include <rcl/rcl.h>
#include <rcl/error_handling.h>
#include <rclc/rclc.h>
#include <rclc/executor.h>
#include <std_msgs/msg/float32.h>
#include <std_msgs/msg/bool.h>
#include <DHT.h>

// Safe ESP32 pins
#define RED_LED_PIN  26
#define BLUE_LED_PIN 27
#define DHTPIN        4
#define DHTTYPE     DHT11

DHT dht(DHTPIN, DHTTYPE);

rcl_publisher_t      publisher;
rcl_subscription_t   led_subscriber;
std_msgs__msg__Float32 temp_msg;
std_msgs__msg__Bool    led_msg;

rclc_support_t   support;
rcl_allocator_t  allocator;
rcl_node_t       node;
rclc_executor_t  executor;

unsigned long last_pub_time = 0;

#define RCCHECK(fn)     { rcl_ret_t rc = fn; if (rc != RCL_RET_OK) error_loop(); }
#define RCSOFTCHECK(fn) { rcl_ret_t rc = fn; (void)rc; }

void error_loop() {
  while (1) {
    digitalWrite(RED_LED_PIN, !digitalRead(RED_LED_PIN));
    delay(100);
  }
}

// Called when ROS 2 publishes to /led_trigger
void led_callback(const void *msgin) {
  const std_msgs__msg__Bool *msg = (const std_msgs__msg__Bool *)msgin;
  if (msg->data) {
    digitalWrite(RED_LED_PIN, HIGH);
    digitalWrite(BLUE_LED_PIN, LOW);
  } else {
    digitalWrite(RED_LED_PIN, LOW);
    digitalWrite(BLUE_LED_PIN, HIGH);
  }
}

void setup() {
  Serial.begin(115200);
  dht.begin();

  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(BLUE_LED_PIN, OUTPUT);
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(BLUE_LED_PIN, LOW);

  // ───────────────────────────────────────────────────────────
  // CHANGE THESE: Wi-Fi name, password, and your computer's IP
  // ───────────────────────────────────────────────────────────
  set_microros_wifi_transports("YOUR_WIFI_SSID", "YOUR_WIFI_PASS", "192.168.X.X", 8888);

  delay(2000);

  allocator = rcl_get_default_allocator();
  RCCHECK(rclc_support_init(&support, 0, NULL, &allocator));
  RCCHECK(rclc_node_init_default(&node, "esp32_env_node", "", &support));

  // Publisher — Float32 → /temperature_data
  RCCHECK(rclc_publisher_init_best_effort(
    &publisher, &node,
    ROSIDL_GET_MSG_TYPE_SUPPORT(std_msgs, msg, Float32),
    "temperature_data"));

  // Subscriber — Bool ← /led_trigger
  RCCHECK(rclc_subscription_init(
    &led_subscriber, &node,
    ROSIDL_GET_MSG_TYPE_SUPPORT(std_msgs, msg, Bool),
    "led_trigger",
    &rmw_qos_profile_default));

  executor = rclc_executor_get_zero_initialized_executor();
  RCCHECK(rclc_executor_init(&executor, &support.context, 1, &allocator));
  RCCHECK(rclc_executor_add_subscription(&executor, &led_subscriber, &led_msg,
                                         &led_callback, ON_NEW_DATA));
}

void loop() {
  rclc_executor_spin_some(&executor, RCL_MS_TO_NS(10));

  // DHT11 spec: don't read faster than ~0.5 Hz. 2 s is safe.
  if (micros() - last_pub_time >= 2000000) {
    last_pub_time = micros();

    float t = dht.readTemperature();
    if (isnan(t)) {
      Serial.println(F("Failed to read DHT sensor"));
      return;
    }

    temp_msg.data = t;
    RCSOFTCHECK(rcl_publish(&publisher, &temp_msg, NULL));
  }
}
```

#### Configuration to change before uploading

In `set_microros_wifi_transports(...)`:

1. **Wi-Fi SSID** — exact name of your network
2. **Wi-Fi password**
3. **Your computer's IP address** on that network. Find it with:
   - macOS: `ifconfig | grep "inet "`
   - Linux: `ip a` (look for the IPv4 on your active interface)
   - Windows: `ipconfig`
4. **Port `8888`** — must match the UDP port you exposed on Docker

> **Tip:** Use a phone hotspot during development. Some campus/office networks block peer-to-peer UDP traffic between devices.

### 4.5 Upload

1. Plug ESP32 into USB
2. **Tools → Port** → select the new serial port (e.g. `/dev/cu.usbserial-XXXX` on macOS, `COM*` on Windows)
3. Click the **Upload** button (→ arrow)

The compile takes ~30–60 seconds. If you see `Hash of data verified` and `Done uploading`, it worked. Open the Serial Monitor at **115200 baud** to see boot messages.

---

## Phase 5 — Run the Live Demo

You will need **two terminals** open in your VNC desktop.

### Terminal 1 — Start the micro-ROS agent (UDP bridge)

```bash
cd ~/ros_udp_ws
source /opt/ros/humble/setup.bash
source install/setup.bash
ros2 run micro_ros_agent micro_ros_agent udp4 --port 8888 -v6
```

Now press the **EN / RESET** button on the ESP32. Within ~3 seconds you should see logs like:

```
info  | Root.cpp | create_client | create | client_key: 0x7A4912AF, session_id: 0x81
info  | SessionManager.hpp | establish_session | session established | client_key: 0x7A4912AF
info  | ProxyClient.cpp | create_participant | participant created | participant_id: 0x000(1)
info  | ProxyClient.cpp | create_topic | topic created | topic_id: 0x000(2)
info  | ProxyClient.cpp | create_publisher | publisher created | publisher_id: 0x000(3)
info  | ProxyClient.cpp | create_subscriber | subscriber created | subscriber_id: 0x000(4)
```

That's the ESP32 announcing itself, its node, and its topics. If you see `recv_message ... data:` lines streaming every ~2 seconds, the temperature data is flowing.

### Terminal 2 — Start the Python logic node

```bash
cd ~/ros_udp_ws
source /opt/ros/humble/setup.bash
source install/setup.bash
ros2 run env_controller temp_controller
```

You should immediately see:

```
[INFO] [temp_logic_node]: Temp: 24.50 < 29. Sending BLUE command.
[INFO] [temp_logic_node]: Temp: 24.50 < 29. Sending BLUE command.
...
```

Look at your breadboard — the **Blue LED** is now on.

### Trigger the threshold

Pinch the DHT11 sensor between your fingers, breathe warm air on it, or hold a warm cup near it. The temperature reading climbs.

As soon as it crosses **29.0 °C**, the terminal logs:

```
[INFO] [temp_logic_node]: Temp: 29.10 >= 29. Sending RED command.
```

The Blue LED snaps **off**, the Red LED snaps **on**. You have a working bidirectional IoT control loop.

---

## Manual Topic Testing

Before relying on the autonomous loop, verify each direction manually.

### Verify ESP32 → ROS 2 (sensor publishing)

In a third terminal:

```bash
source /opt/ros/humble/setup.bash
ros2 topic echo /temperature_data
```

You will see live `data: 24.5`, `data: 25.0`, ... messages every 2 seconds. If you see this, the ESP32 → ROS 2 path is solid.

### Verify ROS 2 → ESP32 (manual LED command)

Force the Red LED on:

```bash
ros2 topic pub --once /led_trigger std_msgs/msg/Bool "{data: true}"
```

Force Blue:

```bash
ros2 topic pub --once /led_trigger std_msgs/msg/Bool "{data: false}"
```

If the LEDs respond, your ROS 2 → ESP32 path is working independent of the logic node.

### Inspect the ROS graph

```bash
ros2 node list
ros2 topic list
ros2 node info /esp32_env_node
ros2 topic info /temperature_data --verbose
```

---

## Troubleshooting

### `Package 'micro_ros_agent' not found`
You sourced the wrong workspace. The agent lives in whichever workspace you ran `build_agent.sh` in. Run:
```bash
source ~/ros_udp_ws/install/setup.bash
```

### `'D1' was not declared in this scope`
You have the **ESP8266** code uploaded but the **ESP32** board selected (or vice versa). ESP32 uses raw GPIO numbers like `26`, `27`. ESP8266 uses `D1`, `D2`. Use the ESP32 sketch from Phase 4.4.

### `set_microros_wifi_transports was not declared in this scope`
You are compiling for an unsupported board (ESP8266, Uno, Nano, Mega). micro-ROS only runs natively on 32-bit boards with FreeRTOS support: ESP32, Portenta H7, Nano RP2040 Connect, GIGA R1 WiFi, Teensy 4.x, etc.

### `New publisher discovered ... incompatible QoS ... RELIABILITY`
Your Python subscriber is using Reliable QoS but micro-ROS publishes Best Effort. Fix the subscriber:
```python
from rclpy.qos import qos_profile_sensor_data
# ...
self.create_subscription(Float32, 'temperature_data', cb, qos_profile_sensor_data)
```

### ESP32 keeps blinking the red LED (error loop)
The `RCCHECK` macro caught a failure during setup. Common causes:
- Wrong Wi-Fi credentials → ESP32 can't connect
- Wrong host IP → agent unreachable
- Agent not running → start Terminal 1 first
- ESP32 and computer on different networks → check both are on the same SSID

### `Failed to read DHT sensor`
- Wrong pin in code vs wiring
- DHT11 needs 3.3 V, not 5 V on ESP32
- Bad sensor — try another DHT11
- Reading too fast — DHT11 max rate is ~1 Hz, code uses 0.5 Hz which is safe

### `clang-tidy has no installation candidate`
Outdated apt cache inside the Docker container:
```bash
sudo apt update
```
Then rerun `rosdep install`.

### Docker container can't be reached at localhost:6080
- Container stopped: `docker ps -a` → if STATUS is `Exited`, run `docker start ros2_udp_demo`
- Port conflict on host — change `6080:80` to `6081:80`

---

## How It All Connects (Mental Model)

```
                                  ┌─ rclc_publisher_init_best_effort ──> /temperature_data ──┐
                                  │                                                          │
ESP32 (micro-ROS client) ─────────┤                                                          │
                                  │                                                          ▼
                                  └─ rclc_subscription_init    <── /led_trigger ──┐    micro_ros_agent
                                                                                  │   (translates XRCE-DDS
                                                                                  │    over UDP ↔ DDS)
                                                                                  │
                                                                                  ▼
                                                              ┌─ create_subscription (Best Effort QoS)
                                                              │       /temperature_data
                                                              │
                                          temp_logic_node ────┤  (apply threshold)
                                          (Python rclpy)      │
                                                              └─ create_publisher (Reliable QoS)
                                                                      /led_trigger
```

**Key insight:** the ESP32 doesn't speak DDS directly. It speaks XRCE-DDS (a lightweight protocol for constrained devices) over UDP. The agent's job is to translate XRCE-DDS ↔ full DDS so the ESP32 looks like a normal ROS 2 node to the rest of the network.

---

## What to Try Next

- **Real sensor variety:** Swap DHT11 for ultrasonic (`HC-SR04`), LDR, BMP280 pressure sensor
- **Real actuators:** Replace LEDs with a servo (`std_msgs/Float32` for angle), a relay, or a DC motor (via L298N driver)
- **Add humidity:** DHT11 also reads humidity (`dht.readHumidity()`). Publish on a second topic `/humidity_data`
- **Custom messages:** Define a `Reading.msg` with `float32 temp`, `float32 humidity`, `string status` for richer data
- **Web visualization:** Add `rosbridge_server` + `roslibjs` to display the live temperature on a webpage
- **Multiple ESP32s:** Run several boards on different topic namespaces (`/sensor_1/temperature_data`, `/sensor_2/temperature_data`)
- **PID control:** Replace the threshold logic with a PID controller for smooth actuator control
- **Data logging:** Use `ros2 bag record /temperature_data` to capture sessions for replay/analysis

---

## File Reference

### `~/ros_udp_ws/src/env_controller/env_controller/temp_logic.py`
The ROS 2 logic node (Phase 3.2).

### `~/ros_udp_ws/src/env_controller/package.xml`
Manifest with `<exec_depend>rclpy</exec_depend>` and `<exec_depend>std_msgs</exec_depend>`.

### `~/ros_udp_ws/src/env_controller/setup.py`
Entry point: `temp_controller = env_controller.temp_logic:main`

### ESP32 Arduino sketch (`sketch.ino`)
Full firmware from Phase 4.4. Wi-Fi credentials + host IP must be updated before upload.

---

## Glossary

| Term | Meaning |
|---|---|
| **ROS 2** | Robot Operating System 2 — middleware for robot software (publish/subscribe, services, parameters) |
| **micro-ROS** | ROS 2 client for microcontrollers (ESP32, Teensy, STM32, etc.) — speaks XRCE-DDS instead of full DDS |
| **DDS** | Data Distribution Service — the underlying networking protocol of ROS 2 |
| **XRCE-DDS** | "DDS for eXtremely Resource Constrained Environments" — lightweight protocol used by micro-ROS |
| **micro_ros_agent** | The bridge process that translates XRCE-DDS (from microcontrollers) ↔ full DDS (the ROS 2 network) |
| **QoS** | Quality of Service — settings like reliability, durability, history depth that affect message delivery |
| **Best Effort** | QoS policy: send messages, don't retry on failure. Used for high-frequency sensor data. |
| **Reliable** | QoS policy: retry until delivery confirmed. Used for commands, state changes. |
| **rclpy / rclc** | ROS 2 client libraries — Python (`rclpy`) and C (`rclc`, used by micro-ROS) |
| **colcon** | The ROS 2 build tool — handles dependency ordering, isolated builds, install spaces |
| **Workspace** | A directory containing `src/`, `build/`, `install/`, `log/` — the standard ROS 2 project layout |
| **Sourcing** | Running `source install/setup.bash` to add a workspace's packages and binaries to your shell |

---

**You built a real-time, bidirectional IoT control system using industry-standard tooling.** This same architecture scales from hobby projects to production robots — the only difference is the number of nodes and complexity of the logic.

Good luck with your demo.
