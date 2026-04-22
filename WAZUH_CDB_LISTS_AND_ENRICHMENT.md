# Wazuh CDB Lists and Enrichment Guide

## Purpose

This guide adds simple enrichment and allowlist or denylist logic to the SOC lab using Wazuh CDB lists.

Use cases:

- allowlist trusted admin IPs
- mark known scanner IPs
- denylist suspicious IPs
- tag known bad hashes or domains

## Why This Matters

CDB lists let you tune detections and enrich triage without hardcoding values into every rule.

Reference:

- [Using CDB lists](https://documentation.wazuh.com/current/user-manual/ruleset/cdb-list.html)
- [CDB lists and threat intelligence](https://documentation.wazuh.com/current/user-manual/capabilities/malware-detection/cdb-lists-threat-intelligence.html)

## Example List Files

Store list files in:

```text
/var/ossec/etc/lists/
```

### Trusted admin IPs

File:

```text
/var/ossec/etc/lists/trusted-admin-ips
```

Contents:

```text
192.168.56.50:allow
192.168.56.51:allow
```

### Approved scanner IPs

File:

```text
/var/ossec/etc/lists/approved-scanners
```

Contents:

```text
192.168.56.60:scanner
```

### Known bad IPs

File:

```text
/var/ossec/etc/lists/known-bad-ips
```

Contents:

```text
203.0.113.10:malicious
198.51.100.99:malicious
```

## Example Rules

```xml
<group name="soc_lab_cdb,">

  <rule id="100300" level="0">
    <if_sid>100101</if_sid>
    <list field="win.eventdata.ipAddress" lookup="address_match_key_value" check_value="^allow">etc/lists/trusted-admin-ips</list>
    <description>Ignore brute-force correlation from trusted admin IP</description>
    <group>tuning,allowlist,</group>
  </rule>

  <rule id="100301" level="0">
    <if_sid>100111</if_sid>
    <list field="win.eventdata.sourceAddress" lookup="address_match_key_value" check_value="^scanner">etc/lists/approved-scanners</list>
    <description>Ignore port-scan alerts from approved scanner</description>
    <group>tuning,allowlist,</group>
  </rule>

  <rule id="100302" level="13">
    <if_group>json</if_group>
    <list field="srcip" lookup="address_match_key_value" check_value="^malicious">etc/lists/known-bad-ips</list>
    <description>Event source IP matches known-bad IP list</description>
    <group>threat_intel,blacklist,</group>
  </rule>

</group>
```

Restart the manager after adding or changing CDB lists:

```bash
sudo systemctl restart wazuh-manager
```
