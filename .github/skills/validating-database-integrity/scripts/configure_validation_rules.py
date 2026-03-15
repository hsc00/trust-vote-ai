#!/usr/bin/env python3
"""
Interactively configure data validation rules for a database table.

This script allows users to define and customize validation rules for database tables,
which are then saved in a configuration file for use by other validation scripts.
"""

import argparse
import json
import sys
from datetime import datetime, timezone
from typing import Any

DONE_CHOICES = {"done", "8"}
LIST_CHOICES = {"6", "list"}
REMOVE_CHOICES = {"7", "remove"}
HELP_CHOICES = {"help"}
COLUMN_PROMPT = "Enter column name: "
RULE_CHOICES = {
    "1": "not-null",
    "not-null": "not-null",
    "2": "unique",
    "unique": "unique",
    "3": "range",
    "range": "range",
    "4": "pattern",
    "pattern": "pattern",
    "5": "custom",
    "custom": "custom",
}


class ValidationRuleConfigurator:
    """Interactively configure validation rules."""

    def __init__(self) -> None:
        self.rules: list[dict[str, Any]] = []
        self.table_name = ""
        self.database = ""

    def add_not_null_rule(self, column: str) -> None:
        self.rules.append(
            {
                "rule": "not_null",
                "column": column,
                "description": f"Column {column} must not contain NULL values",
            }
        )

    def add_unique_rule(self, column: str) -> None:
        self.rules.append(
            {
                "rule": "unique",
                "column": column,
                "description": f"Column {column} must contain unique values",
            }
        )

    def add_range_rule(self, column: str, min_value: float, max_value: float) -> None:
        if min_value > max_value:
            raise ValueError(
                "min_value ({}) cannot be greater than max_value ({}) for column '{}'".format(
                    min_value, max_value, column
                )
            )
        self.rules.append(
            {
                "rule": "range",
                "column": column,
                "min": min_value,
                "max": max_value,
                "description": f"Column {column} values must be between {min_value} and {max_value}",
            }
        )

    def add_pattern_rule(self, column: str, pattern: str) -> None:
        self.rules.append(
            {
                "rule": "pattern",
                "column": column,
                "pattern": pattern,
                "description": f"Column {column} values must match pattern: {pattern}",
            }
        )

    def add_custom_rule(self, column: str, query: str) -> None:
        self.rules.append(
            {
                "rule": "custom",
                "column": column,
                "query": query,
                "description": f"Custom validation on {column}",
            }
        )

    def remove_rule(self, index: int) -> bool:
        if 0 <= index < len(self.rules):
            del self.rules[index]
            return True
        return False

    def get_config_dict(self) -> dict[str, Any]:
        return {
            "table": self.table_name,
            "database": self.database,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "validations": self.rules,
        }

    def load_config(self, filepath: str) -> bool:
        try:
            with open(filepath, "r", encoding="utf-8") as file:
                config = json.load(file)
            self.table_name = str(config.get("table", ""))
            self.database = str(config.get("database", ""))
            rules = config.get("validations", [])
            self.rules = rules if isinstance(rules, list) else []
            return True
        except (FileNotFoundError, json.JSONDecodeError) as error:
            print(f"Error loading config: {error}", file=sys.stderr)
            return False

    def save_config(self, filepath: str) -> bool:
        try:
            with open(filepath, "w", encoding="utf-8") as file:
                json.dump(self.get_config_dict(), file, indent=2)
            return True
        except OSError as error:
            print(f"Error saving config: {error}", file=sys.stderr)
            return False


def print_banner(title: str) -> None:
    print("\n" + "=" * 60)
    print(title)
    print("=" * 60 + "\n")


def prompt_non_empty(prompt: str, error_message: str) -> str:
    value = input(prompt).strip()
    if not value:
        print(error_message)
        sys.exit(1)
    return value


def print_menu() -> None:
    print("\nAvailable rules:")
    print("  1. not-null   - Column cannot contain NULL values")
    print("  2. unique     - Column values must be unique")
    print("  3. range      - Column values must be within min/max")
    print("  4. pattern    - Column values must match regex pattern")
    print("  5. custom     - Custom SQL validation query")
    print("  6. list       - Show current rules")
    print("  7. remove     - Remove a rule")
    print("  8. done       - Finish configuration")


def list_rules(configurator: ValidationRuleConfigurator) -> None:
    if not configurator.rules:
        print("No rules configured yet.")
        return

    print("\nConfigured Rules:")
    print("-" * 60)
    for index, rule in enumerate(configurator.rules, start=1):
        rule_type = str(rule.get("rule", "unknown")).upper()
        column = str(rule.get("column", "N/A"))
        description = str(rule.get("description", ""))
        print(f"{index}. [{rule_type}] {column}")
        print(f"   {description}")
        _print_rule_details(rule)
    print("-" * 60)


