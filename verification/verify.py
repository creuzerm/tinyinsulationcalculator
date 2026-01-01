from playwright.sync_api import sync_playwright

def verify_internal_gains():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the index file directly
        page.goto("http://localhost:8080/index.html")

        # Find the details summary and click it
        summary = page.get_by_text("Show Detailed Loads (Occupants & Appliances)")
        summary.click()

        # Wait for table to be populated
        page.wait_for_selector("text=Adult Male", state="visible")

        # Check for appliance
        page.wait_for_selector("text=Fridge 12V DC (50L)", state="visible")

        # Input some values
        page.fill("#gain_qty_adult_male", "2")
        page.fill("#gain_qty_fridge_dc", "1")

        # Check value of simInternalGain
        sim_input = page.locator("#simInternalGain")

        # Give it a moment for calculation
        page.wait_for_timeout(500)

        val = sim_input.input_value()
        print(f"Calculated Internal Gain: {val}")

        page.screenshot(path="verification/internal_gains.png")

        browser.close()

if __name__ == "__main__":
    verify_internal_gains()
