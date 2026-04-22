# Wazuh Dashboard Panel Checklist

## Goal

Build one custom Wazuh dashboard called:

- `SOC Lab Overview`

Use this checklist to create the panels in a practical order.

## Before You Start

- confirm your custom rules are loaded
- confirm the Windows and Linux agents are sending events
- confirm your custom rule IDs are visible in Discover
- identify the Wazuh alerts index pattern used by your deployment

Recommended custom rule IDs:

- `100101` Windows brute force
- `100111` Port scan
- `100120` Suspicious PowerShell
- `100131` Linux SSH brute force

## Panel Checklist

### 1. Alert Severity Overview

- panel type: pie chart or bar chart
- metric: count
- bucket: `rule.level`
- purpose: quick view of alert severity distribution

### 2. Top Triggering Rules

- panel type: horizontal bar chart
- metric: count
- bucket: `rule.description.keyword`
- purpose: see which detections are firing most often

### 3. Alerts by Agent

- panel type: bar chart
- metric: count
- bucket: `agent.name.keyword`
- purpose: compare Windows, Linux, and future sensors

### 4. Windows Brute Force Timeline

- panel type: line chart
- metric: count
- filter: `rule.id:100101`
- purpose: monitor repeated failed logons against Windows

### 5. Linux SSH Brute Force Timeline

- panel type: line chart
- metric: count
- filter: `rule.id:100131`
- purpose: monitor repeated SSH failures on the Linux victim

### 6. Port Scan Timeline

- panel type: line chart
- metric: count
- filter: `rule.id:100111`
- purpose: highlight Nmap-style reconnaissance spikes

### 7. Suspicious PowerShell Table

- panel type: data table
- filter: `rule.id:100120`
- columns:
  - `@timestamp`
  - `agent.name`
  - `rule.description`
  - `data.win.eventdata.image`
  - `data.win.eventdata.commandLine`
- purpose: inspect suspicious PowerShell execution details quickly

### 8. Top Source IPs

- panel type: bar chart
- metric: count
- bucket: source IP field used in your alerts index
- likely fields:
  - `data.srcip`
  - `win.eventdata.ipAddress`
  - `win.eventdata.sourceAddress`
- purpose: identify the noisiest attacker IPs

### 9. MITRE ATT&CK Coverage

- panel type: table or bar chart
- metric: count
- bucket: `rule.mitre.id`
- purpose: view the ATT&CK techniques observed in the lab

### 10. Recent High-Severity Alerts

- panel type: data table
- filter: `rule.level:[10 TO 16]`
- columns:
  - `@timestamp`
  - `agent.name`
  - `rule.id`
  - `rule.description`
  - `rule.level`
- purpose: give analysts a live triage queue

### 11. Active Response Events

- panel type: data table or line chart
- filter: events related to active response in your alerts index
- suggested columns:
  - `@timestamp`
  - `agent.name`
  - `rule.description`
  - `data.srcip`
- purpose: confirm that auto-blocking executed when expected

### 12. Agent Health Snapshot

- use the built-in Wazuh agent view
- track:
  - connected agents
  - disconnected agents
  - last keepalive
- purpose: make sure telemetry gaps are visible

## Recommended Saved Searches

Create these first so you can reuse them in multiple panels:

- `Windows Brute Force`
  - `rule.id:100101`
- `Linux Brute Force`
  - `rule.id:100131`
- `Port Scan`
  - `rule.id:100111`
- `Suspicious PowerShell`
  - `rule.id:100120`
- `High Severity`
  - `rule.level:[10 TO 16]`

## Recommended Dashboard Layout

Top row:

- Alert Severity Overview
- Top Triggering Rules
- Alerts by Agent

Middle row:

- Windows Brute Force Timeline
- Linux SSH Brute Force Timeline
- Port Scan Timeline

Bottom row:

- Suspicious PowerShell Table
- Top Source IPs
- MITRE ATT&CK Coverage
- Recent High-Severity Alerts

Side or lower section:

- Active Response Events
- Agent Health Snapshot

## Quick Filters to Add

- last `15 minutes`
- last `1 hour`
- last `24 hours`
- `agent.name:"WIN10-VICTIM"`
- `agent.name:"linux-victim"`
- `data.srcip:"192.168.56.30"`
- `rule.level:[10 TO 16]`

## Build Order

1. create the saved searches
2. build severity, rules, and agent panels
3. build the brute-force, scan, and PowerShell panels
4. add MITRE and high-severity tables
5. add active response and agent health views
6. test the dashboard by generating activity from Kali

## Validation Checklist

- Windows brute-force attacks appear in the Windows panel
- Linux SSH brute-force attacks appear in the Linux panel
- Nmap scans appear in the scan panel
- suspicious PowerShell appears in the PowerShell table
- the Kali IP appears in top source IPs
- MITRE mappings populate correctly
- active response actions are visible after Linux auto-block triggers

## Copy-Ready Installation Steps

### Install the rule bundle

Copy [WAZUH_LOCAL_RULES_BUNDLE.xml](/Users/subramanyasr/Documents/New%20project/WAZUH_LOCAL_RULES_BUNDLE.xml) into:

```text
/var/ossec/etc/rules/local_rules.xml
```

Then restart Wazuh:

```bash
sudo systemctl restart wazuh-manager
```

### Test the rules

```bash
/var/ossec/bin/wazuh-logtest
```

### Build the dashboard

In Wazuh Dashboard:

1. open `Explore` or `Discover`
2. create and save the searches listed above
3. open `Visualize`
4. create the panels from this checklist
5. open `Dashboards`
6. create `SOC Lab Overview`
7. add the saved panels
