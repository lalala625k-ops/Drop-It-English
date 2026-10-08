"""Translate application messages without changing user content or parsing rules."""
import json
import re
import sys
from contextvars import ContextVar
from pathlib import Path

_language = ContextVar('ui_language', default='en')
_catalog = Path(__file__).resolve().parents[1] / 'locale' / 'messages.en.json'
if getattr(sys, 'frozen', False):
    _catalog = Path(sys._MEIPASS) / 'locale' / 'messages.en.json'
_messages = json.loads(_catalog.read_text(encoding='utf-8'))
_patterns = []
for key, value in _messages.items():
    slots = re.findall(r'\{(\d+)\}', key)
    if slots:
        parts = re.split(r'\{\d+\}', key)
        pattern = '^' + r'([\s\S]*?)'.join(re.escape(part) for part in parts) + '$'
        _patterns.append((re.compile(pattern), slots, value))


def set_request_language(header):
    return _language.set('zh' if str(header).lower().startswith('zh') else 'en')


def reset_request_language(token):
    _language.reset(token)


def translate(message):
    if not isinstance(message, str) or _language.get() == 'zh':
        return message
    if message in _messages:
        return _messages[message]
    for pattern, slots, value in _patterns:
        matched = pattern.match(message)
        if matched:
            return re.sub(r'\{(\d+)\}', lambda match: translate(matched.group(slots.index(match[1]) + 1)), value)
    return message


def translate_payload(value):
    if isinstance(value, list):
        return [translate_payload(item) for item in value]
    if isinstance(value, dict):
        # Titles, captions, URLs and card contents belong to the user or source.
        return {key: translate(item) if key in ('detail', 'message', 'reason', 'migration_error')
                else translate_payload(item) if isinstance(item, (dict, list)) else item
                for key, item in value.items()}
    return value
