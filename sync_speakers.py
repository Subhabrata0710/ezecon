#!/usr/bin/env python3
"""
sync_speakers.py

Pulls faculty rows from the EZECON Google Sheet, downloads each person's
"Recent Professional Photograph" from Google Drive, saves it under
images/<initials>.<ext>, and appends a new hi-card block for each NEW
faculty member into speakers.html (existing content is left untouched).

Run it as many times as you like — already-added names are skipped.

--------------------------------------------------------------------
SETUP (one-time)
--------------------------------------------------------------------
1. pip install playwright

2. Put this script in the SAME folder as your "images" folder and
   your "speakers.html" file (or edit the paths below).

3. Run:  python sync_speakers.py

   The FIRST time you run it, a real Chrome window will open to a
   blank/logged-out state. Log into the Google account that has
   access to the sheet in THAT window, then come back to your
   terminal and press Enter when prompted. That login is then saved
   in a "chrome_profile" folder next to this script, so every run
   after that is fully automatic — no login prompt, no manual Chrome
   commands.

   (This uses its own separate Chrome profile rather than your daily
   one, because Chrome no longer allows automation tools to attach to
   your real/default profile for security reasons.)
--------------------------------------------------------------------
"""

import csv
import io
import re
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

# ---------------------------------------------------------------------------
# CONFIG — edit if your paths/sheet differ
# ---------------------------------------------------------------------------
SHEET_ID = "1MJVM_UgLXMxw9qAwb-ci5bF2RpSKn-Ym6P6FNEBev0U"
GID = "118100867"

SCRIPT_DIR = Path(__file__).resolve().parent
SPEAKERS_HTML = SCRIPT_DIR / "speakers.html"
IMAGES_DIR = SCRIPT_DIR / "images"
PROFILE_DIR = SCRIPT_DIR / "chrome_profile"

# Column header text to match (case-insensitive substring match), so small
# header wording changes in the sheet don't break the script.
COL_NAME = "full name"
COL_PHOTO = "recent professional photograph"

CONTENT_TYPE_EXT = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}

CARD_TEMPLATE = """        <div class="hi-card gold-top">
          <div class="hi-avatar-placeholder">
            <img src="images/{img}" alt="{name}">
          </div>
          <span class="hi-name">{name}</span>
        </div>
"""


def normalize(name: str) -> str:
    return re.sub(r"\s+", " ", name.strip().lower())


def compute_initials(name: str, used: set) -> str:
    """Dr. Bal Charan -> bc, collides -> bc2, bc3, ..."""
    cleaned = re.sub(r"^(dr\.?|prof\.?|mr\.?|mrs\.?|ms\.?)\s+", "", name.strip(), flags=re.I)
    words = re.findall(r"[A-Za-z]+", cleaned)
    base = "".join(w[0] for w in words).lower() or "sp"
    candidate = base
    n = 2
    while candidate in used:
        candidate = f"{base}{n}"
        n += 1
    used.add(candidate)
    return candidate


def extract_drive_file_id(url: str):
    if not url:
        return None
    patterns = [
        r"/d/([a-zA-Z0-9_-]{10,})",
        r"[?&]id=([a-zA-Z0-9_-]{10,})",
    ]
    for p in patterns:
        m = re.search(p, url)
        if m:
            return m.group(1)
    # Sometimes the cell is a bare file ID
    if re.fullmatch(r"[a-zA-Z0-9_-]{10,}", url.strip()):
        return url.strip()
    return None


class NotLoggedIn(Exception):
    pass


def get_sheet_rows(context):
    export_url = (
        f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/export"
        f"?format=csv&gid={GID}"
    )
    resp = context.request.get(export_url)
    text = resp.text()
    if resp.status != 200 or text.lstrip().startswith("<"):
        raise NotLoggedIn()
    reader = csv.DictReader(io.StringIO(text))
    return list(reader), reader.fieldnames


def find_col(fieldnames, needle):
    for f in fieldnames:
        if needle in f.strip().lower():
            return f
    return None


