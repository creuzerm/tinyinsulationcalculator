from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Navigate to the page
    page.goto("http://localhost:8080/insulationexplorer.html")

    # Wait for the page to load
    page.wait_for_selector(".add-menu")

    # Verify Aria Labels are present on new buttons
    # We will check a few representative ones

    # XPS 0.5in
    xps_btn = page.locator("button[onclick=\"addLayer('XPS Rigid Foam (0.5in)')\"]")
    xps_aria = xps_btn.get_attribute("aria-label")
    print(f"XPS 0.5in Aria Label: {xps_aria}")
    assert xps_aria == "Add XPS Rigid Foam 0.5 inch"

    # Polyiso 2in
    poly_btn = page.locator("button[onclick=\"addLayer('Polyiso Board (2in)')\"]")
    poly_aria = poly_btn.get_attribute("aria-label")
    print(f"Polyiso 2in Aria Label: {poly_aria}")
    assert poly_aria == "Add Polyiso Board 2 inch"

    # Closed Cell 3.5in
    cc_btn = page.locator("button[onclick=\"addLayer('Closed Cell Foam (3.5in)')\"]")
    cc_aria = cc_btn.get_attribute("aria-label")
    print(f"Closed Cell 3.5in Aria Label: {cc_aria}")
    assert cc_aria == "Add Closed Cell Foam 3.5 inch"

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
