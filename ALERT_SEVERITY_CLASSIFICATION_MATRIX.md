# Alert Severity Classification Matrix

## Purpose

This matrix standardizes how the SOC lab assigns severity to alerts so detections, triage, dashboards, and response actions stay consistent.

Wazuh uses rule levels from `0` to `16`. The current Wazuh rules classification defines those levels from ignored to severe attack.

Reference:

- [Wazuh rules classification](https://documentation.wazuh.com/current/user-manual/ruleset/rules/rules-classification.html)

## Lab Severity Model

| Wazuh Level | Lab Severity | Meaning | Typical Action |
|---|---|---|---|
| `0-3` | Informational | Benign or expected event | Store only |
| `4-5` | Low | Single low-confidence suspicious event | Review if repeated |
| `6-9` | Medium | Suspicious behavior needing analyst validation | Investigate |
| `10-12` | High | Strong attack signal or correlated suspicious behavior | Investigate quickly and consider containment |
| `13-16` | Critical | High-confidence malicious activity or confirmed compromise | Immediate response |

## Recommended Severity for This Lab

| Use Case | Rule ID | Recommended Wazuh Level | Lab Severity | Reason |
|---|---|---|---|---|
| Single Windows failed logon | `100100` | `5` | Low | Often benign by itself |
| Correlated Windows brute force | `100101` | `12` | High | Repeated failures from one IP strongly suggest attack |
| Single inbound connection visibility event | `100110` | `4` | Low | Visibility event, not malicious on its own |
| Correlated port scan | `100111` | `10` | High | Reconnaissance pattern from one IP to many ports |
| Suspicious PowerShell | `100120` | `9` | Medium | Strong signal, but still can have admin false positives |
| Single Linux SSH failure | `100130` | `5` | Low | Common and often benign alone |
| Correlated Linux SSH brute force | `100131` | `12` | High | Repeated SSH failures indicate attack behavior |

## Escalation Guidance

- keep single failed logins at `low`
- raise correlated brute-force behavior to `high`
- keep suspicious PowerShell at `medium` unless combined with download, persistence, or privilege abuse
- escalate to `critical` if any of these are followed by confirmed successful logon, payload execution, privilege escalation, or lateral movement

## Suggested Future Critical Rules

Consider adding higher-severity rules later for:

- successful login after repeated failures
- PowerShell followed by outbound network connection to attacker infrastructure
- creation of a new admin user after suspicious logon
- persistence creation after suspicious execution

## Dashboard Filters

Use these dashboard bands:

- `Low`: `rule.level:[4 TO 5]`
- `Medium`: `rule.level:[6 TO 9]`
- `High`: `rule.level:[10 TO 12]`
- `Critical`: `rule.level:[13 TO 16]`
