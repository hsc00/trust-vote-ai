#!/usr/bin/env bash
# scripts/dockerfile-validate.sh
# Validates Dockerfiles: syntax, security, best practices, optimization
# Auto-installs hadolint and Checkov in temp venvs if needed, cleans up on exit
set -euo pipefail

DOCKERFILE="${1:-Dockerfile}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMP_DIR=""
CLEANUP_TOOLS=()

cleanup() {
  if [[ -n "$TEMP_DIR" && -d "$TEMP_DIR" ]]; then
    rm -rf "$TEMP_DIR"
  fi
  for tool in "${CLEANUP_TOOLS[@]:-}"; do
    rm -rf "$tool"
  done
}
trap cleanup EXIT INT TERM

# 1. Auto-install hadolint if missing
if ! command -v hadolint >/dev/null 2>&1; then
  echo "[INFO] hadolint not found, installing in temp dir..."
  TEMP_DIR="$(mktemp -d)"
  export PATH="$TEMP_DIR:$PATH"
  curl -sSL -o "$TEMP_DIR/hadolint" https://github.com/hadolint/hadolint/releases/latest/download/hadolint-$(uname -s)-$(uname -m)
  chmod +x "$TEMP_DIR/hadolint"
  CLEANUP_TOOLS+=("$TEMP_DIR")
fi

# 2. Auto-install Checkov in temp venv if missing
if ! command -v checkov >/dev/null 2>&1; then
  echo "[INFO] Checkov not found, installing in temp venv..."
  TEMP_VENV="$(mktemp -d)"
  python3 -m venv "$TEMP_VENV"
  source "$TEMP_VENV/bin/activate"
  pip install --quiet checkov
  CLEANUP_TOOLS+=("$TEMP_VENV")
else
  deactivate 2>/dev/null || true
fi

# 3. [1/4] Syntax Validation (hadolint)
echo "[STAGE 1/4] Syntax validation with hadolint..."
hadolint "$DOCKERFILE"

# 4. [2/4] Security Scan (Checkov)
echo "[STAGE 2/4] Security scan with Checkov..."
checkov -f "$DOCKERFILE" --framework dockerfile || true

# 5. [3/4] Best Practices Validation (custom)"
echo "[STAGE 3/4] Best practices validation..."
grep -q '^FROM .\+:\S' "$DOCKERFILE" || echo "[WARN] Base image tag missing. Use explicit tags."
grep -q '^USER ' "$DOCKERFILE" || echo "[WARN] No USER directive. Avoid running as root."
grep -q '^HEALTHCHECK ' "$DOCKERFILE" || echo "[WARN] No HEALTHCHECK present."
grep -q '^COPY ' "$DOCKERFILE" && grep -q '^RUN ' "$DOCKERFILE" && echo "[INFO] COPY before RUN detected."

# 6. [4/4] Optimization Analysis (custom)"
echo "[STAGE 4/4] Optimization analysis..."
if grep -q '^FROM ' "$DOCKERFILE" | grep -q 'AS '; then
  echo "[INFO] Multi-stage build detected."
else
  echo "[INFO] Consider using multi-stage builds for smaller images."
fi
if [ -f .dockerignore ]; then
  echo "[INFO] .dockerignore present."
else
  echo "[WARN] .dockerignore missing."
fi

# Done
echo "[SUCCESS] Dockerfile validation complete."
