# Security Tools

## `log_ip_blocker.py`

`log_ip_blocker.py` is a defensive Python script that:

- reads security log files
- detects suspicious IP addresses based on repeated failed events
- blocks those IPs using local firewall commands

By default, it runs in `dry-run` mode and only prints the commands it would execute.

### Features

- clean command-line interface
- IPv4 validation with the standard library
- support for `ufw`, `iptables`, and `firewalld`
- safe default behavior with `--execute` required for real blocking

### Example Input

Sample log file:

```text
Apr 22 10:01:11 server sshd[1201]: Failed password for invalid user admin from 203.0.113.50 port 51234 ssh2
Apr 22 10:01:13 server sshd[1202]: Failed password for invalid user admin from 203.0.113.50 port 51235 ssh2
Apr 22 10:01:15 server sshd[1203]: Failed password for invalid user admin from 203.0.113.50 port 51236 ssh2
Apr 22 10:01:17 server sshd[1204]: Failed password for invalid user admin from 203.0.113.50 port 51237 ssh2
Apr 22 10:01:19 server sshd[1205]: Failed password for invalid user admin from 203.0.113.50 port 51238 ssh2
Apr 22 10:02:10 server sshd[1301]: Failed password for root from 198.51.100.23 port 52310 ssh2
```

### Example Command

```bash
python3 security_tools/log_ip_blocker.py sample_auth.log --threshold 5 --backend ufw
```

### Example Output

```text
Using firewall backend: ufw
Dry-run mode enabled. No firewall changes will be made.
Suspicious IP detected: 203.0.113.50 (5 failed events)
[DRY-RUN] ufw deny from 203.0.113.50
```

### Execute for Real

```bash
sudo python3 security_tools/log_ip_blocker.py /var/log/auth.log --threshold 5 --backend auto --execute
```

### Notes

- private and loopback IPs are skipped by default
- use `--allow-private` if you are testing in a lab network
- if you use `firewalld`, the script reloads the firewall after adding permanent rules
