# Case Management and Playbooks

## Purpose

This guide adds a simple SOC workflow so detections do not stop at alerting.

## Suggested Workflow

1. `Detect`
   - SIEM alert appears
2. `Triage`
   - validate severity
   - confirm affected host, user, source IP, and time
3. `Investigate`
   - pivot into related logs
   - review MITRE mapping and scope
4. `Contain`
   - block IP, disable account, isolate host if needed
5. `Recover`
   - reset credentials, patch, restore service
6. `Document`
   - incident summary, IOC list, timeline, remediation

## Minimal Case Fields

- incident ID
- alert source
- severity
- status
- owner
- affected assets
- users involved
- source IPs
- timeline
- remediation actions
- lessons learned

## Suggested Playbooks

- Windows brute force
- Linux SSH brute force
- suspicious PowerShell
- malware file drop
- port scan / reconnaissance

## Escalation Guidance

- `Low`: monitor and document
- `Medium`: analyst review
- `High`: triage immediately and prepare containment
- `Critical`: immediate containment and incident lead involvement