def _print_rule_details(rule: dict[str, Any]) -> None:
    rule_type = rule.get("rule")
    if rule_type == "range":
        print(f"   Range: [{rule.get('min')}, {rule.get('max')}]")
    elif rule_type == "pattern":
        print(f"   Pattern: {rule.get('pattern')}")
    elif rule_type == "custom":
        print(f"   Query: {rule.get('query')}")


def print_help() -> None:
    help_text = r"""
Rule Types:

NOT NULL
  Description: Ensures column contains no NULL values
  Example: Validate that 'user_id' is never NULL

UNIQUE
  Description: Ensures all values in column are unique
  Example: Email addresses must be unique for user table

RANGE
  Description: Ensures numeric values fall within min/max bounds
  Example: Age must be between 0 and 150
           Price must be between 0 and 999999

PATTERN
  Description: Ensures values match a regular expression
  Example: Email format: ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$
           Phone: ^\+?1?\d{9,15}$

CUSTOM
  Description: Run custom SQL query for complex validations
  Example: SELECT COUNT(*) FROM users WHERE created_at > updated_at
           (Ensures created_at is always before updated_at)
"""
    print(help_text)


def interactive_mode(configurator: ValidationRuleConfigurator) -> None:
    print_banner("Data Validation Rule Configurator")
    configurator.table_name = prompt_non_empty("Enter table name: ", "Error: Table name is required")
    configurator.database = input("Enter database name (optional): ").strip()
    print("\nConfigure validation rules for this table.")
    print("Enter 'help' for rule descriptions, 'done' when finished.\n")

    while True:
        print_menu()
        choice = input("\nEnter rule type (1-8): ").strip().lower()
        if _handle_interactive_choice(configurator, choice):
            break

    _print_summary(configurator)
    _prompt_save_configuration(configurator)


def _handle_interactive_choice(configurator: ValidationRuleConfigurator, choice: str) -> bool:
    if choice in DONE_CHOICES:
        return True
    if choice in HELP_CHOICES:
        print_help()
        return False
    if choice in LIST_CHOICES:
        list_rules(configurator)
        return False
    if choice in REMOVE_CHOICES:
        _handle_remove_rule(configurator)
        return False
    if choice in RULE_CHOICES:
        _handle_add_rule(configurator, RULE_CHOICES[choice])
        return False

    print("Invalid choice. Please try again.")
    return False


def _handle_add_rule(configurator: ValidationRuleConfigurator, rule_key: str) -> None:
    if rule_key == "not-null":
        _add_not_null_rule(configurator)
    elif rule_key == "unique":
        _add_unique_rule(configurator)
    elif rule_key == "range":
        _add_range_rule(configurator)
    elif rule_key == "pattern":
        _add_pattern_rule(configurator)
    elif rule_key == "custom":
        _add_custom_rule(configurator)


def _add_not_null_rule(configurator: ValidationRuleConfigurator) -> None:
    column = input(COLUMN_PROMPT).strip()
    if column:
        configurator.add_not_null_rule(column)
        print(f"Added NOT NULL rule for {column}")


def _add_unique_rule(configurator: ValidationRuleConfigurator) -> None:
    column = input(COLUMN_PROMPT).strip()
    if column:
        configurator.add_unique_rule(column)
        print(f"Added UNIQUE rule for {column}")


def _add_range_rule(configurator: ValidationRuleConfigurator) -> None:
    column = input(COLUMN_PROMPT).strip()
    try:
        min_val = float(input("Enter minimum value: "))
        max_val = float(input("Enter maximum value: "))
        configurator.add_range_rule(column, min_val, max_val)
        print(f"Added RANGE rule for {column} [{min_val}, {max_val}]")
    except ValueError:
        print("Error: Invalid numeric values")


def _add_pattern_rule(configurator: ValidationRuleConfigurator) -> None:
    column = input(COLUMN_PROMPT).strip()
    pattern = input("Enter regex pattern: ").strip()
    if column and pattern:
        configurator.add_pattern_rule(column, pattern)
        print(f"Added PATTERN rule for {column}")


def _add_custom_rule(configurator: ValidationRuleConfigurator) -> None:
    column = input(COLUMN_PROMPT).strip()
    query = input("Enter SQL query: ").strip()
    if column and query:
        configurator.add_custom_rule(column, query)
        print(f"Added CUSTOM rule for {column}")


def _handle_remove_rule(configurator: ValidationRuleConfigurator) -> None:
    list_rules(configurator)
    try:
        index = int(input("Enter rule number to remove: ")) - 1
    except ValueError:
        print("Error: Invalid input")
        return

    if configurator.remove_rule(index):
        print(f"Removed rule {index + 1}")
    else:
        print("Error: Invalid rule number")


