import re

def decode_unicode_escapes(text):
    """Decodes Unicode escapes in a string."""
    return re.sub(r'\\u([0-9a-fA-F]{4})', lambda m: chr(int(m.group(1), 16)), text)

def decode_recursively(obj):
    """Recursively decodes unicode escapes in dicts and lists"""
    if isinstance(obj, str):
        return decode_unicode_escapes(obj)
    elif isinstance(obj, dict):
        return {k: decode_recursively(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [decode_recursively(item) for item in obj]
    else:
        return obj