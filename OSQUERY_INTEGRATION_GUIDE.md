# Osquery Integration Guide

## Purpose

This guide adds deeper endpoint visibility using Osquery managed through Wazuh.

Reference:

- [Wazuh Osquery module](https://documentation.wazuh.com/current/user-manual/capabilities/system-inventory/osquery.html)

## Why Add Osquery

Osquery helps with:

- live process and listening-port visibility
- user and service discovery
- scheduled host-state checks
- lightweight threat hunting

## Basic Enablement

Install Osquery on the target endpoint, then enable the Wazuh module:

```xml
<ossec_config>
  <wodle name="osquery"/>
</ossec_config>
```

Restart the Wazuh agent after enabling it.

## Good Starter Queries

- list local users
- list listening ports
- list processes with deleted binaries
- list autoruns or services

## SOC Lab Use Cases

- confirm suspicious processes after PowerShell alerts
- check listening ports after brute-force activity
- inspect persistence-related artifacts