def _print_summary(configurator: ValidationRuleConfigurator) -> None:
    print_banner("Configuration Summary")
    print(f"Table: {configurator.table_name}")
    print(f"Database: {configurator.database or '(none specified)'}")
    print(f"Total Rules: {len(configurator.rules)}\n")
    list_rules(configurator)


def _prompt_save_configuration(configurator: ValidationRuleConfigurator) -> None:
    save_choice = input("\nSave configuration? (y/n): ").strip().lower()
    if save_choice not in {"y", "yes"}:
        return

    filepath = input("Enter filename to save (default: validation_rules.json): ").strip()
    output_path = filepath or "validation_rules.json"
    if configurator.save_config(output_path):
        print(f"Configuration saved to {output_path}")
        return

    print("Error: Failed to save configuration")
    sys.exit(1)


def create_from_args(args: argparse.Namespace) -> ValidationRuleConfigurator:
    configurator = ValidationRuleConfigurator()
    configurator.table_name = args.table or ""
    configurator.database = args.database or ""

    _add_csv_rules(args.not_null, configurator.add_not_null_rule)
    _add_csv_rules(args.unique, configurator.add_unique_rule)
    _add_range_rules(args.range, configurator)

    return configurator


def _add_csv_rules(csv_value: str | None, add_func: Any) -> None:
    if not csv_value:
        return
    for column in csv_value.split(","):
        normalized = column.strip()
        if normalized:
            add_func(normalized)


def _add_range_rules(range_arg: str | None, configurator: ValidationRuleConfigurator) -> None:
    if not range_arg:
        return

    for range_spec in range_arg.split(","):
        parsed = _parse_range_spec(range_spec)
        if parsed is None:
            print(f"Warning: Invalid range specification: {range_spec}")
            continue
        column, min_val, max_val = parsed
        configurator.add_range_rule(column, min_val, max_val)


def _parse_range_spec(range_spec: str) -> tuple[str, float, float] | None:
    parts = [part.strip() for part in range_spec.split(":")]
    if len(parts) != 3:
        return None

    column = parts[0]
    try:
        min_val = float(parts[1])
        max_val = float(parts[2])
    except ValueError:
        return None

    return (column, min_val, max_val)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Configure data validation rules for database tables",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Interactive mode (recommended)
  %(prog)s

  # Command-line mode with single table
  %(prog)s --table users --database mydb \\
    --not-null id,email \\
    --unique email \\
    --output rules.json

  # With range validation
  %(prog)s --table products --database catalog \\
    --range "price:0:10000,quantity:0:1000000" \\
    --output rules.json

  # Load and modify existing rules
  %(prog)s --load rules.json --not-null phone --output rules.json
        """,
    )
    parser.add_argument("--table", help="Table name for non-interactive mode")
    parser.add_argument("--database", help="Database name")
    parser.add_argument("--not-null", help="Comma-separated columns that must not be NULL")
    parser.add_argument("--unique", help="Comma-separated columns that must be unique")
    parser.add_argument("--range", help="Range validations in format: col:min:max,col2:min2:max2")
    parser.add_argument("--load", help="Load existing configuration file")
    parser.add_argument("--output", help="Output file for configuration (JSON)")
    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()

    try:
        configurator = _resolve_mode(args)
        if configurator is None:
            return
        _save_in_cli_mode(configurator, args)
    except Exception as error:
        print(f"Error: {error}", file=sys.stderr)
        sys.exit(1)


def _resolve_mode(args: argparse.Namespace) -> ValidationRuleConfigurator | None:
    if args.load:
        return _load_and_merge(args)
    if args.table:
        return create_from_args(args)

    interactive_mode(ValidationRuleConfigurator())
    return None


def _load_and_merge(args: argparse.Namespace) -> ValidationRuleConfigurator:
    configurator = ValidationRuleConfigurator()
    if not configurator.load_config(args.load):
        sys.exit(1)

    print(f"Loaded configuration from {args.load}")
    cli_config = create_from_args(args)
    configurator.rules.extend(cli_config.rules)
    list_rules(configurator)
    return configurator


def _save_in_cli_mode(configurator: ValidationRuleConfigurator, args: argparse.Namespace) -> None:
    if args.table and not configurator.table_name:
        configurator.table_name = args.table

    output_file = args.output or "validation_rules.json"
    if configurator.save_config(output_file):
        print(f"\nConfiguration saved to {output_file}")
        print(f"Total rules: {len(configurator.rules)}")
        return

    sys.exit(1)


if __name__ == "__main__":
    main()
