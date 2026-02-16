"""Full web application audit - screenshots, console errors, broken resources, navigation, responsive."""
import json
import time
import os
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"
OUT = "/tmp/audit"
os.makedirs(OUT, exist_ok=True)

PAGES = [
    ("/", "home"),
    ("/about", "about"),
    ("/services", "services"),
    ("/portfolio", "portfolio"),
    ("/resume", "resume"),
    ("/blog", "blog"),
    ("/contact", "contact"),
]

VIEWPORTS = [
    {"name": "mobile", "width": 375, "height": 812},
    {"name": "tablet", "width": 768, "height": 1024},
    {"name": "desktop", "width": 1440, "height": 900},
]

results = {
    "pages": {},
    "console_errors": [],
    "failed_resources": [],
    "navigation_issues": [],
    "accessibility_issues": [],
}


def audit_page(page, path, name, viewport_name, viewport):
    """Audit a single page at a single viewport."""
    key = f"{name}_{viewport_name}"
    entry = {
        "url": f"{BASE}{path}",
        "viewport": viewport_name,
        "status": None,
        "load_time_ms": None,
        "console_errors": [],
        "failed_resources": [],
        "title": None,
        "meta_description": None,
        "h1_count": 0,
        "img_without_alt": 0,
        "total_images": 0,
        "links_count": 0,
        "broken_anchors": [],
    }

    errors = []
    failed = []

    page.on("console", lambda msg: errors.append({"type": msg.type, "text": msg.text, "page": path}) if msg.type == "error" else None)
    page.on("requestfailed", lambda req: failed.append({"url": req.url, "failure": req.failure, "page": path}))

    page.set_viewport_size({"width": viewport["width"], "height": viewport["height"]})

    start = time.time()
    try:
        resp = page.goto(f"{BASE}{path}", wait_until="networkidle", timeout=30000)
        entry["status"] = resp.status if resp else "no_response"
    except Exception as e:
        entry["status"] = f"error: {e}"
        results["pages"][key] = entry
        return entry

    entry["load_time_ms"] = round((time.time() - start) * 1000)

    # Wait a bit more for dynamic content
    page.wait_for_timeout(2000)

    # Screenshot
    page.screenshot(path=f"{OUT}/{key}.png", full_page=True)

    # Meta info
    entry["title"] = page.title()
    meta_desc = page.locator('meta[name="description"]').first
    try:
        entry["meta_description"] = meta_desc.get_attribute("content", timeout=2000)
    except:
        entry["meta_description"] = None

    # Heading structure
    entry["h1_count"] = page.locator("h1").count()
    h2_count = page.locator("h2").count()
    entry["heading_structure"] = {"h1": entry["h1_count"], "h2": h2_count}

    # Images
    images = page.locator("img").all()
    entry["total_images"] = len(images)
    no_alt = 0
    for img in images:
        alt = img.get_attribute("alt")
        if alt is None or alt.strip() == "":
            src = img.get_attribute("src") or "unknown"
            no_alt += 1
    entry["img_without_alt"] = no_alt

    # Links
    links = page.locator("a[href]").all()
    entry["links_count"] = len(links)

    # Check for empty/broken anchor links
    broken = []
    for link in links:
        href = link.get_attribute("href")
        if href and href == "#":
            text = link.inner_text().strip()[:50]
            broken.append({"href": href, "text": text})
    entry["broken_anchors"] = broken

    entry["console_errors"] = errors
    entry["failed_resources"] = failed

    results["console_errors"].extend(errors)
    results["failed_resources"].extend(failed)
    results["pages"][key] = entry
    return entry


