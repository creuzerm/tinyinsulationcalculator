from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Determine the file path for index.html
        cwd = os.getcwd()
        file_path = f"file://{cwd}/index.html"
        print(f"Navigating to: {file_path}")

        page.goto(file_path)

        # Wait for the page to load
        page.wait_for_selector("#wallAssemblyType_A")

        print("Setting up Scenario A: Stick Frame (Steel)...")
        # Set Scenario A to Stick Frame (Steel, 2x6, 16oc, Fiberglass)
        page.locator("#wallAssemblyType_A").select_option("stick")
        page.locator("#wallStudMaterial_A").select_option("steel")
        page.locator("#wallStudSize_A").select_option("2x6")
        page.locator("#wallStudSpacing_A").select_option("16")
        page.locator("#wallCavityInsulation_A").select_option("fiberglass_batt")
        page.locator("#wallContinuousInsulation_A").fill("0")

        # Enable A/B
        print("Enabling A/B Comparison...")
        page.locator("label:has-text('Enable A/B Comparison')").click()
        page.wait_for_selector("#scenarioBoxB")

        print("Setting up Scenario B: Stick Frame (Wood)...")
        # Set Scenario B to Stick Frame (Wood, 2x6, 16oc, Fiberglass)
        page.locator("#wallAssemblyType_B").select_option("stick")
        page.locator("#wallStudMaterial_B").select_option("wood")
        page.locator("#wallStudSize_B").select_option("2x6")
        page.locator("#wallStudSpacing_B").select_option("16")
        page.locator("#wallCavityInsulation_B").select_option("fiberglass_batt")
        page.locator("#wallContinuousInsulation_B").fill("0")

        # Ensure other inputs are identical for a fair comparison
        # (Assuming defaults are same, but let's be safe for critical ones)
        # Windows/Doors are default. Roof/Floor default.

        # Wait a moment for calculations to update (debounced?)
        page.wait_for_timeout(500)

        # Log results for CLI verification
        loss_a = page.locator("#resultLoss_A").inner_text()
        loss_b = page.locator("#resultLoss_B").inner_text()
        print(f"Scenario A (Steel) Loss: {loss_a}")
        print(f"Scenario B (Wood) Loss: {loss_b}")

        # Take Screenshot
        screenshot_path = "verification/assembly_builder_steel_verification.png"
        page.screenshot(path=screenshot_path, full_page=True)
        print(f"Screenshot saved to {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    run()
