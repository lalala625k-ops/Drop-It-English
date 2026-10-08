"""Audit tracked source and optionally the exact public Windows payload.

This reports locations only, never the contents of a potential secret.
Run after staging source: python scripts/check_public_payload.py
"""
import argparse
import json
import re
import subprocess
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATTERNS = {
    'private_key': r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',
    'github_token': r'(?<![A-Za-z0-9])(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})',
    'service_key': r'(?<![A-Za-z0-9])sk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{24,}',
    'aws_key': r'(?<![A-Za-z0-9])AKIA[0-9A-Z]{16}',
    'credential_url': r'https?://[^\s/:@]+:[^\s/@]+@',
}
TEMPLATE = 'desktop/Template/Template English.drop'


def audit_source():
    paths = [name for name in subprocess.check_output(['git', 'ls-files', '-z'], cwd=ROOT).decode().split('\0') if name]
    private, secrets = [], []
    for name in paths:
        path = ROOT / name
        forbidden = name.endswith(('.local.json', '.local.csv', '.db', '.sqlite3', '.sqlite', '.env', '.pem', '.key', '.pfx', '.log'))
        forbidden |= name.startswith(('Files/', 'backend/data/', 'release/', 'build/', 'node_modules/', 'frontend/node_modules/'))
        forbidden |= name.endswith('.drop') and name != TEMPLATE
        if forbidden or path.is_symlink() or path.is_junction():
            private.append(name)
            continue
        if path.suffix == '.drop':
            with zipfile.ZipFile(path) as archive:
                texts = [(name + '/' + entry, archive.read(entry).decode('utf-8')) for entry in archive.namelist() if entry.endswith('.json')]
        else:
            data = path.read_bytes()
            texts = [] if b'\0' in data[:2048] else [(name, data.decode('utf-8', errors='ignore'))]
        for location, text in texts:
            for rule, pattern in PATTERNS.items():
                for match in re.finditer(pattern, text):
                    # Deliberately invalid, fictional credentials used to test
                    # that Pinterest preview URLs with credentials are rejected.
                    if name == 'frontend/tests/pinterestTransfer.test.mjs' and rule == 'credential_url' and match.group() == 'https://' + 'user:pass@':
                        continue
                    secrets.append({'file': location, 'rule': rule, 'line': text.count('\n', 0, match.start()) + 1})
    templates = [name for name in paths if name.endswith('.drop')]
    if templates != [TEMPLATE]:
        private.extend(templates or ['missing designated template'])
    return {'tracked_files': len(paths), 'templates': templates, 'private_paths': private, 'potential_secrets': secrets}


def audit_portable(folder):
    from build_dropit_installer import validate_distribution
    validate_distribution(folder)
    with zipfile.ZipFile(folder.parent / 'Drop-It-English-0.1-Portable.zip') as archive:
        files = {name for name in archive.namelist() if not name.endswith('/')}
        from build_dropit_installer import PAYLOAD
        if files != PAYLOAD:
            raise ValueError('ZIP payload differs from the validated portable payload')
        for name in files:
            if archive.read(name) != (folder / name).read_bytes():
                raise ValueError('ZIP file differs from portable source: ' + name)
    from PyInstaller.archive.readers import CArchiveReader
    for filename in ('DropIt.exe', 'pinboard-service.exe'):
        contents = CArchiveReader(str(folder / filename))
        names = [name.replace('\\', '/') for name in contents.toc]
        if any(name.endswith(('.local.json', '.local.csv', '.sqlite3', '.db', '.drop')) for name in names):
            raise ValueError('Frozen program contains private data: ' + filename)
        catalog = next(name for name in contents.toc if name.replace('\\', '/') == 'locale/messages.en.json')
        if contents.extract(catalog) != (ROOT / 'backend/locale/messages.en.json').read_bytes():
            raise ValueError('Frozen translation catalog is stale: ' + filename)
        if filename == 'pinboard-service.exe':
            for source in (ROOT / 'frontend/dist').rglob('*'):
                if source.is_file():
                    relative = 'web/' + source.relative_to(ROOT / 'frontend/dist').as_posix()
                    entry = next(name for name in contents.toc if name.replace('\\', '/') == relative)
                    if contents.extract(entry) != source.read_bytes():
                        raise ValueError('Frozen frontend is stale: ' + relative)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--portable', type=Path)
    args = parser.parse_args()
    report = audit_source()
    if args.portable:
        audit_portable(args.portable.resolve())
        report['portable_payload'] = 'passed'
    print(json.dumps(report, indent=2))
    raise SystemExit(bool(report['private_paths'] or report['potential_secrets']))
