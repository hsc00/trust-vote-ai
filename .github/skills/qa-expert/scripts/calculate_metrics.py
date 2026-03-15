#!/usr/bin/env python3
"""
Calculate QA Metrics

Analyzes TEST-EXECUTION-TRACKING.csv and generates quality metrics.

Usage:
    python scripts/calculate_metrics.py <tracking-csv-path>
"""



import sys
import csv
from pathlib import Path
from collections import Counter
import re

# Constants
BUG_ID_FIELD = 'Bug ID'

def calculate_metrics(csv_path):
    """Calculate comprehensive QA metrics from tracking CSV."""

    with open(csv_path, 'r') as f:
        reader = csv.DictReader(f)
        tests = list(reader)


    total = len([t for t in tests if t.get('Test Case ID', '') not in ['', 'Test Case ID']])
    executed_tests = [t for t in tests if t.get('Status', '') == 'Completed']
    executed = len(executed_tests)
    passed = len([t for t in executed_tests if t.get('Result', '') == '✅ PASSED'])
    failed = len([t for t in executed_tests if t.get('Result', '') == '❌ FAILED'])

    pass_rate = (passed / executed * 100) if executed > 0 else 0
    execution_rate = (executed / total * 100) if total > 0 else 0

    # Bug analysis
    bug_ids = [t.get(BUG_ID_FIELD, '') for t in tests if t.get(BUG_ID_FIELD, '')]
    unique_bugs = len(set(bug_ids))

    # Priority analysis
    priority_counts = Counter([t.get('Priority', '') for t in tests if t.get('Priority', '')])

    print("\n" + "="*60)
    print("QA METRICS DASHBOARD")
    print("="*60 + "\n")

    print("📊 TEST EXECUTION")
    print(f"   Total Tests:     {total}")
    print(f"   Executed:        {executed} ({execution_rate:.1f}%)")
    print(f"   Not Started:     {total - executed}\n")

    print("✅ TEST RESULTS")
    print(f"   Passed:          {passed}")
    print(f"   Failed:          {failed}")
    print(f"   Pass Rate:       {pass_rate:.1f}%\n")

    print("🐛 BUG ANALYSIS")
    print("   Unique Bugs:     {}".format(unique_bugs))
    print("   Total Failures:  {}\n".format(failed))

    print("⭐ PRIORITY BREAKDOWN")
    for priority in ['P0', 'P1', 'P2', 'P3']:
        count = priority_counts.get(priority, 0)
        print(f"   {priority}:              {count}")

    print("\n🎯 QUALITY GATES")
    def has_p0_bug(test):
        bug_id = test.get(BUG_ID_FIELD, '')
        notes = test.get('Notes', '')
        if not isinstance(notes, str):
            notes = ''
        return (
            isinstance(bug_id, str) and bug_id.startswith('BUG') and
            re.search(r'\bP0\b', notes, re.IGNORECASE)
        )

    gates = {
        "Test Execution ≥100%": execution_rate >= 100,
        "Pass Rate ≥80%": pass_rate >= 80,
        "P0 Bugs = 0": not any(has_p0_bug(t) for t in tests),
        "No Open P1 Bugs": not any(
            (t.get(BUG_ID_FIELD, '').startswith('BUG') and re.search(r'\bP1\b', str(t.get('Notes', '')), re.IGNORECASE))
            for t in tests
        ),
        "No Blocked Tests": not any(
            (str(t.get('Status', '')).lower() == 'blocked') for t in tests
        ),
    }

    for gate, status in gates.items():
        symbol = "✅" if status else "❌"
        print(f"   {symbol} {gate}")

    print(f"\n{'='*60}\n")

    return {
        'total': total,
        'executed': executed,
        'passed': passed,
        'failed': failed,
        'pass_rate': pass_rate,
        'execution_rate': execution_rate,
        'unique_bugs': unique_bugs
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python calculate_metrics.py <tracking-csv-path>")
        sys.exit(1)

    csv_path = Path(sys.argv[1])
    if not csv_path.exists():
        print(f"❌ Error: File not found: {csv_path}")
        sys.exit(1)

    calculate_metrics(csv_path)
