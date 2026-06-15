import re

def extract_linkedin(text: str) -> str | None:
    """Extract a LinkedIn profile URL."""
    match = re.search(
        r'(?:https?://)?(?:www\.)?linkedin\.com/in/([A-Za-z0-9\-_%]+)/?',
        text, re.IGNORECASE
    )
    if match:
        return f"https://linkedin.com/in/{match.group(1)}"
    return None

def extract_github(text: str) -> str | None:
    """Extract a GitHub profile URL."""
    match = re.search(
        r'(?:https?://)?(?:www\.)?github\.com/([A-Za-z0-9\-_]+)(?:/[^\s]*)?',
        text, re.IGNORECASE
    )
    if match:
        username = match.group(1)
        # Avoid false positives like github.com/actions or github.com/topics
        blocklist = {"actions", "features", "topics", "marketplace", "explore", "about"}
        if username.lower() not in blocklist:
            return f"https://github.com/{username}"
    return None

def extract_location(text: str, doc) -> str | None:
    """Extract a location from explicit labels or City, Country/State patterns.
    Avoids spaCy NER on small models which misidentifies tech terms as GPE."""
    top_text = text[:800]

    # Priority 1: explicit label on its own line
    label_match = re.search(
        r'(?:location|address|city|based in)[:\s]+([A-Za-z ,\.\-]{3,50})',
        top_text, re.IGNORECASE
    )
    if label_match:
        candidate = label_match.group(1).strip().strip(',').strip()
        if len(candidate) >= 3:
            return candidate

    # Priority 2: "City, ST" or "City, Country" — requires Title Case city
    pattern = re.search(
        r'\b([A-Z][a-z]{2,}(?:\s[A-Z][a-z]{2,})*),\s*([A-Z][a-z]{2,}|[A-Z]{2})\b',
        top_text
    )
    if pattern:
        return pattern.group(0)

    return None
