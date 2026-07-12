# Ilya Papou — SRE / Platform Engineer

Site Reliability / Platform Engineer building the production platforms behind
business-critical services — where reliability, observability and automation
decide whether the business keeps running.

- **Website:** https://papou.work
- **Email:** ilya@papou.email
- **GitHub:** https://github.com/pilprod
- **Status:** Open to new opportunities

---

## Summary

I'm an SRE / Platform Engineer building production platforms where reliability,
scalability, observability and automation directly affect business-critical
services — across financial services, iGaming, financial-crime prevention,
aviation and enterprise. My current work supports Anti-Fraud, AML and KYC
workloads; I'm extending it into AI infrastructure and AI-assisted operations.

Comfortable in English-speaking engineering environments — written technical
communication, documentation, incident discussions and async collaboration.

**Focus areas:** Platform Engineering · Kubernetes · Cloud-Native Infrastructure ·
GitOps · Infrastructure Automation · Observability · Distributed Systems ·
AI-assisted Operations · Agentic Infrastructure · Production Reliability.

---

## Core skills

- **Platform / Orchestration:** Kubernetes, self-managed bare-metal RKE2, GKE, Helm, GPU Kubernetes
- **Delivery / GitOps:** GitOps, ArgoCD, GitLab CI/CD, Cloud Build, Cloud Deploy, Jenkins, GitHub Actions
- **Infrastructure as Code:** Terraform, Ansible
- **Observability:** Prometheus, VictoriaMetrics, Grafana, ELK; RED, USE, Four Golden Signals, SLI/SLO, error budgets
- **Reliability:** On-call, incident response, RCA, runbooks, disaster recovery
- **Security / Secrets:** HashiCorp Vault, External Secrets, TLS/HTTPS, least-privilege IAM, Tailscale
- **Data & Messaging:** PostgreSQL, Cloud SQL, Redis, Kafka
- **MLOps:** GPU-enabled Kubernetes, Apache Airflow, training pipelines, model registry, scalable inference, drift detection, automated retraining
- **Cloud:** GCP, Yandex Cloud, bare metal, multi-region / multi-AZ
- **Languages:** Bash, Python, Go

---

## Experience

### Senior SRE / Platform Engineer — iGaming / Fintech (NDA)
*High-load · iGaming / Fintech*

Production infrastructure for online gaming services and Financial Crime
Prevention capabilities.

**Platform Engineering**
- Business-critical infrastructure on self-managed Kubernetes (RKE2) on bare metal — chosen for cost, data residency and predictable performance under sustained high load
- Operated bare-metal node provisioning, networking and storage across the platform lifecycle
- Migrated inter-service traffic to SSL/TLS and centralized secrets in HashiCorp Vault, removing static credentials from repos and configs
- Built GitOps-based CI/CD delivery pipelines for continuous, reliable delivery

**MLOps Platform**
- Production-grade MLOps platform spanning the full ML lifecycle — automated training pipelines, model registry integration and scalable inference
- GPU-enabled Kubernetes plus a custom Airflow provider integrating Slurm to run GPU-bound training DAGs
- Observability, drift detection and automated retraining for reproducible, highly available AI/ML services
- Apache Airflow as core orchestration, with dedicated monitoring, alerting and incident response

**Production Operations**
- On-call ownership of incident response across anti-fraud and ML platforms, including RCA and recovery runbooks
- Observability with Prometheus, VictoriaMetrics, Grafana and ELK, applying SLI/SLO and the Four Golden Signals
- Reduced operational complexity through automation and platform-level fixes rather than one-off firefighting

*Tech: RKE2, Bare Metal, Helm, GitLab CI, Vault, External Secrets, Prometheus, VictoriaMetrics, Grafana, ELK, PostgreSQL, Redis, Kafka, Terraform, Airflow, Slurm, GPU Kubernetes, MLOps, Python*

### Senior SRE / Platform Engineer — Sirena-Travel
*Enterprise · Aviation / Travel Technology*

Production infrastructure for enterprise aviation and travel systems requiring
high availability, secure integrations and continuous delivery.

**Platform Engineering**
- CI/CD and infrastructure automation for high-availability platform reliability
- Observability and incident response — debugged production Kubernetes workloads and deployment failures, preparing runbooks and post-incident improvements
- PostgreSQL, Redis and Kafka in production

**Bare Metal Kubernetes**
- Bare-metal deployment chosen for the high-availability and data-residency requirements of enterprise aviation systems
- Managed node lifecycle, networking and storage directly, without a managed cloud Kubernetes offering

**Engineering Platform**
- Designed and operated the platform behind AI-assisted engineering workflows — runtime configuration and automated deployment pipelines
- CI/CD plus dedicated monitoring — health checks, task success/failure rates and latency — separate from general infrastructure observability
- Private-by-default GCP with Terraform, Tailscale-based access and least-privilege IAM, evolving the architecture as integrations grew

*Tech: RKE2, Bare Metal, GCP, GKE, Helm, GitLab CI, Cloud Build, Cloud Deploy, Vault, Terraform, Tailscale, Prometheus, VictoriaMetrics, Grafana, ELK, PostgreSQL, Redis, Kafka*

### Head of DevOps — Sber Insurance Broker
*Enterprise · Financial Services*

Built and led the DevOps function for a new cloud-native insurance platform —
from infrastructure automation and delivery pipelines to team formation and
security hardening.

