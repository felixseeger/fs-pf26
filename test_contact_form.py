"""
Contact form tests for /contact page.

Tests:
1. Form renders with all required fields
2. Client-side validation (required fields, email format)
3. Successful submission flow (mocked API)
4. Server-side validation error handling
5. Network error handling
6. Privacy checkbox enforcement
7. Service dropdown options
8. "Heard from" radio buttons
9. Submit button disabled state while sending
10. "Send another message" after success
11. API route direct validation
"""

import json
import sys
import os

# Force UTF-8 output on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from playwright.sync_api import sync_playwright, Route

BASE_URL = "http://localhost:3000"
GOTO_TIMEOUT = 60000  # 60s for first load (Next.js compile)
CHROME_PATH = r"C:\Program Files\Google\Chrome\Application\chrome.exe"


def intercept_contact_api(route: Route, status=200, body=None):
    """Helper to mock /api/contact responses."""
    if body is None:
        body = {"status": "mail_sent", "message": "Thank you for your message."}
    route.fulfill(
        status=status,
        content_type="application/json",
        body=json.dumps(body),
    )


def fill_form(page, name="Test User", email="test@example.com", subject="Test",
              message="Hello", select_service=True, select_heard=True, check_privacy=True):
    """Helper to fill the contact form."""
    page.fill('input[name="fullName"]', name)
    page.fill('input[name="email"]', email)
    page.fill('input[name="subject"]', subject)
    if select_service:
        page.locator('select[name="service"]').select_option(index=1)
    page.fill('textarea[name="message"]', message)
    if select_heard:
        page.locator('input[name="heardFrom"]').first.check()
    if check_privacy:
        page.locator('input[name="privacy"]').check()


