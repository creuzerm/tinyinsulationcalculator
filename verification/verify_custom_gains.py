from playwright.sync_api import sync_playwright
import time

def verify_custom_gains():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto("http://localhost:8080/index.html")

        # Open detailed loads
        page.get_by_text("Show Detailed Loads").click()

        # Click Add Custom Source
        # Button text is "+ Add Custom Source"
        # Since it is dynamically added, wait for it
        page.wait_for_selector("text=Custom / Additional Sources")

        # The custom section is appended.
        # Add button is inside.
        page.click("text=+ Add Custom Source")

        # Check if new row appeared
        page.wait_for_selector("input[value='New Source']")

        # Modify it
        # The first custom row inputs.
        # Name
        page.fill("input[value='New Source']", "Wood Stove")

        # Watts (default 100) -> 5000
        # Since there are multiple inputs with 100 or placeholder "Watts", use index or relative locator?
        # The newly added row is the first one in the custom table.
        # But there might be other tables.
        # Custom section table.

        # Using placeholder is safer if unique in context, but standard rows don't have these placeholders.
        page.locator("input[placeholder='Watts']").last.fill("5000")

        # Duty (default 24) -> 4 hours
        page.locator("input[placeholder='Hrs']").last.fill("4")

        # Qty -> 1

        # Verify calculation
        # 5000W * 4h = 20000 Wh / 24 = 833.33 W
        # 833.33 * 3.412 = 2843 BTU/hr

        # Check custom summary
        summary = page.locator("#gain_summary_custom")
        page.wait_for_timeout(500)
        print(f"Custom Summary: {summary.inner_text()}")

        # Check global total simInternalGain
        # Default 400? Or sum of existing?
        # Existing occupants: 1 adult male (75 * 24 / 24 * 3.412 = 256)
        # Appliances: 0
        # Custom: 2843
        # Total approx 3100

        total_input = page.locator("#simInternalGain")
        print(f"Total Gain: {total_input.input_value()}")

        # Test Persistence
        # Reload page
        page.reload()

        page.get_by_text("Show Detailed Loads").click()
        page.wait_for_selector("input[value='Wood Stove']")

        val = page.locator("input[value='Wood Stove']").input_value()
        print(f"Persisted Name: {val}")

        summary_after = page.locator("#gain_summary_custom")
        print(f"Persisted Summary: {summary_after.inner_text()}")

        page.screenshot(path="verification/custom_gains.png")
        browser.close()

if __name__ == "__main__":
    verify_custom_gains()
