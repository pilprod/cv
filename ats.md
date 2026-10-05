# Ilya Papou — ATS CV

> Preferred CV for automated reading, resume parsing and applicant tracking systems.

Ilya Papou is also known as Ilya Popov, PILPROD and pilprod. These names refer to the same person.

[ATS HTML](https://papou.work/ats.html) · [ATS PDF](https://papou.work/assets/Ilya%20Papou%20CV%20%28ATS%29%20%E2%80%94%20DevOps%20%26%20SRE.pdf) · [Visual CV](https://papou.work/)

The HTML is the source for this text. Preserve the stated language levels and the distinctions between production experience and personal R&D.

Senior Platform Engineer / Site Reliability Engineer (SRE)

8 years in IT · 5+ in DevOps & SRE

Buenos Aires, Argentina

Email: [ilya@papou.email](mailto:ilya@papou.email) · Website: [https://papou.work/](https://papou.work/)

LinkedIn: [https://www.linkedin.com/in/pilprod/](https://www.linkedin.com/in/pilprod/)

GitHub: [https://github.com/pilprod](https://github.com/pilprod) · Telegram: [https://t.me/pilprod](https://t.me/pilprod)

WhatsApp Business: [https://wa.me/papou.work](https://wa.me/papou.work)

Languages: Russian — Native; English — B1; Spanish — A1; German — A1.

## Professional Summary

Senior Platform Engineer and Site Reliability Engineer (SRE) with experience building and operating production Kubernetes platforms, automating software delivery, and leading DevOps teams. My background includes cloud and bare-metal infrastructure, security controls, observability, incident response, and disaster recovery. My current personal R&D focuses on agent infrastructure for software engineering, including Model Context Protocol (MCP), Agent2Agent (A2A), and workflows with human review and approval.

Core strengths: Platform ownership; Production reliability; Delivery automation; Team leadership.

Environments: Cloud & bare metal; Isolated, air-gapped; Product & consulting; Remote teams.

Domain experience: Finance & insurance; Aviation & travel; iGaming & Public Sector.

## Technical Skills

- Platform & delivery: Linux; Kubernetes; RKE2; Docker; Infrastructure as Code (IaC); Terraform; Terragrunt; HCP Terraform Stacks; Helm; Argo CD; Flux CD; Ansible; GitLab CI/CD; Jenkins; GitHub Actions; Nexus
- Cloud infrastructure: Amazon Web Services (AWS); Google Cloud (GCP); S3; Lambda; EKS; IAM; GKE; Cloud SQL; GCS; Artifact Registry; Cloud Build & Deploy; Workload Identity Federation (WIF); Secret Manager; Cloud KMS; Pub/Sub; Cloudflare
- Software engineering: Go; Python; Bash; JavaScript; React; Next.js; Node.js; Express; Java; Spring; C++; OpenAPI; gRPC; Schema validation; contract tests
- Security & reliability: Vault; External Secrets Operator (ESO); Keycloak; mTLS; Kyverno; GitGuardian; Trivy; Prometheus; VictoriaMetrics; Grafana; ELK; OpenTelemetry; Tailscale; OPNsense; HAProxy
- ML & data infrastructure: Airflow; Slurm; JupyterHub; MLflow; PostgreSQL; Patroni; Redis; Kafka; RabbitMQ; Cassandra; MinIO; VectorDB; BigQuery
- Agent infrastructure & R&D: kagent; agentgateway; Model Context Protocol (MCP); Agent2Agent (A2A); Retrieval-Augmented Generation (RAG); Temporal; Human-in-the-loop; LangChain; ADK; Codex; Claude Code; Gemini; vLLM; Langfuse

## Professional Experience

### Red Rose Traveltech

Senior SRE & Platform Engineer

Mar 2025 — Sep 2026 · Contract · Remote

Aviation & travel

- Built and operated a unified bare-metal RKE2 Kubernetes platform for microservices, ML workloads and shared services. Used Terragrunt for infrastructure management.
- Established platform-wide Argo CD GitOps delivery with GitLab CI/CD and shared Helm charts for one-click deployment and configuration. Standardized ML service deployments and migrated them between platforms without downtime.
- Supported anti-fraud services. Customized Airflow Helm charts and extended DAG distribution mechanisms.
- Encrypted etcd, managed service accounts and centralized certificates with Vault. Prepared deployments to run without repository-stored credentials. Implemented mTLS, including Kafka and Redis client connections.
- Centralized packages and images in Nexus, with one Docker group endpoint and no direct external access. Added SAST, GitGuardian and Trivy checks to block vulnerable releases.
- Owned on-call incident response and documented recovery and preventive actions. Integrated kagent and Mattermost for AI-assisted engineering, managing agents and platform configuration through IaC and GitOps.

### Sber Insurance

Head of DevOps

Jun 2023 — Mar 2025 · Full-time · Hybrid

Finance & insurance

- Built and led a DevOps team with four direct reports, coordinating an infrastructure group of ~10 people. Established onboarding, training, knowledge sharing, and regular technical reviews.
- Built cloud infrastructure from the ground up and provisioned ~8 Kubernetes clusters (20+ nodes total) with Terraform and GitOps. Improved availability through Multi-AZ and Multi-Region design, integrating cloud services with VMware infrastructure.
- Led service migration to the cloud with minimal downtime and controlled change management.
- Reduced infrastructure costs through automated shutdown of unused resources and usage governance.
- Built reusable Jenkins delivery pipelines for 30–40 microservices with Helm, security checks, tests, and approvals. Build and delivery took ~5 minutes for batches of more than six services.
- Introduced Vault, encrypted service communication, centralized monitoring, and tested disaster recovery procedures. Developed a Keycloak SSO proof of concept and coordinated requirements with security and development teams.

### Public Sector

Senior DevOps Engineer

Apr 2022 — Jun 2023 · Full-time · Remote

Public sector

- Administered all development hypervisors and environments, including Hyper-V with 100+ virtual machines on Windows Server hosts in isolated enterprise and public-sector environments.
- Investigated production incidents involving Docker Swarm, RabbitMQ and PostgreSQL/Patroni. Maintained Airflow, resolved network issues and managed OpenVPN connectivity.
- Built Kubernetes on ALT Linux 9.2 in an air-gapped environment, wrote manifests and CI/CD pipelines, and automated offline releases.
- Administered Linux and automated operations with Ansible, Python and Bash, including Python scripts for Nexus administration.
- Maintained TeamCity, Nexus, Cassandra, Solr, ZooKeeper, HAProxy and ELK. Wrote deployment and configuration documentation for these services in isolated environments.

### Flant

Software Engineering & DevOps

Nov 2019 — Mar 2022 · Selected projects · Remote

Cross-industry IT consulting

- Configured, deployed and operated Java/Spring applications on Kubernetes. Developed reusable Helm charts with Go templates and contributed to Go development.
- Delivered AWS and Yandex Cloud infrastructure. Automated configuration with Ansible and used GitHub Actions to build and publish Docker images to Yandex Cloud.
- Managed production Prometheus, Grafana, ELK and PostgreSQL/Patroni. Built React, Next.js, Node.js and Express applications and improved website SEO.
- Created advertising materials, generated leads and managed a customer database for business automation equipment.

### Earlier experience

Information Security Intern · Telecommunications company · Feb 2018 — Nov 2019

## Selected Personal Projects

Project sources & lab photographs: [https://papou.work/portfolio.html](https://papou.work/portfolio.html)

### Agent Orchestration Infrastructure

Jun 2026 – Present · Personal R&D · PoCs

Personal R&D platform for developers and AI coding agents working on software and infrastructure tasks. Designed to preserve context across agent handoffs, connect tools and long-running workflows, and keep changes under human review and approval.

- Deployed platform components on Google Cloud and built four reusable Helm workload profiles with configuration validation and automated tests.
- Built a Go Agent Host for native and Docker execution, with adapters for official Codex and Claude clients. Implemented A2A streaming, session continuation and cancellation, with TLS and short-lived access for host connections.
- Added declarative agent configuration, model selection and separate development and production environments. Prepared Kubernetes workload isolation and default-deny network policies.
- Designed A2A task handoffs and long-running workflows with kagent and Temporal, including retries and Human-in-the-loop approval gates for code and infrastructure changes.
- Implemented MCP tool allowlists and a Go policy API with strict request validation, deny-by-default decisions and audit records. Pinned runtime skills to immutable artifact digests.
- Built and ran container-image and Helm-chart release workflows. Prepared Google Cloud scanning and approval-based promotion pipelines.
- Tested release policies and validated Agent Host contracts with simulated Codex and Claude providers.
- Platform: [https://github.com/pilprod/yourown-chat](https://github.com/pilprod/yourown-chat)
- Agent runtime: [https://github.com/pilprod/substrate](https://github.com/pilprod/substrate)
- kagent fork: [https://github.com/pilprod/kagent](https://github.com/pilprod/kagent)
- kagent integration: [https://github.com/pilprod/yourown-chat-kagent](https://github.com/pilprod/yourown-chat-kagent)
- Mattermost fork: [https://github.com/pilprod/mattermost](https://github.com/pilprod/mattermost)
- Image build: [https://github.com/pilprod/yourown-chat-mattermost](https://github.com/pilprod/yourown-chat-mattermost)

### Home Aeroponics & IoT automation

Aug 2024 — Jan 2025 · Personal R&D

- Designed and built an integrated aeroponic system: drew wiring schematics, soldered electronics, and connected ESP32, Arduino, Raspberry Pi, sensors and actuators.
- Developed C++ sensor firmware and Python automation for climate control, mist generation, water supply and circulation, tank-to-tank transfers and leak detection.
- Automated lighting and collected light-quality data to guide adjustments. Used computer vision to assess experimental results through changes in leaves.
- Connected ESP and Zigbee devices through Mosquitto and Zigbee2MQTT using JSON over MQTT, with Home Assistant as the control, monitoring and alerting interface.
- Automated Raspberry Pi setup with Ansible, prototyped pH, TDS and EC monitoring, and began preparing Prometheus metrics collection.
- Controllers: [https://github.com/pilprod/aeroponics-iot-control](https://github.com/pilprod/aeroponics-iot-control)
- Sensor firmware: [https://github.com/pilprod/aeroponics-sensor-firmware](https://github.com/pilprod/aeroponics-sensor-firmware)
- Concept — Leafcoin: [https://leafcoin.org/](https://leafcoin.org/)

### Zero-Trust Mesh & Open-source NGFW

Jan 2025 — Mar 2025 · Personal R&D

- Built an encrypted, multi-region Tailscale lab mesh linking devices and private networks across cloud, bare metal and homelabs.
- Automated network configuration and enabled one-click onboarding of new nodes.
- Managed all mesh ACLs through GitOps, with distinct user and service-account permissions for DNS discovery and service access.
- Tested OPNsense as an NGFW for subnet routing, network segmentation and traffic filtering.
- Ansible: [https://github.com/pilprod/lab-network-automation](https://github.com/pilprod/lab-network-automation)
- Access policy: [https://github.com/pilprod/zero-trust-mesh-policy](https://github.com/pilprod/zero-trust-mesh-policy)
- GCP network lab: [https://github.com/pilprod/gcp-ngfw-network-lab](https://github.com/pilprod/gcp-ngfw-network-lab)