def download_drive_file(context, file_id: str, dest_no_ext: Path) -> Path | None:
    url = f"https://drive.google.com/uc?export=download&id={file_id}"
    resp = context.request.get(url)
    body = resp.body()
    ctype = resp.headers.get("content-type", "")

    if "text/html" in ctype:
        # Large-file virus-scan interstitial page — extract confirm token/uuid
        html = body.decode("utf-8", errors="ignore")
        confirm = re.search(r'confirm=([0-9A-Za-z_\-]+)', html)
        uuid_m = re.search(r'uuid=([0-9A-Za-z\-]+)', html)
        if confirm:
            retry_url = (
                f"https://drive.usercontent.google.com/download"
                f"?id={file_id}&export=download&confirm={confirm.group(1)}"
            )
            if uuid_m:
                retry_url += f"&uuid={uuid_m.group(1)}"
            resp = context.request.get(retry_url)
            body = resp.body()
            ctype = resp.headers.get("content-type", "")

    if not ctype.startswith("image/"):
        print(f"    ! Could not download image (got content-type: {ctype}). Skipping image.")
        return None

    ext = CONTENT_TYPE_EXT.get(ctype.split(";")[0].strip(), ".jpg")
    dest = dest_no_ext.with_suffix(ext)
    dest.write_bytes(body)
    return dest


def parse_existing(html: str):
    """Return (set of normalized existing names, set of initials already used)."""
    names = set()
    initials = set()
    for m in re.finditer(r'<span class="hi-name">(.*?)</span>', html):
        names.add(normalize(m.group(1)))
    for m in re.finditer(r'<img src="images/([a-zA-Z0-9_\-]+)\.\w+"', html):
        initials.add(m.group(1))
    return names, initials


def main():
    if not SPEAKERS_HTML.exists():
        sys.exit(f"speakers.html not found at {SPEAKERS_HTML}")
    IMAGES_DIR.mkdir(exist_ok=True)

    html = SPEAKERS_HTML.read_text(encoding="utf-8")
    existing_names, used_initials = parse_existing(html)

    with sync_playwright() as p:
        PROFILE_DIR.mkdir(exist_ok=True)
        try:
            context = p.chromium.launch_persistent_context(
                user_data_dir=str(PROFILE_DIR),
                channel="chrome",  # use real installed Chrome, not bundled Chromium
                headless=False,
            )
        except Exception as e:
            sys.exit(
                "Could not launch Chrome. Make sure Google Chrome is "
                f"installed on this machine.\n(underlying error: {e})"
            )

        page = context.pages[0] if context.pages else context.new_page()

        try:
            rows, fieldnames = get_sheet_rows(context)
        except NotLoggedIn:
            print("Not logged in yet — opening the sheet for you to sign in...")
            page.goto(
                f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit#gid={GID}"
            )
            input(
                "Log into the Google account that has access to the sheet in "
                "the Chrome window that just opened, then press Enter here to continue..."
            )
            try:
                rows, fieldnames = get_sheet_rows(context)
            except NotLoggedIn:
                context.close()
                sys.exit(
                    "Still couldn't read the sheet as that account. Make sure "
                    "the signed-in account actually has access to this sheet, "
                    "then run the script again."
                )
        name_col = find_col(fieldnames, COL_NAME)
        photo_col = find_col(fieldnames, COL_PHOTO)
        if not name_col or not photo_col:
            sys.exit(
                f"Could not find required columns. Found headers: {fieldnames}\n"
                f"(looking for something containing '{COL_NAME}' and '{COL_PHOTO}')"
            )

        new_cards = []
        for row in rows:
            raw_name = (row.get(name_col) or "").strip()
            if not raw_name:
                continue
            display_name = raw_name if raw_name.lower().startswith("dr") else f"Dr. {raw_name}"
            norm = normalize(display_name)

            if norm in existing_names:
                continue  # already in speakers.html — skip, no duplicates

            photo_url = (row.get(photo_col) or "").strip()
            file_id = extract_drive_file_id(photo_url)
            if not file_id:
                print(f"  ! No valid photo link for '{display_name}', skipping entirely.")
                continue

            initials = compute_initials(display_name, used_initials)
            print(f"  -> {display_name}  (images/{initials}.*)")
            saved = download_drive_file(context, file_id, IMAGES_DIR / initials)
            if not saved:
                used_initials.discard(initials)
                continue

            new_cards.append(CARD_TEMPLATE.format(img=saved.name, name=display_name))
            existing_names.add(norm)

        context.close()

    if not new_cards:
        print("No new faculty to add. speakers.html left unchanged.")
        return

    updated_html = html.replace(
        '<div class="hi-grid">',
        '<div class="hi-grid">\n' + "".join(new_cards),
        1,
    )
    SPEAKERS_HTML.write_text(updated_html, encoding="utf-8")
    print(f"\nAdded {len(new_cards)} new faculty card(s) to speakers.html.")


if __name__ == "__main__":
    main()