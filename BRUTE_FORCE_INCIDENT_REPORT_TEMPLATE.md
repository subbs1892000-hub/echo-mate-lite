# Brute Force Attack Incident Report Template

## 1. Incident Summary

- `Incident Title`:
- `Incident ID`:
- `Date Opened`:
- `Reported By`:
- `Analyst Name`:
- `Severity`:
- `Status`:
- `Affected Asset(s)`:
- `Source IP Address(es)`:
- `Target Account(s)`:

### Executive Summary

Provide a short summary of the incident, including what happened, how it was detected, the systems impacted, and the current status of containment.

## 2. Detection Details

- `Detection Source`: Wazuh / SIEM / EDR / Windows Event Logs / Firewall Logs
- `Detection Rule Name`:
- `Alert ID`:
- `First Alert Time`:
- `Last Alert Time`:
- `Number of Authentication Failures`:
- `Authentication Type`: RDP / SSH / VPN / Web login / SMB / Other

### Detection Description

Document the alert logic or analyst observation that identified the brute-force activity.

Example:

`The SIEM generated a brute-force alert after detecting 5 or more failed login attempts from the same source IP within 2 minutes against a Windows 10 host over RDP.`

## 3. Timeline

| Time (Local) | Event |
|---|---|
| `YYYY-MM-DD HH:MM:SS` | Initial suspicious authentication failures observed |
| `YYYY-MM-DD HH:MM:SS` | SIEM alert triggered |
| `YYYY-MM-DD HH:MM:SS` | Analyst began triage |
| `YYYY-MM-DD HH:MM:SS` | Additional failed attempts confirmed |
| `YYYY-MM-DD HH:MM:SS` | Source IP blocked or access disabled |
| `YYYY-MM-DD HH:MM:SS` | Affected account reset or locked |
| `YYYY-MM-DD HH:MM:SS` | Host reviewed for successful compromise |
| `YYYY-MM-DD HH:MM:SS` | Incident contained |
| `YYYY-MM-DD HH:MM:SS` | Recovery completed |
| `YYYY-MM-DD HH:MM:SS` | Incident closed |

## 4. Indicators of Compromise

### Network Indicators

- `Source IP`:
- `Destination IP`:
- `Destination Port`:
- `Protocol`:
- `Geo-location`:

### Host Indicators

- `Hostname`:
- `Username(s) targeted`:
- `Failed logon Event IDs`:
- `Successful logon Event IDs`:
- `Related process names`:
- `Related command lines`:
- `Created files or tools observed`:

### Security Log Indicators

- repeated failed logons from a single IP
- multiple usernames targeted from the same IP
- account lockouts
- successful login following many failures
- unusual login times or unusual source geography

## 5. MITRE ATT&CK Mapping

| Tactic | Technique ID | Technique Name | Relevance |
|---|---|---|---|
| Credential Access | `T1110` | Brute Force | Repeated password guessing against one or more accounts |
| Credential Access | `T1110.001` | Password Guessing | Repeated guesses against a specific account or service |
| Credential Access | `T1110.003` | Password Spraying | Attempts using common passwords across many accounts |
| Initial Access | `T1078` | Valid Accounts | Applicable if the brute-force attempt results in a successful login |
| Defense Evasion | `T1027` | Obfuscated Files or Information | Applicable if scripts or encoded commands are used after access |

### MITRE Analysis Notes

Record which techniques were directly observed versus inferred from the evidence.

## 6. Investigation Findings

### Scope

- `Number of source IPs involved`:
- `Number of accounts targeted`:
- `Number of systems targeted`:
- `Was access successful?`: Yes / No / Unknown

### Findings

- Describe whether the activity was limited to failed attempts or resulted in account compromise.
- Note whether the attacker targeted a single account or many accounts.
- State whether additional post-authentication activity was found.
- Document whether persistence, lateral movement, or malware execution was observed.

## 7. Root Cause / Attack Vector

- `Exposed Service`:
- `Authentication Interface`:
- `Weak Control Identified`:
- `Was MFA enabled?`: Yes / No
- `Was account lockout configured?`: Yes / No

### Root Cause Summary

Explain why the attack was possible or why it generated so many attempts before containment.

Examples:

- exposed RDP service accessible from an untrusted network
- weak password policy
- no account lockout threshold
- no MFA on externally accessible authentication service

## 8. Remediation Steps

### Immediate Containment

- block the source IP address at the host firewall, perimeter firewall, or WAF
- disable, lock, or protect targeted accounts
- terminate suspicious sessions
- isolate affected hosts if compromise is confirmed

### Eradication

- reset passwords for targeted or compromised accounts
- enforce MFA for remote access and privileged users
- remove public exposure of unnecessary login services
- review and remove unauthorized accounts or persistence mechanisms

### Recovery

- re-enable services only after validation
- verify successful logins are legitimate
- monitor for repeat attempts from new IP addresses
- validate logging and alerting coverage after changes

### Long-Term Improvements

- implement stronger password policy
- enable account lockout thresholds
- restrict remote access by IP allowlist or VPN
- tune SIEM detections for brute-force and password-spraying behavior
- review privileged account usage and disable stale accounts

## 9. Lessons Learned

- `What worked well`:
- `What gaps were identified`:
- `What monitoring improvements are needed`:
- `What preventive controls should be added`:

## 10. Evidence References

- `SIEM alert screenshots`:
- `Wazuh alert IDs`:
- `Windows event log references`:
- `Firewall log references`:
- `Packet capture references`:
- `Case notes / ticket links`:

## 11. Approval and Closure

- `Incident Owner`:
- `Reviewed By`:
- `Date Reviewed`:
- `Date Closed`:
- `Final Severity`:
- `Closure Notes`:

## Example Short Analyst Summary

`On YYYY-MM-DD, the SOC identified repeated failed login attempts from source IP X.X.X.X targeting account USERNAME on HOSTNAME over RDP. The activity matched MITRE ATT&CK T1110 Brute Force. The IP was blocked, the targeted account was secured, and no confirmed post-authentication malicious activity was observed.`
