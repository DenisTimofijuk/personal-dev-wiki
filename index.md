---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Personal Dev Wiki"
  text: "My collection of solutions, tutorials, and documentation"
  tagline: Solutions for homelab, programming, and technical challenges I've encountered
  image: /logo.png
  actions:
    - theme: brand
      text: Browse Documentation
      link: /HomeLab/
    - theme: alt
      text: Troubleshooting Guides
      link: /HomeLab/TrueNAS/TrueNas-troubleshooting

features:
  - icon: 🏠
    title: Homelab & Infrastructure
    details: TrueNAS configurations, network setups, Proxmox/VMware, Docker containers, self-hosted services, and monitoring stacks
    link: /HomeLab/
    linkText: Explore homelab guides

  - icon: 💻
    title: Programming & Development
    details: Python scripts, JavaScript solutions, database queries, API integrations, and development tool configurations
    link: /Programming/
    linkText: View code examples

  - icon: 🔧
    title: System Administration
    details: Linux server configs, shell scripts, performance tuning, firewall setups, SSL/TLS, and authentication systems
    link: /Systems/
    linkText: Check sysadmin docs

  - icon: 🤖
    title: Automation & Scripting
    details: Ansible playbooks, cron jobs, system maintenance scripts, deployment automation, and workflow optimization
    link: /Tools/
    linkText: Browse automation tools

  - icon: 📊
    title: Monitoring & Alerting
    details: Prometheus, Grafana, log analysis, performance monitoring, alert configurations, and dashboard setups
    link: /HomeLab/
    linkText: Setup monitoring

  - icon: 🚨
    title: Troubleshooting & Fixes
    details: Quick reference for common issues and their solutions - documented problems I've encountered and resolved
    link: /HomeLab/TrueNAS/TrueNas-troubleshooting
    linkText: Find solutions
---

## About This Wiki

This is my personal knowledge base - a living collection of documentation that grows with each technical challenge I solve. Everything here represents real-world problems I've encountered and the solutions that worked for me.

### 🏷️ Quick Navigation Tags

Find content by common categories:

- **#docker** - Container-related configurations and issues
- **#network** - Networking problems and setups
- **#database** - Database configurations and optimization
- **#security** - Security-related topics and hardening
- **#automation** - Scripts and automation workflows
- **#monitoring** - Monitoring and alerting solutions
- **#backup** - Backup strategies and recovery procedures
- **#performance** - Performance tuning and optimization

### 📖 Documentation Philosophy

Each guide follows a consistent structure:
- **Problem description** - What issue does this solve?
- **Environment details** - System and version information
- **Prerequisites** - What you need before starting
- **Step-by-step solution** - Clear, actionable instructions
- **Prevention tips** - How to avoid the issue in the future
- **Resources** - Links to official docs and related topics
