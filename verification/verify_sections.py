from playwright.sync_api import sync_playwright

def verify_sections():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the index file via http server (assumed running on 8080 from previous session or restart it)
        # Note: Since I cannot rely on previous background process persisting in a new session block if not explicit,
        # but the tool says "Successive invocations of this tool use the same bash session".
        # So the server might be running. If not, I should restart it.
        # But wait, checking lsof is safer.

        page.goto("http://localhost:8080/index.html")

        # Open detailed loads
        summary = page.get_by_text("Show Detailed Loads")
        summary.click()

        # Check for new sections
        occupants_section = page.get_by_text("Occupants")
        appliances_section = page.get_by_text("Appliances & Infrastructure")

        # Verify they are in details/summary by checking structure
        # We can look for the summary spans with 0 BTU/hr
        occupant_summary = page.locator("#gain_summary_occupants")
        appliance_summary = page.locator("#gain_summary_appliances")

        print(f"Occupant Summary Text: {occupant_summary.inner_text()}")
        print(f"Appliance Summary Text: {appliance_summary.inner_text()}")

        # Change value
        page.fill("#gain_qty_adult_male", "1") # 1 male = 75W * 24h = 1800Wh -> /24 = 75W -> 256 BTU
        # 75 * 3.412 = 255.9

        page.wait_for_timeout(500)

        print(f"Occupant Summary Text After: {occupant_summary.inner_text()}")

        # Change appliance
        page.fill("#gain_qty_fridge_dc", "1") # 45W * 8h = 360Wh -> /24 = 15W -> 51 BTU
        # 15 * 3.412 = 51.18

        page.wait_for_timeout(500)

        print(f"Appliance Summary Text After: {appliance_summary.inner_text()}")

        page.screenshot(path="verification/sections.png")
        browser.close()

if __name__ == "__main__":
    verify_sections()
