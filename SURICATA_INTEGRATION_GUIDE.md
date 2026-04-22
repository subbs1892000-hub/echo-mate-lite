# Suricata Integration Guide

## Purpose

This guide adds network telemetry to the SOC lab using Suricata so the dashboard can show endpoint and network evidence together.

Reference:

- [Wazuh Suricata integration proof of concept](https://documentation.wazuh.com/current/proof-of-concept-guide/integrate-network-ids-suricata.html)

## Recommended Role

Run Suricata on:

- a dedicated Ubuntu sensor
- or the Linux victim if resources are limited

## Basic Steps

### 1. Install Suricata

```bash
sudo add-apt-repository ppa:oisf/suricata-stable
sudo apt-get update
sudo apt-get install suricata -y
```

### 2. Enable Eve JSON Output

Make sure Suricata writes alerts to a JSON log such as:

```text
/var/log/suricata/eve.json
```

### 3. Collect Suricata Logs with Wazuh Agent

Add to the Wazuh agent config on the Suricata host:

```xml
<ossec_config>
  <localfile>
    <location>/var/log/suricata/eve.json</location>
    <log_format>json</log_format>
  </localfile>
</ossec_config>
```

Restart the agent:

```bash
sudo systemctl restart wazuh-agent
```

## Detection Value

Suricata improves the lab by adding:

- network scan visibility
- HTTP and DNS context
- IDS signatures
- a second source of truth beyond endpoint logs

## Dashboard Additions

Add panels for:

- Suricata alert count
- top Suricata signatures
- source IPs from network IDS
- protocol distribution
