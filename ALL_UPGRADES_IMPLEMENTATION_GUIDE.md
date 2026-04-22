# All Upgrades Implementation Guide

## What This Adds

This guide summarizes the full advanced upgrade path for the SOC lab:

- File Integrity Monitoring
- Vulnerability Detection
- Syscollector inventory
- VirusTotal integration
- CDB lists and threat-intel enrichment
- advanced correlation rules
- Suricata integration
- Osquery integration
- case management workflow
- improved dashboard design

## Recommended Order

1. load the upgraded rules
2. enable FIM on Windows and Linux
3. enable Syscollector and Vulnerability Detection
4. enable VirusTotal integration
5. add CDB allowlists and denylists
6. add Suricata
7. add Osquery
8. expand the dashboard
9. test one feature at a time

## Files in This Upgrade Set

- [WAZUH_FIM_CONFIG_SAMPLE.xml](/Users/subramanyasr/Documents/New%20project/WAZUH_FIM_CONFIG_SAMPLE.xml)
- [WAZUH_VULNERABILITY_DETECTION_CONFIG.xml](/Users/subramanyasr/Documents/New%20project/WAZUH_VULNERABILITY_DETECTION_CONFIG.xml)
- [WAZUH_SYSCOLLECTOR_AGENT_CONFIG.xml](/Users/subramanyasr/Documents/New%20project/WAZUH_SYSCOLLECTOR_AGENT_CONFIG.xml)
- [WAZUH_VIRUSTOTAL_INTEGRATION_SAMPLE.xml](/Users/subramanyasr/Documents/New%20project/WAZUH_VIRUSTOTAL_INTEGRATION_SAMPLE.xml)
- [WAZUH_CDB_LISTS_AND_ENRICHMENT.md](/Users/subramanyasr/Documents/New%20project/WAZUH_CDB_LISTS_AND_ENRICHMENT.md)
- [WAZUH_ADVANCED_CORRELATION_RULES.xml](/Users/subramanyasr/Documents/New%20project/WAZUH_ADVANCED_CORRELATION_RULES.xml)
- [SURICATA_INTEGRATION_GUIDE.md](/Users/subramanyasr/Documents/New%20project/SURICATA_INTEGRATION_GUIDE.md)
- [OSQUERY_INTEGRATION_GUIDE.md](/Users/subramanyasr/Documents/New%20project/OSQUERY_INTEGRATION_GUIDE.md)
- [CASE_MANAGEMENT_AND_PLAYBOOKS.md](/Users/subramanyasr/Documents/New%20project/CASE_MANAGEMENT_AND_PLAYBOOKS.md)
- [SOC_DASHBOARD_V2_GUIDE.md](/Users/subramanyasr/Documents/New%20project/SOC_DASHBOARD_V2_GUIDE.md)

## Notes

- test correlation rules carefully before relying on them for automation
- keep Active Response limited to high-confidence detections
- use allowlists to avoid blocking your own admin or scanner infrastructure
- add one telemetry source at a time to keep troubleshooting manageable

## References

- [File Integrity Monitoring](https://documentation.wazuh.com/current/user-manual/capabilities/file-integrity/index.html)
- [Basic FIM settings](https://documentation.wazuh.com/current/user-manual/capabilities/file-integrity/basic-settings.html)
- [Vulnerability Detection](https://documentation.wazuh.com/current/user-manual/capabilities/vulnerability-detection/index.html)
- [Vulnerability configuration](https://documentation.wazuh.com/current/user-manual/capabilities/vulnerability-detection/configuring-scans.html)
- [VirusTotal integration](https://documentation.wazuh.com/current/user-manual/capabilities/malware-detection/virus-total-integration.html)
- [Using CDB lists](https://documentation.wazuh.com/current/user-manual/ruleset/cdb-list.html)
- [Suricata integration](https://documentation.wazuh.com/current/proof-of-concept-guide/integrate-network-ids-suricata.html)
- [Osquery module](https://documentation.wazuh.com/current/user-manual/capabilities/system-inventory/osquery.html)
