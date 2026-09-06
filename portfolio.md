# Ilya Papou — Project sources and lab photographs

Ilya Papou, also known as Ilya Popov, PILPROD and pilprod.

[CV](https://papou.work/) · [Readable portfolio](https://papou.work/portfolio.html) · [GitHub](https://github.com/pilprod) · [LinkedIn](https://www.linkedin.com/in/pilprod/)

## Agent Orchestration Infrastructure

Jun 2026 – Present · Personal R&D · PoCs · Buenos Aires, Argentina

Personal R&D for developers and AI coding agents working on software and infrastructure tasks, with context-preserving handoffs, tool integration and human review.

Platform components were deployed on Google Cloud. Orchestration and approval flows include designed and prepared work; Agent Host contracts were validated with simulated providers, not a claimed production-wide end-to-end deployment.

- [CV entry](https://papou.work/#projects)
- [LinkedIn Projects](https://www.linkedin.com/in/pilprod/details/projects/): Agent Orchestration Infrastructure · Personal R&D · PoCs
- [Associated LinkedIn Experience](https://www.linkedin.com/in/pilprod/details/experience/): Agent Infrastructure Engineer · Personal R&D · PoCs — YourOwn.Chat

- [pilprod/yourown-chat](https://github.com/pilprod/yourown-chat): Google Cloud infrastructure and delivery configuration for the chat and agent platform. Terraform, Helm and release-pipeline work.
- [pilprod/substrate](https://github.com/pilprod/substrate): Substrate fork used for external-worker and Agent Host runtime integration. Fork of kagent-dev/substrate; upstream code and project-specific integration are distinct. Upstream: https://github.com/kagent-dev/substrate.
- [pilprod/kagent](https://github.com/pilprod/kagent): Kubernetes-native agent orchestration fork used for integration experiments. Fork of kagent-dev/kagent; not a claim of authorship of the upstream project. Upstream: https://github.com/kagent-dev/kagent.
- [pilprod/yourown-chat-kagent](https://github.com/pilprod/yourown-chat-kagent): Integration contracts, pinned source and release locks, and testbed configuration. Integration and conformance layer, separate from the kagent fork.
- [pilprod/mattermost](https://github.com/pilprod/mattermost): Self-hosted team-chat fork with server-side patches and container-build workflows. Fork of mattermost/mattermost; upstream ownership and licensing remain distinct. Upstream: https://github.com/mattermost/mattermost.
- [pilprod/yourown-chat-mattermost](https://github.com/pilprod/yourown-chat-mattermost): Build configuration combining Mattermost server and web submodules into a runtime image. Includes a private web dependency; the public snapshot alone is not a complete public build.

## Home Aeroponics & IoT automation

Aug 2024 – Jan 2025 · Personal R&D · Moscow City, Russia

An integrated aeroponics lab combining sensor electronics, C++ firmware, Python automation, MQTT and Home Assistant monitoring.

The photographs document the wider historical lab. The public repositories are selected archival snapshots, not the complete installation or proof of a currently buildable or safety-tested system.

- [CV entry](https://papou.work/#home-aeroponics)
- [LinkedIn Projects](https://www.linkedin.com/in/pilprod/details/projects/): Home Aeroponics & IoT automation · Personal R&D
- [Associated LinkedIn Experience](https://www.linkedin.com/in/pilprod/details/experience/): IoT & Automation Engineer · Personal R&D — Home Aeroponics & IoT automation

- [pilprod/aeroponics-iot-control](https://github.com/pilprod/aeroponics-iot-control): Python/MQTT climate-device controllers and sanitized Mosquitto and Zigbee2MQTT examples. Historical snapshot; not the complete Home Assistant configuration. No integration or physical-safety validation claimed.
- [pilprod/aeroponics-sensor-firmware](https://github.com/pilprod/aeroponics-sensor-firmware): Five archived Arduino prototypes for light sensing, water-sensor telemetry and relay-command experiments. Experimental 2024 source variants, not final solutions or build-verified releases. Dependencies, incomplete integrations and hardware-safety limitations are documented per sketch.
  - [Light sensors with JSON/MQTT](https://github.com/pilprod/aeroponics-sensor-firmware/blob/main/uno/uno.ino): Archival prototype, not a final solution. Arduino Uno R4 WiFi prototype; missing modified sensor library, undefined software-I2C instances and unregistered message callback.
  - [Light sensors with Serial output](https://github.com/pilprod/aeroponics-sensor-firmware/blob/main/variants/tcs34725_serial/tcs34725_serial.ino): Archival prototype, not a final solution. Four TCS34725 sensors through separate software-I2C buses; modified Adafruit dependency is absent. No MQTT.
  - [pH and relay commands](https://github.com/pilprod/aeroponics-sensor-firmware/blob/main/variants/ph_relay_serial/ph_relay_serial.ino): Archival prototype, not a final solution. Serial-controlled relay experiment with pH readings. No MQTT; calibration and relay states are not hardware-validated.
  - [EC/TDS and Serial1 relay commands](https://github.com/pilprod/aeroponics-sensor-firmware/blob/main/variants/ec_tds_relay_serial/ec_tds_relay_serial.ino): Archival prototype, not a final solution. Water-sensor and relay experiment. MQTT connects but does not publish telemetry in this variant.
  - [pH and moisture telemetry](https://github.com/pilprod/aeroponics-sensor-firmware/blob/main/variants/ph_moisture_mqtt/ph_moisture_mqtt.ino): Archival prototype, not a final solution. pH and two analog moisture inputs with averaging and JSON/MQTT. Calibration, conversion and periodic reset remain unverified.

### Lab photographs

These show the wider historical installation, not build verification or all code in either public repository. Both aeroponics READMEs contain the gallery. Five photos have background or identifying-area AI retouching. The root-chamber photograph has not been redrawn.

- [Electronics workbench](https://papou.work/portfolio-images/electronics-workbench.jpg): Development boards, sensors, wiring and soldering tools during prototyping. AI-retouched background or identifying areas. [Published source](https://github.com/pilprod/aeroponics-iot-control/blob/9057bcd017df480416863801cf507760f6c2b6da/docs/images/electronics-workbench.jpg).
- [Wiring and I/O diagram](https://papou.work/portfolio-images/wiring-diagram.jpg): Original component-connection drawing from system design. [Published source](https://github.com/pilprod/aeroponics-iot-control/blob/9057bcd017df480416863801cf507760f6c2b6da/docs/images/wiring-diagram.jpg).
- [Breadboard prototype](https://papou.work/portfolio-images/breadboard-prototype-1024.jpg): Breadboard-mounted sensor modules and jumper wiring during controller prototyping. [Published source](https://github.com/pilprod/aeroponics-iot-control/blob/6e428389b7df697cc4fede585ad199d1fd922211/docs/images/breadboard-prototype-1024.jpg).
- [Home Assistant dashboard](https://papou.work/portfolio-images/home-assistant-dashboard.jpg): Climate and water measurements, lighting controls and device states. [Published source](https://github.com/pilprod/aeroponics-iot-control/blob/9057bcd017df480416863801cf507760f6c2b6da/docs/images/home-assistant-dashboard.jpg).
- [Lighting and ventilation](https://papou.work/portfolio-images/lighting-ventilation.jpg): Suspended fixtures, ventilation equipment and wiring inside the enclosure. AI-retouched background or identifying areas. [Published source](https://github.com/pilprod/aeroponics-iot-control/blob/9057bcd017df480416863801cf507760f6c2b6da/docs/images/lighting-ventilation.jpg).
- [Water system](https://papou.work/portfolio-images/water-system.jpg): Reservoirs, dosing pumps, valves, tubing and circulation plumbing. AI-retouched background or identifying areas. [Published source](https://github.com/pilprod/aeroponics-iot-control/blob/9057bcd017df480416863801cf507760f6c2b6da/docs/images/water-system.jpg).
- [Enclosure camera](https://papou.work/portfolio-images/enclosure-camera.jpg): Camera placement within the experimental installation. AI-retouched background or identifying areas. [Published source](https://github.com/pilprod/aeroponics-iot-control/blob/9057bcd017df480416863801cf507760f6c2b6da/docs/images/enclosure-camera.jpg).
- [Power shield](https://papou.work/portfolio-images/power-shield.jpg): A commercial power shield integrated into the electronics assembly. AI-retouched background or identifying areas. [Published source](https://github.com/pilprod/aeroponics-iot-control/blob/9057bcd017df480416863801cf507760f6c2b6da/docs/images/power-shield.jpg).
- [Root chamber](https://papou.work/portfolio-images/root-chamber.jpg): Suspended roots and internal tubing in the chamber. [Published source](https://github.com/pilprod/aeroponics-iot-control/blob/9057bcd017df480416863801cf507760f6c2b6da/docs/images/root-chamber.jpg).

## Zero-Trust Mesh & Open-source NGFW

Jan 2025 – Mar 2025 · Personal R&D · Bangkok City, Thailand

A multi-region Tailscale lab with automated node configuration, GitOps-managed access policies and OPNsense network experiments.

Public sources are sanitized lab examples. They do not include live inventories, credentials or a claim that the examples are deployed as published.

- [CV entry](https://papou.work/#zero-trust-mesh)
- [LinkedIn Projects](https://www.linkedin.com/in/pilprod/details/projects/): Zero-Trust Mesh & Open-source NGFW · Personal R&D
- [Associated LinkedIn Experience](https://www.linkedin.com/in/pilprod/details/experience/): Network & Security Engineer · Personal R&D — Zero-Trust Mesh & Open-source NGFW

- [pilprod/lab-network-automation](https://github.com/pilprod/lab-network-automation): Ansible installation, enrollment and network configuration for Tailscale lab nodes. Sanitized automation without private inventories or credentials.
- [pilprod/zero-trust-mesh-policy](https://github.com/pilprod/zero-trust-mesh-policy): Tagged service-access policy for agents, storage, observability and workflow services. Policy example, not a published live network configuration.
- [pilprod/gcp-ngfw-network-lab](https://github.com/pilprod/gcp-ngfw-network-lab): Terraform LAN/WAN, routing and NAT foundation for an OPNsense lab. Network foundation only; no appliance image, cloud deployment or apply is implied.
