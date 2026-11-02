#!/usr/bin/env bash
# يثبّت الـhooks المحلية (pre-commit لمنع تسريب المفاتيح).
set -eu

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

git config core.hooksPath .githooks
chmod +x .githooks/pre-commit

echo "✓ تم تفعيل الـhooks من .githooks"
echo "  • pre-commit: يمنع تسريب المفاتيح والملفات الحساسة"
echo ""
echo "لفحص التاريخ بالكامل (اختياري):"
echo "  gitleaks detect --source . --config .gitleaks.toml"
