# ROS 2 Fundamentals — A Beginner's Guide to Robot Software

> **How to use this file**
> This document is structured the way your platform stores courses: one **Course** → several **Modules** → several **Lessons**.
> 1. Create the course in **Admin → Courses → New Course** using the metadata in the next block.
> 2. For each module, click **Add Module** and copy its title/description.
> 3. For each lesson, click **Add Lesson** and **paste the lesson's markdown body** straight into the content editor — the editor auto-converts markdown into formatted blocks.
> 4. Every image below uses a themed placeholder from `placehold.co`. Replace each placeholder URL with your own uploaded image (upload via the editor's image button) when you have a real diagram or screenshot.

---

## Course Metadata

| Field | Value |
|-------|-------|
| **Title** | ROS 2 Fundamentals: A Beginner's Guide to Robot Software |
| **Slug** | ros2-fundamentals |
| **Difficulty** | Beginner |
| **Estimated Hours** | 14 |
| **Bi Points** | 500 |
| **Tags** | ROS 2, Robotics, Robot Operating System, DDS, Python, Beginner, Humble |

**Description (short):**
Learn ROS 2 from absolute zero. Understand what ROS 2 is, why robots need it, and how its building blocks — nodes, topics, services, parameters, and actions — fit together. By the end you'll install ROS 2, drive a simulated robot, and build your own package. No prior robotics experience required.

**What you'll be able to do after this course:**
- Explain what ROS 2 is and why it beats a single monolithic script
- Install ROS 2 on Ubuntu, WSL, Docker, or a VM
- Run and inspect nodes, topics, services, parameters, and actions
- Control a simulated robot (turtlesim) entirely from the command line
- Create, build, and source your own ROS 2 workspace and package

---
---

# Module 1 — Getting Started with ROS 2

**Module description:** Understand what ROS 2 actually is, why intelligent robots need it, the DDS middleware underneath it, and how to install it on any operating system. You'll finish by running your very first ROS 2 program.

---

## Lesson 1.1 — What is ROS 2 (and Why It Matters)

### What you'll learn
- What ROS 2 really is (hint: it is **not** an operating system)
- The "monolith problem" and how ROS 2 solves it
- The core capabilities ROS 2 gives you for free

### ROS 2 is a framework, not an OS

ROS stands for **Robot Operating System**, but that name is misleading. ROS 2 is **not** an operating system like Windows or Linux. It is a **middleware framework** — a collection of tools, libraries, and conventions that sit on top of your real operating system and help you build, run, and scale robot software.

![ROS 2 sits between your application code and the operating system](https://placehold.co/1200x460/0a0a0a/4ade80/png?text=Your+Robot+App+%E2%86%92+ROS+2+Middleware+%E2%86%92+Operating+System)

Out of the box (or through well-supported community packages), ROS 2 gives you:

- **Simulation** — test robots without hardware
- **Motion planning** — figure out how an arm or robot should move
- **Navigation** — move a robot from A to B while avoiding obstacles
- **Manipulation** — pick up and move objects
- **Perception** — make sense of cameras, LiDAR, and other sensors

### The "Monolith Problem"

You *can* write a single Python script that moves a robot. In the real world that script fails, because it is a **monolith**.

> **Monolith:** an entire application built as a single, unified, self-contained unit — rather than as a collection of smaller, independent services.

If any one part of a monolith crashes, the **whole robot** stops. That is dangerous for a 50 kg machine moving through a room.

ROS 2 solves this by splitting your robot into many small, independent programs that talk to each other. This gives you three big wins:

**1. Fault tolerance**
If your *Object Detection* program crashes, your *Safety / Braking* program keeps running. The system doesn't die — it **degrades gracefully**.

**2. Quality of Service (QoS)**
You can prioritize different kinds of traffic:
- **Sensor data** → "best effort" (dropping one LiDAR frame is fine)
- **Control commands** → "reliable" (dropping a *Stop* command is catastrophic)

**3. Lifecycle management**
ROS 2 programs follow a strict state machine. A robot component doesn't just "turn on" — it goes `unconfigured → inactive → active`. This stops a robot from moving **before its sensors are calibrated**.

![A monolith crashes entirely; a modular system degrades gracefully](https://placehold.co/1200x460/0a0a0a/4ade80/png?text=Monolith+%3A+all-or-nothing+%E2%80%94+vs+%E2%80%94+ROS+2+%3A+graceful+degradation)

### Recap
- ROS 2 is a **framework / middleware**, not an operating system.
- It splits a robot into small independent programs so one failure can't kill the whole system.
- QoS lets you treat "stop the robot" differently from "here's a camera frame."

---

## Lesson 1.2 — ROS 2 and Intelligent Agents

### What you'll learn
- What an "intelligent agent" is in robotics
- How the Perception → Reasoning → Action loop maps onto ROS 2
- Why an agent is **many** programs, not one

### The agent loop

An **intelligent agent** is defined by a repeating cycle:

**Perception → Reasoning → Action → (repeat)**

A robot senses the world, decides what to do, acts, and then senses again. ROS 2 has a natural home for each phase.

![The agent loop: perceive, reason, act, repeat](https://placehold.co/1200x460/0a0a0a/4ade80/png?text=Perception+%E2%86%92+Reasoning+%E2%86%92+Action+%E2%86%92+loop)

| Agent phase | ROS 2 equivalent |
|-------------|------------------|
| **Perception** | Subscribers — reading LiDAR, Camera, IMU data |
| **Reasoning** | Services / Actions — processing data, planning paths |
| **Action** | Publishers — sending velocity / motor commands |

### Why ROS 2 fits AI agents

An AI agent needs sensing, a world model, planning, and action — all at once, with strict timing. Here is what ROS 2 supplies for each need:

| Need | ROS 2 mechanism |
|------|-----------------|
| Concurrent processes | **Nodes** (backed by DDS) |
| Async communication | **Topics** (pub/sub), **Services** (request/response), **Actions** (long-running with feedback) |
| Real-time guarantees | **DDS QoS profiles** (reliability, durability, deadline) |
| Distributed compute | DDS multicast discovery — transparent across a LAN |
| Hardware abstraction | Standard messages (`sensor_msgs`, `geometry_msgs`) |
| Embedded reach | **micro-ROS** over UDP / serial |
| Sim ↔ real parity | Same topic graph in simulation and on the real robot |
| Ecosystem | Nav2, MoveIt, PlanSys2, `ros2_control` |

> **Key idea:** In ROS 2, an "agent" is **not** a single program. It is the *emergent behaviour* of many nodes interacting over a shared communication bus.

### Recap
- The agent loop (perceive → reason → act) maps cleanly onto subscribers, services/actions, and publishers.
- Intelligence in ROS 2 emerges from many small nodes cooperating, not one big brain.

---

## Lesson 1.3 — DDS: The Middleware Underneath

### What you'll learn
- What DDS is and why ROS 2 uses it
- The benefits DDS brings to a robot system

### What is DDS?

ROS 2 uses **DDS (Data Distribution Service)** as its middleware — the layer that actually moves messages between programs. You rarely touch DDS directly, but it powers everything.

![Nodes discover each other automatically over DDS](https://placehold.co/1200x460/0a0a0a/4ade80/png?text=Nodes+auto-discover+%26+exchange+data+over+DDS)

DDS gives ROS 2:
- **Lower coupling** — programs don't need to know each other's addresses; they discover each other automatically.
- **Scalability** — works from one laptop to many machines on a network.
- **Reliability & security** — configurable delivery guarantees and encryption.
- **Flexibility** — swap DDS vendors without changing your code.

This is the same class of technology used in the **defense and aerospace industries**, which is a good sign of how robust it is.

### Recap
- DDS is the message-passing engine under ROS 2.
- It enables automatic discovery, scalability, reliability, and security — for free.

---

## Lesson 1.4 — Installing ROS 2

### What you'll learn
- Which Ubuntu version pairs with which ROS 2 release
- How to install ROS 2 on Ubuntu, WSL, Docker, a VM, macOS, or Windows

### Pick the right pair

ROS 2 releases ("distros") are tied to specific Ubuntu versions. For a beginner in 2026, **Humble (Ubuntu 22.04)** is the most tutorial-friendly and battle-tested choice — this whole course uses Humble.

| ROS 2 Distribution | Status | Ubuntu Version | Support End (EOL) |
|--------------------|--------|----------------|-------------------|
| Jazzy (Jalisco) | Current LTS | Ubuntu 24.04 | 2029 |
| Humble (Hawksbill) | **Recommended for this course** | Ubuntu 22.04 | 2027 |
| Iron (Irwini) | Short-term | Ubuntu 22.04 | 2024 |
| Rolling (Ridley) | Rolling dev | Ubuntu 24.04 / 26.04 | N/A |

![Match your ROS 2 distro to your Ubuntu version](https://placehold.co/1200x420/0a0a0a/4ade80/png?text=Humble+%E2%86%94+Ubuntu+22.04++%7C++Jazzy+%E2%86%94+Ubuntu+24.04)

### Option 1 — Native Ubuntu 22.04

Download and install Ubuntu 22.04, then follow the official Debian-package install:

- Ubuntu 22.04 ISO: `https://releases.ubuntu.com/22.04/`
- Official ROS 2 Humble install guide: `https://docs.ros.org/en/humble/Installation/Ubuntu-Install-Debs.html`

### Option 2 — Windows users: WSL (easiest)

If you're on Windows, **WSL** (Windows Subsystem for Linux) is the smoothest path:

```bash
wsl --install Ubuntu-22.04
```

Then open the Ubuntu terminal and follow the same Debian-package install guide above.

### Option 3 — Docker (no Ubuntu install needed)

A minimal containerized ROS 2 desktop you can reach from your browser:

```bash
docker run -d -p 6080:80 --security-opt seccomp=unconfined --shm-size=512m ghcr.io/tiryoh/ros2-desktop-vnc:humble
```

Then open `http://localhost:6080` in your browser.

### Option 4 — Virtual machine

Install Ubuntu 22.04 inside VirtualBox using the same ISO link as Option 1, then install ROS 2 normally.

### Other operating systems

- **macOS:** `https://docs.ros.org/en/humble/Installation/Alternatives/macOS-Development-Setup.html`
- **Windows (native):** `https://docs.ros.org/en/humble/Installation/Alternatives/Windows-Development-Setup.html`

> **Tip:** If you're virtualized or in Docker, install **VS Code** inside the Linux environment for a comfortable editor.

### Recap
- Humble + Ubuntu 22.04 is the recommended beginner combo.
- WSL is the easiest path on Windows; Docker needs no Ubuntu install at all.

---

## Lesson 1.5 — Your First ROS 2 Program (Sanity Check)

### What you'll learn
- How to "source" ROS 2 in a terminal
- How to run two programs that talk to each other

### Sourcing — the one command you'll always run

Before ROS 2 works in a terminal, you must **source** its setup file. This makes all `ros2` commands and packages available:

```bash
source /opt/ros/humble/setup.bash
```

> You'll do this in **every new terminal**. Later we'll show how to automate it.

### Talker and Listener

Open **two** terminals. In each one, source ROS 2 first.

**Terminal 1 — the talker (publishes messages):**

```bash
source /opt/ros/humble/setup.bash
ros2 run demo_nodes_py talker
```

**Terminal 2 — the listener (receives messages):**

```bash
source /opt/ros/humble/setup.bash
ros2 run demo_nodes_py listener
```

![Talker and listener exchanging 'Hello World' messages](https://placehold.co/1200x460/0a0a0a/4ade80/png?text=talker+%E2%9E%9C+%22Hello+World%22+%E2%9E%9C+listener)

If you see the talker printing `Publishing: 'Hello World: N'` and the listener printing `I heard: 'Hello World: N'`, **congratulations — ROS 2 is working** and two independent programs are communicating.

### Recap
- `source /opt/ros/humble/setup.bash` activates ROS 2 in a terminal.
- The talker/listener demo proves your install works and shows pub/sub in action.

---
---

# Module 2 — ROS 2 Core Concepts

**Module description:** The heart of the course. Using the friendly `turtlesim` simulator, you'll learn every core ROS 2 communication concept hands-on: nodes, topics, interfaces, services, parameters, and actions — all from the command line, no programming yet.

---

## Lesson 2.1 — Workspaces & the Shell Environment

### What you'll learn
- What "underlay" and "overlay" workspaces are
- Why sourcing matters and how to make it automatic

### The workspace idea

A **workspace** is the place on your system where you develop with ROS 2. ROS 2 combines workspaces using your shell environment:

- The **underlay** is the core ROS 2 installation (`/opt/ros/humble`).
- **Overlays** are your own local workspaces layered on top.

You typically have several workspaces active at once. Combining them makes it easy to develop against different ROS 2 versions or different sets of packages — and even install multiple ROS 2 distros on one computer and switch between them.

![Your overlay workspace stacks on top of the ROS 2 underlay](https://placehold.co/1200x440/0a0a0a/4ade80/png?text=Underlay+(%2Fopt%2Fros)+%2B+Overlay+(your+ws))

### Sourcing, again

This stacking is done by **sourcing setup files** every time you open a new shell:

```bash
source /opt/ros/humble/setup.bash
```

Without sourcing, you can't access ROS 2 commands or find ROS 2 packages — you simply can't use ROS 2.

> **Make it automatic:** add the source line to the end of your `~/.bashrc` so every new terminal is ready:
> ```bash
> echo "source /opt/ros/humble/setup.bash" >> ~/.bashrc
> ```

**Reference:** `https://docs.ros.org/en/humble/Tutorials/Beginner-CLI-Tools/Configuring-ROS2-Environment.html`

### Recap
- Underlay = core install; overlays = your workspaces on top.
- Source ROS 2 in every terminal — or add it to `~/.bashrc` once.

---

## Lesson 2.2 — Turtlesim: Your First Robot

### What you'll learn
- How to launch the turtlesim simulator
- How to drive a simulated turtle with your keyboard

`turtlesim` is a tiny 2D simulator built for learning ROS 2. The "robot" is a turtle that leaves a trail — perfect for seeing concepts in action.

**Terminal 1 — start the simulator:**

```bash
source /opt/ros/humble/setup.bash
ros2 run turtlesim turtlesim_node
```

**Terminal 2 — control it with your keyboard:**

```bash
source /opt/ros/humble/setup.bash
ros2 run turtlesim turtle_teleop_key
```

![The turtlesim window with a turtle that draws as it moves](https://placehold.co/1000x600/0a0a0a/4ade80/png?text=turtlesim+window+%E2%80%94+drive+with+arrow+keys)

Click the **teleop** terminal and press the **arrow keys** — the turtle moves and draws a trail. You now have a running robot system made of two cooperating programs.

### Recap
- `turtlesim_node` is the simulated robot; `turtle_teleop_key` sends it commands.
- Two separate programs, communicating — just like the talker/listener.

---

## Lesson 2.3 — Nodes

### What you'll learn
- What a node is and the "single responsibility" rule
- How to inspect a node

### One node, one job

A **node** is a fundamental ROS 2 building block that does **one modular job** — e.g. controlling wheel motors, or publishing data from a laser scanner. Nodes exchange data with each other through **topics, services, actions, and parameters**.

![Each node has a single responsibility and connects to others](https://placehold.co/1200x460/0a0a0a/4ade80/png?text=Node+%3D+one+job++(motors%2C+camera%2C+planner%2C+...))

### Inspecting a node

With turtlesim running, look inside its node:

```bash
ros2 node info /turtlesim
```

```text
/turtlesim
  Subscribers:
    /parameter_events: rcl_interfaces/msg/ParameterEvent
    /turtle1/cmd_vel: geometry_msgs/msg/Twist
  Publishers:
    /parameter_events: rcl_interfaces/msg/ParameterEvent
    /rosout: rcl_interfaces/msg/Log
    /turtle1/color_sensor: turtlesim/msg/Color
    /turtle1/pose: turtlesim/msg/Pose
  Service Servers:
    /clear: std_srvs/srv/Empty
    /kill: turtlesim/srv/Kill
    /spawn: turtlesim/srv/Spawn
    /turtle1/set_pen: turtlesim/srv/SetPen
    /turtle1/teleport_absolute: turtlesim/srv/TeleportAbsolute
    /turtle1/teleport_relative: turtlesim/srv/TeleportRelative
    /reset: std_srvs/srv/Empty
  Action Servers:
    /turtle1/rotate_absolute: turtlesim/action/RotateAbsolute
```

This single command reveals everything the node offers: what it listens to (subscribers), what it sends (publishers), and what it provides (services, actions).

### Recap
- A node = one focused job.
- `ros2 node info <node>` shows all of a node's connections.

---

## Lesson 2.4 — Topics

### What you'll learn
- What a topic is and the publish/subscribe model
- How to list, echo, inspect, and publish to topics

### Topics = a data bus

**Topics** are the main way nodes move data. A node **publishes** messages to a topic; any number of nodes **subscribe** to receive them. Communication can be one-to-one, one-to-many, many-to-one, or many-to-many.

![Publishers send to a topic; subscribers receive from it](https://placehold.co/1200x460/0a0a0a/4ade80/png?text=Publisher+%E2%86%92+%2Fturtle1%2Fcmd_vel+%E2%86%92+Subscribers)

### List the topics

With turtlesim and teleop both running:

```bash
ros2 topic list
```

```text
/parameter_events
/rosout
/turtle1/cmd_vel
/turtle1/color_sensor
/turtle1/pose
```

A topic is any path where data flows. The turtle publishes its data under `/turtle1`.

### See what's on a topic

```bash
ros2 topic echo /turtle1/cmd_vel
```

Drive the turtle and you'll see velocity commands stream by:

```text
linear:
  x: 2.0
  y: 0.0
  z: 0.0
angular:
  x: 0.0
  y: 0.0
  z: 0.0
```

### Inspect a topic

```bash
ros2 topic info /turtle1/cmd_vel
```

```text
Type: geometry_msgs/msg/Twist
Publisher count: 1
Subscription count: 2
```

### Publish to a topic yourself

You can become the publisher. Send a continuous stream:

```bash
ros2 topic pub /turtle1/cmd_vel geometry_msgs/msg/Twist "{linear: {x: 2.0, y: 0.0, z: 0.0}, angular: {x: 0.0, y: 0.0, z: 1.8}}"
```

Or send exactly once with `--once`:

```bash
ros2 topic pub --once /turtle1/cmd_vel geometry_msgs/msg/Twist "{linear: {x: 2.0, y: 0.0, z: 0.0}, angular: {x: 0.0, y: 0.0, z: 1.8}}"
```

The turtle moves — because *you* just published a command to the topic it subscribes to.

### Recap
- Topics carry continuous streams of data using publish/subscribe.
- `ros2 topic list / echo / info / pub` let you observe and drive any topic.

---

## Lesson 2.5 — Interfaces & Messages

### What you'll learn
- What a message type (interface) is
- How to read a message's structure

### Messages must match

Nodes send data over topics as **messages**. A publisher and a subscriber must use the **same message type** to communicate. These types are called **interfaces**.

List topics together with their types:

```bash
ros2 topic list -t
```

```text
/parameter_events [rcl_interfaces/msg/ParameterEvent]
/rosout [rcl_interfaces/msg/Log]
/turtle1/cmd_vel [geometry_msgs/msg/Twist]
/turtle1/color_sensor [turtlesim/msg/Color]
/turtle1/pose [turtlesim/msg/Pose]
```

The part in brackets — e.g. `geometry_msgs/msg/Twist` — is the interface.

### Read a message's shape

```bash
ros2 interface show geometry_msgs/msg/Twist
```

```text
# This expresses velocity in free space broken into its linear and angular parts.
Vector3  linear
        float64 x
        float64 y
        float64 z
Vector3  angular
        float64 x
        float64 y
        float64 z
```

So a `Twist` is two 3-element vectors: `linear` and `angular`. Written compactly:

```text
{linear: {x: 2.0, y: 0.0, z: 0.0}, angular: {x: 0.0, y: 0.0, z: 1.8}}
```

That's exactly the structure you published in the previous lesson — and exactly what `/turtlesim` expects.

![A Twist message: linear xyz and angular xyz](https://placehold.co/1200x440/0a0a0a/4ade80/png?text=Twist+%3D+linear%7Bx%2Cy%2Cz%7D+%2B+angular%7Bx%2Cy%2Cz%7D)

### Recap
- An interface is the message type both sides of a topic must agree on.
- `ros2 interface show <type>` reveals the exact fields you must fill in.

---

## Lesson 2.6 — Services

### What you'll learn
- How services differ from topics
- How to list, inspect, and call services

### Call-and-response

**Services** use a **request/response** model, unlike topics' continuous streams. A service only does work when a **client calls it**, and it returns a single response.

![Service: client sends a request, server returns one response](https://placehold.co/1200x440/0a0a0a/4ade80/png?text=Client+%E2%80%94request%E2%86%92+Server+%E2%80%94response%E2%86%92+Client)

### List services

```bash
ros2 service list
```

```text
/clear
/kill
/reset
/spawn
/turtle1/set_pen
/turtle1/teleport_absolute
/turtle1/teleport_relative
... (plus parameter services on every node)
```

Nearly every node has the parameter-related services (`get_parameters`, `set_parameters`, etc.) — those are infrastructure that parameters are built on.

### A service's type

Service types have **two** parts: a request and a response, separated by `---`.

```bash
ros2 service type /clear
```

```text
std_srvs/srv/Empty
```

A more interesting one:

```bash
ros2 interface show turtlesim/srv/Spawn
```

```text
float32 x
float32 y
float32 theta
string name # Optional. A unique name will be created and returned if empty
---
string name
```

Everything **above** `---` is the request (where to spawn a turtle); everything **below** is the response (the new turtle's name).

### Call a service

```bash
ros2 service call /clear std_srvs/srv/Empty
```

That wipes the turtle's trail. Now spawn a second turtle:

```bash
ros2 service call /spawn turtlesim/srv/Spawn "{x: 2, y: 2, theta: 0.2, name: ''}"
```

![A second turtle appears after calling the /spawn service](https://placehold.co/1000x600/0a0a0a/4ade80/png?text=%2Fspawn+%E2%86%92+a+new+turtle+appears)

### Recap
- Services are one-off request/response calls, not continuous streams.
- A service type has a request and a response split by `---`.
- `ros2 service call <name> <type> "<args>"` triggers it.

---

## Lesson 2.7 — Parameters

### What you'll learn
- What parameters are (node settings)
- How to get, set, save, and load parameters

### Node settings

A **parameter** is a configuration value belonging to a node — think of them as that node's settings. They can be integers, floats, booleans, strings, or lists. Each node owns its own parameters.

```bash
ros2 param list
```

```text
/turtlesim:
  background_b
  background_g
  background_r
  use_sim_time
  ...
```

It looks like `/turtlesim`'s parameters control the window's background color via RGB values. (Every node has `use_sim_time` — it's universal, not turtlesim-specific.)

### Get a parameter

```bash
ros2 param get /turtlesim background_g
```

```text
Integer value is: 86
```

### Set a parameter

```bash
ros2 param set /turtlesim background_r 150
```

![Changing background_r repaints the turtlesim window](https://placehold.co/1000x500/0a0a0a/4ade80/png?text=background_r+%3D+150+%E2%86%92+window+color+changes)

### Save and reload parameters

Dump a node's parameters to a file:

```bash
ros2 param dump /turtlesim > turtlesim.yaml
```

Load them back into a running node:

```bash
ros2 param load /turtlesim turtlesim.yaml
```

Or apply a parameter file when a node **starts**:

```bash
ros2 run turtlesim turtlesim_node --ros-args --params-file turtlesim.yaml
```

### Recap
- Parameters are per-node settings you can read and change live.
- `dump` / `load` / `--params-file` let you save and restore configurations.

---

## Lesson 2.8 — Actions

### What you'll learn
- When to use an action instead of a service
- The goal / feedback / result structure
- How to send goals (with and without feedback)

### Long-running, cancelable tasks

**Actions** are for **long-running tasks**. They have three parts: a **goal**, **feedback**, and a **result**. Actions are built on top of topics and services. They're like services, but with two superpowers: they can be **canceled**, and they give **continuous feedback** while running.

![An action streams feedback between accepting a goal and returning a result](https://placehold.co/1200x460/0a0a0a/4ade80/png?text=Goal+%E2%86%92+(feedback...feedback...)+%E2%86%92+Result)

### Inspecting an action

```bash
ros2 action list
```

```text
/turtle1/rotate_absolute
```

```bash
ros2 action info /turtle1/rotate_absolute
```

```text
Action: /turtle1/rotate_absolute
Action clients: 1
    /teleop_turtle
Action servers: 1
    /turtlesim
```

### The action's structure

```bash
ros2 interface show turtlesim/action/RotateAbsolute
```

```text
# The desired heading in radians
float32 theta
---
# The angular displacement in radians to the starting position
float32 delta
---
# The remaining rotation in radians
float32 remaining
```

Three sections split by `---`: the **goal** (`theta`), the **result** (`delta`), and the **feedback** (`remaining`).

### Send a goal

```bash
ros2 action send_goal /turtle1/rotate_absolute turtlesim/action/RotateAbsolute "{theta: 1.57}"
```

```text
Waiting for an action server to become available...
Sending goal:
   theta: 1.57

Goal accepted with ID: f8db8f44410849eaa93d3feb747dd444

Result:
  delta: -1.568000316619873

Goal finished with status: SUCCEEDED
```

The turtle rotates. Every goal gets a unique ID, and the result reports `delta` — how far it turned from the start.

### Send a goal with live feedback

```bash
ros2 action send_goal /turtle1/rotate_absolute turtlesim/action/RotateAbsolute "{theta: -1.57}" --feedback
```

```text
Sending goal:
   theta: -1.57

Goal accepted with ID: e6092c831f994afda92f0086f220da27

Feedback:
  remaining: -3.1268222332000732
Feedback:
  remaining: -3.1108222007751465
...
Result:
  delta: 3.1200008392333984

Goal finished with status: SUCCEEDED
```

You keep getting feedback (the remaining radians) until the goal completes.

### Module 2 — Big Picture Recap

- **Node:** a fundamental ROS 2 element with one modular purpose.
- **Topics:** one-way streams; a node publishes, many can subscribe.
- **Services:** request/response — a client asks, the server answers once.
- **Parameters:** a node's configuration values (its settings).
- **Actions:** like services, but for long tasks — with feedback and the ability to cancel. A robot would use an action to "navigate to this position," streaming progress along the way.

---
---

# Module 3 — Building Your Own Packages

**Module description:** Move from *using* ROS 2 to *building* with it. Create a workspace, generate your first package, understand every file it produces, and learn the build-and-source workflow that every ROS 2 developer uses daily.

---

## Lesson 3.1 — Creating a Workspace

### What you'll learn
- How to create a ROS 2 workspace directory
- How to resolve dependencies before building

### Make the workspace

Best practice is a fresh directory per workspace. A common name is `ros2_ws` ("development workspace"), with a `src` folder for source code:

```bash
mkdir -p ~/ros2_ws/src
cd ~/ros2_ws/src
```

![The ros2_ws workspace layout with a src folder](https://placehold.co/1200x440/0a0a0a/4ade80/png?text=ros2_ws%2Fsrc++%E2%86%90+your+packages+go+here)

### Resolve dependencies first

Before building, check for missing dependencies — you don't want a long build to fail at the end. From the **root** of your workspace (`~/ros2_ws`):

```bash
rosdep install -i --from-path src --rosdistro humble -y
```

### Recap
- Create `~/ros2_ws/src` and put packages inside `src`.
- Run `rosdep install` from the workspace root to catch missing dependencies early.

---

## Lesson 3.2 — Creating a Package

### What you'll learn
- How to generate a Python ROS 2 package
- What the create command produces

From inside `~/ros2_ws/src`, create a Python package:

```bash
ros2 pkg create --build-type ament_python --license Apache-2.0 py_pubsub
```

This creates a new package called `py_pubsub` inside `src`. The `--build-type ament_python` flag says "this is a Python package," and `--license` records the legal terms.

![ros2 pkg create scaffolds a ready-to-build package](https://placehold.co/1200x420/0a0a0a/4ade80/png?text=ros2+pkg+create+%E2%86%92+py_pubsub%2F+scaffold)

### Recap
- `ros2 pkg create --build-type ament_python ... <name>` scaffolds a Python package.
- Run it from inside your workspace's `src` directory.

---

## Lesson 3.3 — Anatomy of a Package

### What you'll learn
- What each file inside a package is for
- What each top-level workspace directory holds

### Inside the package

| File / Folder | Role in the package |
|---------------|---------------------|
| `py_pubsub/` (inner) | The Python module directory where you save node scripts (e.g. `publisher.py`). |
| `package.xml` | Manifest file with metadata and dependencies (like `rclpy`) needed for the build. |
| `setup.py` | Defines how the package is installed and maps scripts to ROS 2 executables via *entry points*. |
| `setup.cfg` | Configures where script executables are placed during the build. |
| `resource/` | Contains a marker file so the ROS 2 environment can "find" your package. |
| `test/` | Reserved for unit tests using frameworks like `pytest`. |
| `LICENSE` | The legal terms for using and distributing your code. |

### The workspace's top-level folders

After you build, your workspace (`ros2_ws`) contains four key directories:

| Directory | Purpose |
|-----------|---------|
| `src/` | Where your source code and packages (like `py_pubsub`) live. |
| `build/` | Intermediate files generated during the `colcon build` process. |
| `install/` | The final executables and environment setup scripts — **this is what you source.** |
| `log/` | Logs for each build session, for troubleshooting. |

![Workspace folders: src, build, install, log](https://placehold.co/1200x440/0a0a0a/4ade80/png?text=src+%E2%86%92+build+%E2%86%92+install+(source+this)+%2B+log)

### Recap
- `package.xml` + `setup.py` define your package; your nodes live in the inner module folder.
- You **source the `install/` folder** after building — that's where the runnable output lands.

---

## Lesson 3.4 — Build, Source, Run

### What you'll learn
- The everyday ROS 2 development loop
- Where to go next

### The daily loop

Once your package has code, the workflow you'll repeat constantly is:

**1. Build** from the workspace root:

```bash
cd ~/ros2_ws
colcon build
```

**2. Source the overlay** (the freshly built install folder):

```bash
source install/setup.bash
```

**3. Run your node:**

```bash
ros2 run py_pubsub <your_executable_name>
```

![The build → source → run development loop](https://placehold.co/1200x440/0a0a0a/4ade80/png?text=colcon+build+%E2%86%92+source+install%2Fsetup.bash+%E2%86%92+ros2+run)

> **Remember the two sources:** the **underlay** (`/opt/ros/humble/setup.bash`) makes ROS 2 itself available; the **overlay** (`install/setup.bash`) makes *your* package available. Source both.

### Where to go next

You now know every core ROS 2 concept and how to scaffold a package. The natural next step is writing actual node code — start with the official beginner tutorials:

- Simple Publisher & Subscriber (Python): `https://docs.ros.org/en/humble/Tutorials/Beginner-Client-Libraries/Writing-A-Simple-Py-Publisher-And-Subscriber.html`
- Simple Service & Client (Python): `https://docs.ros.org/en/humble/Tutorials/Beginner-Client-Libraries/Writing-A-Simple-Py-Service-And-Client.html`
- Custom ROS 2 Interfaces: `https://docs.ros.org/en/humble/Tutorials/Beginner-Client-Libraries/Custom-ROS2-Interfaces.html`
- Using Parameters in a Class (Python): `https://docs.ros.org/en/humble/Tutorials/Beginner-Client-Libraries/Using-Parameters-In-A-Class-Python.html`

### Course Recap — You Did It

Across this course you learned to:
- Explain what ROS 2 is and why modular beats monolithic
- Map the agent loop (perceive → reason → act) onto ROS 2 communication
- Install ROS 2 on any platform and run your first program
- Use nodes, topics, interfaces, services, parameters, and actions hands-on
- Create, build, and source your own workspace and package

From here, keep building — write your own publisher and subscriber, then a service, then wire them into a small agent. Welcome to robotics. 🤖
