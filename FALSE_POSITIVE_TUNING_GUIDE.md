# False Positive Tuning Guide

## Purpose

This guide explains how to reduce noisy alerts in the SOC lab without disabling useful detections.

References:

- [Wazuh custom rules](https://documentation.wazuh.com/current/user-manual/ruleset/rules/custom.html)
- [Sigma rules](https://sigmahq.io/docs/basics/rules.html)

## Tuning Principles

- tune with precision, not broad suppression
- suppress known-benign sources, accounts, or tools
- prefer lowering severity over fully ignoring when visibility still matters
- document every exception

## 1. Brute Force Tuning

Potential false positives:

- users repeatedly mistyping passwords
- password managers retrying stale credentials
- lab testing from your own Kali IP
- admin jump boxes

Recommended tuning:

- exclude approved scanner or admin source IPs
- exclude break-glass test accounts used in labs
- keep a low-severity base rule for visibility
- only auto-block on the correlated high-confidence rule

Example strategy:

- keep `100100` enabled for visibility
- tune `100101` with exclusions for trusted IPs

## 2. Port Scan Tuning

Potential false positives:

- vulnerability scanners
- management tools touching multiple ports
- inventory systems

Recommended tuning:

- exclude trusted scanner IPs
- increase threshold from `10` to `20` if the network is noisy
- require multiple destination ports and a short timeframe
- scope the rule to lab or victim hosts only

## 3. PowerShell Tuning

Potential false positives:

- approved administrative scripts
- software deployment frameworks
- patch management tools
- helpdesk automation

Recommended tuning:

- exclude known parent processes used by trusted tooling
- exclude approved script paths
- exclude service accounts used by patching platforms
- separate informational PowerShell usage from suspicious encoded or hidden behavior

## 4. Example Wazuh Tuning Rules

Add these after the main rules if you want to suppress known lab-benign activity.

```xml
<group name="soc_lab_tuning,">

  <!-- Ignore Windows brute-force correlation from trusted admin host -->
  <rule id="100201" level="0">
    <if_sid>100101</if_sid>
    <field name="win.eventdata.ipAddress">^192\.168\.56\.50$</field>
    <description>Ignore trusted admin host generating repeated failed logons during testing</description>
    <group>tuning,false_positive,</group>
  </rule>

  <!-- Ignore port scan alerts from approved vulnerability scanner -->
  <rule id="100202" level="0">
    <if_sid>100111</if_sid>
    <field name="win.eventdata.sourceAddress">^192\.168\.56\.60$</field>
    <description>Ignore approved vulnerability scanner for port scan detections</description>
    <group>tuning,false_positive,</group>
  </rule>

  <!-- Lower severity for approved PowerShell automation account -->
  <rule id="100203" level="3">
    <if_sid>100120</if_sid>
    <field name="win.eventdata.user" type="pcre2">^WIN10-VICTIM\\svc_patch$</field>
    <description>Lower severity for approved PowerShell automation account</description>
    <group>tuning,false_positive,</group>
  </rule>

</group>
```

## 5. Sigma False Positive Documentation

Sigma supports a `falsepositives` field to document expected benign triggers. Keep this updated even if the actual filtering is implemented in Wazuh.

Good practice:

- describe the benign scenario
- describe who owns the exception
- review exceptions periodically

## 6. Review Cycle

After each lab exercise:

1. review the triggered alerts
2. identify which ones were expected
3. decide whether to suppress, lower severity, or leave untouched
4. update the Wazuh tuning rules
5. update the Sigma `falsepositives` notes
