#!/usr/bin/env python3
"""
Defensive log monitor that detects suspicious IP addresses from security logs
and blocks them with a local firewall command.

Safe default:
- The script only prints the firewall commands unless --execute is provided.

Supported firewall backends:
- ufw
- iptables
- firewalld
"""

from __future__ import annotations

import argparse
import ipaddress
import re
import shlex
import shutil
import subprocess
import sys
from collections import Counter
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


# Common failed-auth indicators found in Linux auth logs and similar security logs.
FAILED_PATTERNS = (
    "Failed password",
    "authentication failure",
    "Invalid user",
    "PAM authentication error",
    "Failed publickey",
)

# Matches IPv4 addresses in plain text log lines.
IPV4_REGEX = re.compile(r"\b(?:\d{1,3}\.){3}\d{1,3}\b")


@dataclass(frozen=True)
class Detection:
    """Stores the suspicious IP and the number of failed events observed."""

    ip: str
    failures: int


def parse_args() -> argparse.Namespace:
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description="Read security logs, detect suspicious IPs, and block them via firewall commands."
    )
    parser.add_argument(
        "logfile",
        type=Path,
        help="Path to the security log file to inspect.",
    )
    parser.add_argument(
        "--threshold",
        type=int,
        default=5,
        help="Minimum number of failed events before an IP is considered suspicious. Default: 5",
    )
    parser.add_argument(
        "--backend",
        choices=("auto", "ufw", "iptables", "firewalld"),
        default="auto",
        help="Firewall backend to use. Default: auto",
    )
    parser.add_argument(
        "--execute",
        action="store_true",
        help="Actually run the firewall commands. Without this flag, the script runs in dry-run mode.",
    )
    parser.add_argument(
        "--allow-private",
        action="store_true",
        help="Allow blocking private IP ranges. By default, RFC1918, loopback, multicast, and reserved IPs are skipped.",
    )
    return parser.parse_args()


def is_failed_security_event(line: str) -> bool:
    """Return True when the line looks like a failed authentication or security event."""
    return any(pattern in line for pattern in FAILED_PATTERNS)


def extract_valid_ips(line: str) -> list[str]:
    """Extract valid IPv4 addresses from a log line."""
    found_ips: list[str] = []
    for candidate in IPV4_REGEX.findall(line):
        try:
            ipaddress.IPv4Address(candidate)
        except ipaddress.AddressValueError:
            continue
        found_ips.append(candidate)
    return found_ips


def should_skip_ip(ip: str, allow_private: bool) -> bool:
    """Skip non-routable IPs unless the caller explicitly allows them."""
    address = ipaddress.ip_address(ip)
    if allow_private:
        return False
    return (
        address.is_private
        or address.is_loopback
        or address.is_reserved
        or address.is_multicast
        or address.is_link_local
    )


def detect_suspicious_ips(
    log_lines: Iterable[str],
    threshold: int,
    allow_private: bool,
) -> list[Detection]:
    """
    Count failed security events by source IP and return IPs that meet the threshold.
    """
    ip_failures: Counter[str] = Counter()

    for line in log_lines:
        if not is_failed_security_event(line):
            continue

        for ip in extract_valid_ips(line):
            if should_skip_ip(ip, allow_private=allow_private):
                continue
            ip_failures[ip] += 1

    detections = [
        Detection(ip=ip, failures=failures)
        for ip, failures in ip_failures.items()
        if failures >= threshold
    ]
    return sorted(detections, key=lambda item: (-item.failures, item.ip))


def detect_backend(requested_backend: str) -> str:
    """Pick a firewall backend or raise an error if none are available."""
    if requested_backend != "auto":
        return requested_backend

    if shutil.which("ufw"):
        return "ufw"
    if shutil.which("iptables"):
        return "iptables"
    if shutil.which("firewall-cmd"):
        return "firewalld"

    raise RuntimeError("No supported firewall backend detected. Install ufw, iptables, or firewalld.")


def build_block_command(ip: str, backend: str) -> list[str]:
    """Build the firewall command for the selected backend."""
    if backend == "ufw":
        return ["ufw", "deny", "from", ip]
    if backend == "iptables":
        return ["iptables", "-A", "INPUT", "-s", ip, "-j", "DROP"]
    if backend == "firewalld":
        return ["firewall-cmd", "--permanent", "--add-rich-rule", f'rule family="ipv4" source address="{ip}" drop']
    raise ValueError(f"Unsupported backend: {backend}")


def run_command(command: list[str], execute: bool) -> None:
    """Print or execute a firewall command."""
    printable = shlex.join(command)
    if not execute:
        print(f"[DRY-RUN] {printable}")
        return

    subprocess.run(command, check=True)
    print(f"[BLOCKED] {printable}")


def apply_blocks(detections: list[Detection], backend: str, execute: bool) -> None:
    """Apply or print the firewall actions for each suspicious IP."""
    for detection in detections:
        print(f"Suspicious IP detected: {detection.ip} ({detection.failures} failed events)")
        run_command(build_block_command(detection.ip, backend), execute=execute)

    if execute and backend == "firewalld":
        # firewalld needs a reload after permanent rules are added.
        reload_command = ["firewall-cmd", "--reload"]
        run_command(reload_command, execute=True)


def main() -> int:
    """Script entrypoint."""
    args = parse_args()

    if not args.logfile.exists():
        print(f"Error: log file not found: {args.logfile}", file=sys.stderr)
        return 1

    try:
        backend = detect_backend(args.backend)
    except RuntimeError as error:
        print(f"Error: {error}", file=sys.stderr)
        return 1

    with args.logfile.open("r", encoding="utf-8", errors="ignore") as handle:
        detections = detect_suspicious_ips(
            log_lines=handle,
            threshold=args.threshold,
            allow_private=args.allow_private,
        )

    if not detections:
        print("No suspicious IP addresses met the threshold.")
        return 0

    print(f"Using firewall backend: {backend}")
    if not args.execute:
        print("Dry-run mode enabled. No firewall changes will be made.")

    try:
        apply_blocks(detections, backend=backend, execute=args.execute)
    except subprocess.CalledProcessError as error:
        print(f"Firewall command failed: {error}", file=sys.stderr)
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
