import re
from datetime import datetime

CURRENT_YEAR = datetime.now().year

# Degree patterns — NO re.IGNORECASE to avoid matching 'be', 'ba', 'ms' in random words.
# Abbreviations are anchored with \b and require a capital first letter OR a known full word.
# Sorted longest-match first so M.Tech beats M., B.Tech beats B.E., etc.
DEGREE_PATTERNS = [
    # Full words (case-insensitive is safe here — no ambiguity)
    r'Doctor(?:ate)?\s+of\s+[\w\s,&]{2,40}',
    r'Ph\.D\.?(?:\s+in\s+[\w\s,&]{2,40})?',
    r'PhD(?:\s+in\s+[\w\s,&]{2,40})?',
    r'Master(?:\'s)?\s+of\s+[\w\s,&]{2,40}',
    r'Bachelor(?:\'s)?\s+of\s+[\w\s,&]{2,40}',
    r'Associate(?:\'s)?\s+of\s+[\w\s,&]{2,40}',
    r'High School Diploma',
    # Abbreviations — require UPPERCASE first letter, word boundary on both sides
    r'\bM\.Tech\.?(?:\s+in\s+[\w\s,&]{2,40})?',
    r'\bB\.Tech\.?(?:\s+in\s+[\w\s,&]{2,40})?',
    r'\bM\.Sc\.?(?:\s+in\s+[\w\s,&]{2,40})?',
    r'\bB\.Sc\.?(?:\s+in\s+[\w\s,&]{2,40})?',
    r'\bM\.B\.A\.?(?:\s+in\s+[\w\s,&]{2,40})?',
    r'\bMBA(?:\s+in\s+[\w\s,&]{2,40})?',
    # Single-letter abbreviations — must be at start of line or after whitespace,
    # followed by a period to avoid matching random uppercase letters mid-sentence
    r'(?:^|(?<=\s))M\.S\.(?:\s+in\s+[\w\s,&]{2,40})?',
    r'(?:^|(?<=\s))B\.S\.(?:\s+in\s+[\w\s,&]{2,40})?',
    r'(?:^|(?<=\s))B\.E\.(?:\s+in\s+[\w\s,&]{2,40})?',
    r'(?:^|(?<=\s))B\.A\.(?:\s+in\s+[\w\s,&]{2,40})?',
    # Spelled-out with optional field
    r'Diploma(?:\s+in\s+[\w\s,&]{2,40})?',
    r'Certificate(?:\s+in\s+[\w\s,&]{2,40})?',
]
# Do NOT use re.IGNORECASE — preserves case-sensitivity for ambiguous abbreviations
DEGREE_RE = re.compile('|'.join(DEGREE_PATTERNS))
YEAR_RE = re.compile(r'\b(19[89]\d|20[0-3]\d)\b')


def parse_education_entries(education_text: str) -> list[dict]:
    """Parse raw education text into a list of {degree, institution, year} dicts."""
    if not education_text:
        return []

    entries = []
    lines = [l.strip() for l in education_text.split('\n') if l.strip()]

    i = 0
    while i < len(lines):
        line = lines[i]
        degree_match = DEGREE_RE.search(line)

        if degree_match:
            degree = degree_match.group(0).strip()
            # Try to find year in current or next 3 lines
            year = None
            institution = None

            context_lines = lines[i:i+4]
            for cl in context_lines:
                ym = YEAR_RE.search(cl)
                if ym:
                    year = ym.group(0)
                    break

            # Institution: line after the degree line if it doesn't look like a year/date
            if i + 1 < len(lines):
                next_line = lines[i + 1]
                if not DEGREE_RE.search(next_line) and not re.match(r'^\d{4}', next_line.strip()):
                    institution = next_line

            if year is None and institution and YEAR_RE.search(institution):
                year = YEAR_RE.search(institution).group(0)

            # Fallback: extract institution from same line after degree
            if not institution:
                after_degree = line[degree_match.end():].strip(" ,–-|")
                if after_degree and len(after_degree) > 3:
                    institution = after_degree

            entries.append({
                "degree": degree,
                "institution": institution or "Unknown Institution",
                "year": year,
            })

        i += 1

    # Deduplicate by degree
    seen = set()
    unique = []
    for e in entries:
        key = e["degree"].lower()
        if key not in seen:
            seen.add(key)
            unique.append(e)

    return unique

def compute_experience_years(experience_text: str) -> int | None:
    """Estimate years of experience from year mentions in the experience section."""
    if not experience_text:
        return None
    years = [int(y) for y in YEAR_RE.findall(experience_text) if int(y) <= CURRENT_YEAR]
    if not years:
        return None
    earliest = min(years)
    latest = max(years)
    # Use the later of earliest or (latest from experience), bounded by now
    span = min(CURRENT_YEAR, latest) - earliest
    return max(0, span)