def check_navigation(page):
    """Test main navigation links work."""
    page.set_viewport_size({"width": 1440, "height": 900})
    page.goto(f"{BASE}/", wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(2000)

    nav_links = page.locator("nav a[href]").all()
    nav_info = []
    for link in nav_links:
        href = link.get_attribute("href")
        text = link.inner_text().strip()
        visible = link.is_visible()
        nav_info.append({"href": href, "text": text, "visible": visible})

    results["navigation"] = nav_info

    # Try clicking each visible nav link
    for info in nav_info:
        if info["visible"] and info["href"] and info["href"].startswith("/"):
            try:
                page.goto(f"{BASE}{info['href']}", wait_until="networkidle", timeout=15000)
                status = "ok"
            except Exception as e:
                status = str(e)
                results["navigation_issues"].append({"href": info["href"], "error": status})


def check_accessibility_basics(page):
    """Check basic accessibility on all pages."""
    for path, name in PAGES:
        page.set_viewport_size({"width": 1440, "height": 900})
        try:
            page.goto(f"{BASE}{path}", wait_until="networkidle", timeout=30000)
            page.wait_for_timeout(1000)
        except:
            continue

        issues = []

        # Check for lang attribute
        lang = page.locator("html").get_attribute("lang")
        if not lang:
            issues.append("Missing lang attribute on <html>")

        # Check for skip navigation link
        skip = page.locator('a[href="#main"], a[href="#content"], [class*="skip"]').count()
        if skip == 0:
            issues.append("No skip navigation link found")

        # Check buttons without accessible names
        buttons = page.locator("button").all()
        for btn in buttons:
            text = btn.inner_text().strip()
            aria = btn.get_attribute("aria-label") or ""
            title = btn.get_attribute("title") or ""
            if not text and not aria and not title:
                issues.append(f"Button without accessible name")

        # Check form inputs without labels
        inputs = page.locator("input:not([type='hidden'])").all()
        for inp in inputs:
            inp_id = inp.get_attribute("id") or ""
            aria = inp.get_attribute("aria-label") or ""
            placeholder = inp.get_attribute("placeholder") or ""
            if inp_id:
                label = page.locator(f'label[for="{inp_id}"]').count()
            else:
                label = 0
            if not label and not aria:
                issues.append(f"Input without label (placeholder: {placeholder})")

        # Check color contrast - just flag if text is very light
        # (basic check, not comprehensive)

        if issues:
            results["accessibility_issues"].append({"page": path, "issues": issues})


def generate_report():
    """Generate a summary report."""
    report = []
    report.append("=" * 70)
    report.append("FULL WEB APPLICATION AUDIT REPORT")
    report.append("=" * 70)

    # Page results
    report.append("\n## PAGE STATUS & PERFORMANCE")
    report.append("-" * 50)
    for key, data in sorted(results["pages"].items()):
        status_icon = "OK" if data["status"] == 200 else f"ISSUE ({data['status']})"
        report.append(f"  {key:30s} | {status_icon:10s} | {data.get('load_time_ms', '?')}ms")

    # Console errors
    report.append(f"\n## CONSOLE ERRORS ({len(results['console_errors'])} total)")
    report.append("-" * 50)
    seen = set()
    for err in results["console_errors"]:
        sig = f"{err['page']}:{err['text'][:80]}"
        if sig not in seen:
            seen.add(sig)
            report.append(f"  [{err['page']}] {err['text'][:120]}")

    # Failed resources
    report.append(f"\n## FAILED RESOURCES ({len(results['failed_resources'])} total)")
    report.append("-" * 50)
    seen = set()
    for res in results["failed_resources"]:
        sig = res["url"]
        if sig not in seen:
            seen.add(sig)
            report.append(f"  [{res['page']}] {res['url'][:120]}")

    # SEO basics
    report.append("\n## SEO BASICS")
    report.append("-" * 50)
    for key, data in sorted(results["pages"].items()):
        if "desktop" not in key:
            continue
        issues = []
        if not data.get("title"):
            issues.append("Missing title")
        if not data.get("meta_description"):
            issues.append("Missing meta description")
        if data.get("h1_count", 0) == 0:
            issues.append("No H1")
        if data.get("h1_count", 0) > 1:
            issues.append(f"Multiple H1s ({data['h1_count']})")
        if data.get("img_without_alt", 0) > 0:
            issues.append(f"{data['img_without_alt']}/{data['total_images']} images missing alt")
        if issues:
            report.append(f"  {key}: {', '.join(issues)}")
        else:
            report.append(f"  {key}: All good")

    # Navigation
    report.append("\n## NAVIGATION")
    report.append("-" * 50)
    if results.get("navigation"):
        for nav in results["navigation"]:
            vis = "visible" if nav["visible"] else "HIDDEN"
            report.append(f"  {nav['text']:20s} -> {nav['href']:30s} [{vis}]")
    if results["navigation_issues"]:
        report.append("  ISSUES:")
        for issue in results["navigation_issues"]:
            report.append(f"    {issue['href']}: {issue['error'][:80]}")

    # Accessibility
    report.append(f"\n## ACCESSIBILITY BASICS")
    report.append("-" * 50)
    if results["accessibility_issues"]:
        for item in results["accessibility_issues"]:
            report.append(f"  [{item['page']}]")
            for issue in item["issues"]:
                report.append(f"    - {issue}")
    else:
        report.append("  No basic accessibility issues found")

    # Broken anchors
    report.append("\n## BROKEN/EMPTY ANCHOR LINKS")
    report.append("-" * 50)
    any_broken = False
    for key, data in sorted(results["pages"].items()):
        if "desktop" not in key:
            continue
        if data.get("broken_anchors"):
            any_broken = True
            for ba in data["broken_anchors"]:
                report.append(f"  [{key}] href=\"{ba['href']}\" text=\"{ba['text']}\"")
    if not any_broken:
        report.append("  None found")

    # Screenshots taken
    report.append("\n## SCREENSHOTS")
    report.append("-" * 50)
    for key in sorted(results["pages"].keys()):
        report.append(f"  {OUT}/{key}.png")

    report.append("\n" + "=" * 70)
    return "\n".join(report)


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, channel="chrome")

    print(">>> Phase 1: Auditing pages across viewports...")
    for path, name in PAGES:
        for vp in VIEWPORTS:
            print(f"  Testing {name} @ {vp['name']}...")
            pg = browser.new_page()
            try:
                audit_page(pg, path, name, vp["name"], vp)
            except Exception as e:
                print(f"  ERROR on {name}@{vp['name']}: {e}")
                results["pages"][f"{name}_{vp['name']}"] = {"error": str(e)}
            finally:
                pg.close()

    print("\n>>> Phase 2: Testing navigation...")
    pg = browser.new_page()
    try:
        check_navigation(pg)
    except Exception as e:
        print(f"  Navigation test error: {e}")
    finally:
        pg.close()

    print("\n>>> Phase 3: Checking accessibility basics...")
    pg = browser.new_page()
    try:
        check_accessibility_basics(pg)
    except Exception as e:
        print(f"  Accessibility check error: {e}")
    finally:
        pg.close()

    browser.close()

# Generate report
report = generate_report()
print("\n" + report)

# Save full results as JSON
with open(f"{OUT}/audit_results.json", "w") as f:
    json.dump(results, f, indent=2, default=str)

# Save report
with open(f"{OUT}/audit_report.txt", "w") as f:
    f.write(report)

print(f"\nFull results saved to {OUT}/audit_results.json")
print(f"Report saved to {OUT}/audit_report.txt")
