# SOC Dashboard v2 Guide

## Goal

Extend the original dashboard so it covers:

- endpoint detections
- vulnerability exposure
- FIM activity
- network IDS telemetry
- threat-intel hits
- Active Response actions

## New Panels to Add

### Exposure and Hygiene

- vulnerability count by severity
- top vulnerable packages
- endpoints with most CVEs

### File Integrity Monitoring

- file modifications by host
- file creations in monitored sensitive paths
- registry modifications on Windows

### Threat Intelligence

- known-bad IP hits
- top IOC matches
- events by allowlist or denylist status

### Network IDS

- Suricata alert timeline
- top signatures
- top protocols

### Response and Operations

- active response actions by host
- cases by status
- unresolved high-severity alerts

## Suggested Dashboard Sections

1. `Detection`
2. `Exposure`
3. `Integrity`
4. `Threat Intel`
5. `Response`
6. `Operations`