**Cloud Infrastructure & Automation**
- Automated 99.9% of infrastructure with Terraform, combined with GitOps
- Led migration of services to the cloud with minimal downtime
- Defined IaC standards and rolled out infrastructure management best practices

**Team Leadership & Delivery**
- CI/CD on Jenkins and GitLab CI/CD, cutting deployment time to minutes
- Helm charts for all microservices, standardizing deployment
- Fully automated rollouts across Dev, Psi and Production
- Owned dashboards, alerts and production monitoring on-call

**Security, Monitoring & Resilience**
- All service-to-service communication moved to HTTPS with mandatory TLS
- Centralized monitoring and logging on ELK plus Prometheus and Grafana
- Geo-distributed Kubernetes across Multi-Region and Multi-AZ with automatic load balancing
- Prepared and tested disaster-recovery scenarios

*Tech: Terraform, GitOps, Kubernetes, Vault, Jenkins, GitLab CI/CD, Helm, TLS/HTTPS, SonarQube, Nexus, ELK, Prometheus, Grafana, Multi-Region, Multi-AZ*

### Senior DevOps Engineer — I-Teco
*Secure Infrastructure · Government / Enterprise*

Enterprise and public-sector infrastructure with strict security requirements
and isolated environments.

- Operated an OpenVPN-isolated infrastructure covering source control, CI/CD, messaging, search and monitoring
- Sole responsibility for the full infrastructure lifecycle — networking, service failures and CI/CD configuration
- Wrote Kubernetes manifests for microservice workloads and configured CI/CD for automated deployment into the cluster
- Integrated services under the constraints of a fully closed network

*Tech: Docker Swarm, Hyper-V, TeamCity, Nexus, RabbitMQ, Cassandra, Solr, ZooKeeper, HAProxy, ELK*

### DevOps Engineer — Flant
*Cloud Native · Kubernetes Consulting*

Worked alongside experienced Kubernetes engineers, building a strong foundation
in production Kubernetes and cloud-native engineering.

- Kubernetes objects: ConfigMap, Deployment, Service, StatefulSet, Ingress, Certificate, Secret, Job, VerticalPodAutoscaler, PodDisruptionBudget
- Helm templating for affinity rules, environment variables and tolerations; adopted Werf for chart delivery
- Logging pipeline with Filebeat, Logstash and Kibana for structured JSON logs
- Ansible playbooks to automate infrastructure component rollout; hands-on PostgreSQL / Patroni cluster operations

*Tech: Kubernetes, Werf, Helm, PostgreSQL (Patroni), Filebeat, Logstash, Kibana, Ansible*

### Platform Engineer / Full-Stack Developer — Freelance
*SMB / Startups · Cloud Platforms*

Cloud-native infrastructure and CI/CD pipelines for multiple clients using
managed cloud services.

- Multi-environment (Dev / Stage / Production) delivery pipelines — build, push, deploy
- Delivered CI/CD in both GitHub Actions and GitLab CI/CD
- Backend microservices on ExpressJS and SEO-optimized frontends on NextJS
- Nginx as reverse proxy and static file server, with Certbot for automatic TLS renewal

*Tech: Terraform, GitHub Actions, GitLab CI, Yandex Cloud, Managed PostgreSQL, Managed Kubernetes, Nginx, Docker*

### Information Security Specialist — MTS Belarus
*Enterprise · Telecom / Security*

Early career focused on infrastructure security, Linux systems and security
research — a foundation in authentication, networking and secure platform design.

- Threat modeling and access-control analysis for corporate infrastructure and workstation security
- Lab-based simulation of infrastructure compromise scenarios to study attack paths and countermeasures

*Tech: Debian, Arch Linux, Kali Linux, VPN, Virtualization, Networking, Access Control*

---

## Engineering philosophy

Reliable platforms are not created by manual operations. They are built through
architecture, automation, observability and continuous engineering improvement.

- **Platform Thinking** — build reusable platforms instead of one-off solutions
- **Reliability Engineering** — design for failure, automate recovery, measure availability
- **Automation** — everything repeatable should be automated
- **Observability** — systems should explain themselves before engineers investigate them
- **Security** — security must be embedded into the platform rather than added later

---

## Selected architecture decisions

**Why bare metal instead of managed Kubernetes.** Run production Kubernetes (RKE2)
on self-managed bare-metal servers for lower long-term cost at sustained scale,
full control over data residency, predictable performance under high load, and
deeper operational visibility — deliberately accepting more operational burden
(node lifecycle, hardware failures, capacity planning) in exchange.

**Why GitOps instead of traditional CI/CD.** Git as the single source of truth
with automated reconciliation, for reproducible and auditable deployments,
reusable delivery platforms across teams, faster and safer rollbacks, and
declarative infrastructure that's easier to reason about.

**Why platform instead of projects.** Build reusable, self-service platforms so
improvements compound across every team — centralized secrets, standardized
delivery, observability as a platform capability, and automation over manual
runbooks. Result: shared standards, faster onboarding, lower operational cost as
services grow.

---

## AI direction

Extending platform engineering into AI-assisted operations: AI-assisted incident
investigation and Root Cause Analysis, agent-based operational tooling,
automated deployment validation, context-aware and event-driven engineering
workflows, and human-supervised infrastructure automation.

---

## Contact

- **Website:** https://papou.work
- **Email:** ilya@papou.email
- **GitHub:** https://github.com/pilprod