def run_tests():
    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, executable_path=CHROME_PATH)

        # Warm up: hit the root page first, then /contact
        print("\n  Warming up (Next.js initial compile)...")
        warmup = browser.new_page()
        try:
            # First hit root to trigger Next.js framework compilation
            warmup.goto(f"{BASE_URL}/", timeout=120000, wait_until="domcontentloaded")
            print("  Root page loaded, now compiling /contact...")
            warmup.goto(f"{BASE_URL}/contact", timeout=120000, wait_until="domcontentloaded")
            warmup.wait_for_load_state("networkidle", timeout=60000)
            print("  Ready.\n")
        finally:
            warmup.close()

        # ── Test 1: Form renders with all fields ──────────────────────
        def test_form_renders():
            page = browser.new_page()
            page.goto(f"{BASE_URL}/contact", timeout=30000)
            page.wait_for_load_state("networkidle")
            page.screenshot(path="/tmp/contact_form_initial.png", full_page=True)

            for selector, label in [
                ('input[name="fullName"]', "Full Name input"),
                ('input[name="email"]', "Email input"),
                ('input[name="subject"]', "Subject input"),
                ('select[name="service"]', "Service select"),
                ('textarea[name="message"]', "Message textarea"),
                ('input[name="privacy"]', "Privacy checkbox"),
                ('button[type="submit"]', "Submit button"),
            ]:
                assert page.locator(selector).count() == 1, f"{label} missing"

            radios = page.locator('input[name="heardFrom"]')
            assert radios.count() >= 1, "No 'heard from' radio buttons"

            page.close()
            return "PASS"

        # ── Test 2: Client-side required field validation ─────────────
        def test_required_field_validation():
            page = browser.new_page()
            page.goto(f"{BASE_URL}/contact", timeout=30000)
            page.wait_for_load_state("networkidle")

            page.locator('button[type="submit"]').click()

            is_invalid = page.evaluate(
                '() => !document.querySelector(\'input[name="fullName"]\').validity.valid'
            )
            assert is_invalid, "Empty fullName should be invalid"

            page.close()
            return "PASS"

        # ── Test 3: Email format validation ───────────────────────────
        def test_email_validation():
            page = browser.new_page()
            page.goto(f"{BASE_URL}/contact", timeout=30000)
            page.wait_for_load_state("networkidle")

            fill_form(page, email="not-an-email")
            page.locator('button[type="submit"]').click()

            is_invalid = page.evaluate(
                '() => !document.querySelector(\'input[name="email"]\').validity.valid'
            )
            assert is_invalid, "Invalid email should fail HTML5 validation"

            page.close()
            return "PASS"

        # ── Test 4: Successful submission ─────────────────────────────
        def test_successful_submission():
            page = browser.new_page()
            page.goto(f"{BASE_URL}/contact", timeout=30000)
            page.wait_for_load_state("networkidle")

            page.route("**/api/contact", lambda route: intercept_contact_api(route))
            fill_form(page, message="I'd like to discuss a project.")
            page.locator('button[type="submit"]').click()

            success = page.locator("text=Message Sent!")
            success.wait_for(state="visible", timeout=5000)
            assert success.is_visible(), "Success message not shown"

            page.screenshot(path="/tmp/contact_form_success.png", full_page=True)
            page.close()
            return "PASS"

        # ── Test 5: Server validation error ───────────────────────────
        def test_server_validation_error():
            page = browser.new_page()
            page.goto(f"{BASE_URL}/contact", timeout=30000)
            page.wait_for_load_state("networkidle")

            page.route(
                "**/api/contact",
                lambda route: intercept_contact_api(
                    route, status=400,
                    body={"status": "validation_failed", "message": "Name, email, and message are required."},
                ),
            )

            fill_form(page)
            page.locator('button[type="submit"]').click()

            error = page.locator("text=Name, email, and message are required.")
            error.wait_for(state="visible", timeout=5000)
            assert error.is_visible(), "Error message not displayed"

            page.screenshot(path="/tmp/contact_form_error.png", full_page=True)
            page.close()
            return "PASS"

        # ── Test 6: Network error handling ────────────────────────────
        def test_network_error():
            page = browser.new_page()
            page.goto(f"{BASE_URL}/contact", timeout=30000)
            page.wait_for_load_state("networkidle")

            page.route("**/api/contact", lambda route: route.abort())

            fill_form(page)
            page.locator('button[type="submit"]').click()

            # Look for error styling (red background)
            error_region = page.locator("[class*='bg-red']")
            error_region.first.wait_for(state="visible", timeout=5000)
            assert error_region.first.is_visible(), "Network error not shown to user"

            page.close()
            return "PASS"

        # ── Test 7: Privacy checkbox required ─────────────────────────
        def test_privacy_required():
            page = browser.new_page()
            page.goto(f"{BASE_URL}/contact", timeout=30000)
            page.wait_for_load_state("networkidle")

            fill_form(page, check_privacy=False)
            page.locator('button[type="submit"]').click()

            is_invalid = page.evaluate(
                '() => !document.querySelector(\'input[name="privacy"]\').validity.valid'
            )
            assert is_invalid, "Privacy checkbox should be required"

            page.close()
            return "PASS"

        # ── Test 8: Service dropdown has options ──────────────────────
        def test_service_options():
            page = browser.new_page()
            page.goto(f"{BASE_URL}/contact", timeout=30000)
            page.wait_for_load_state("networkidle")

            count = page.locator('select[name="service"] option').count()
            assert count >= 3, f"Expected at least 3 options, got {count}"

            first_disabled = page.evaluate(
                '() => document.querySelector(\'select[name="service"] option\').disabled'
            )
            assert first_disabled, "First option should be disabled placeholder"

            page.close()
            return "PASS"

        # ── Test 9: Submit button shows loading state ─────────────────
        def test_loading_state():
            page = browser.new_page()
            page.goto(f"{BASE_URL}/contact", timeout=30000)
            page.wait_for_load_state("networkidle")

            def slow_response(route: Route):
                import time
                time.sleep(2)
                intercept_contact_api(route)

            page.route("**/api/contact", slow_response)

            fill_form(page)
            page.locator('button[type="submit"]').click()

            sending = page.locator("text=Sending...")
            sending.wait_for(state="visible", timeout=3000)
            assert sending.is_visible(), "Loading state not shown"

            submit_btn = page.locator('button[type="submit"]')
            assert submit_btn.is_disabled(), "Button should be disabled while submitting"

            page.screenshot(path="/tmp/contact_form_loading.png", full_page=True)
            page.close()
            return "PASS"

        # ── Test 10: Send another message resets form ─────────────────
        def test_send_another_message():
            page = browser.new_page()
            page.goto(f"{BASE_URL}/contact", timeout=30000)
            page.wait_for_load_state("networkidle")

            page.route("**/api/contact", lambda route: intercept_contact_api(route))

            fill_form(page)
            page.locator('button[type="submit"]').click()
            page.locator("text=Message Sent!").wait_for(state="visible", timeout=5000)

            page.locator("text=Send another message").click()

            name_input = page.locator('input[name="fullName"]')
            name_input.wait_for(state="visible", timeout=3000)
            assert name_input.input_value() == "", "Name should be cleared"
            assert page.locator('input[name="email"]').input_value() == "", "Email should be cleared"

            page.close()
            return "PASS"

        # ── Test 11: API route validation (direct fetch) ──────────────
        def test_api_route_validation():
            page = browser.new_page()

            # Test invalid JSON body
            resp = page.request.post(
                f"{BASE_URL}/api/contact",
                headers={"Content-Type": "application/json"},
                data="not json",
            )
            assert resp.status == 400, f"Expected 400 for bad JSON, got {resp.status}"
            data = resp.json()
            assert data["status"] == "validation_failed"

            # Test missing required fields
            resp = page.request.post(
                f"{BASE_URL}/api/contact",
                data={"email": "test@example.com"},
            )
            assert resp.status == 400, f"Expected 400 for missing fields, got {resp.status}"
            data = resp.json()
            assert "required" in data["message"].lower(), f"Expected 'required' in message, got: {data['message']}"

            page.close()
            return "PASS"

        # ── Run all tests ─────────────────────────────────────────────
        tests = [
            ("Form renders with all fields", test_form_renders),
            ("Required field validation", test_required_field_validation),
            ("Email format validation", test_email_validation),
            ("Successful submission", test_successful_submission),
            ("Server validation error", test_server_validation_error),
            ("Network error handling", test_network_error),
            ("Privacy checkbox required", test_privacy_required),
            ("Service dropdown options", test_service_options),
            ("Submit button loading state", test_loading_state),
            ("Send another message reset", test_send_another_message),
            ("API route direct validation", test_api_route_validation),
        ]

        print(f"{'='*60}")
        print(f"  CONTACT FORM TEST SUITE - {len(tests)} tests")
        print(f"{'='*60}\n")

        passed = 0
        failed = 0

        for name, test_fn in tests:
            try:
                result = test_fn()
                print(f"  [PASS] {name}")
                passed += 1
                results.append((name, "PASS", None))
            except Exception as e:
                print(f"  [FAIL] {name}")
                print(f"         -> {e}")
                failed += 1
                results.append((name, "FAIL", str(e)))

        print(f"\n{'='*60}")
        print(f"  Results: {passed} passed, {failed} failed, {len(tests)} total")
        print(f"{'='*60}")
        print(f"\n  Screenshots saved to /tmp/contact_form_*.png\n")

        browser.close()

    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(run_tests())
