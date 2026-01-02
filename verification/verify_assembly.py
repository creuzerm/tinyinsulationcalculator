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

        # Wait for the page to load (checking for a key element)
        page.wait_for_selector("#wallAssemblyType_A")

        # Verify Scenario A Assembly Builder UI
        print("Verifying Scenario A Assembly Builder...")

        # Check initial state (Stick Frame selected)
        assembly_select_a = page.locator("#wallAssemblyType_A")
        if assembly_select_a.input_value() != "stick":
            print(f"Initial assembly type A is not 'stick', it is {assembly_select_a.input_value()}")
            # Setting it to stick if not already
            assembly_select_a.select_option("stick")

        # Check Stick Frame inputs visibility
        stick_group_a = page.locator("#group_stick_A")
        if not stick_group_a.is_visible():
            print("Stick Frame Group A should be visible")

        # Change to Mass Wall
        assembly_select_a.select_option("mass")

        # Check Mass Wall inputs visibility
        mass_group_a = page.locator("#group_mass_A")
        if not mass_group_a.is_visible():
            print("Mass Wall Group A should be visible after selection")

        # Check Stick Frame inputs hidden
        if stick_group_a.is_visible():
            print("Stick Frame Group A should be hidden after mass selection")

        # Set Inputs for User's Aircrete Scenario
        # Material: Aircrete
        page.locator("#wallMassMaterial_A").select_option("aircrete")
        # Thickness: 8
        page.locator("#wallMassThickness_A").fill("8")
        # Addt'l Insulation: 10
        page.locator("#wallMassInsulation_A").fill("10")

        # Enable A/B
        page.locator("label:has-text('Enable A/B Comparison')").click()

        # Verify Scenario B Assembly Builder UI
        print("Verifying Scenario B Assembly Builder...")
        # Should be visible now
        page.wait_for_selector("#scenarioBoxB")

        # Set Scenario B to Stick Frame (2x6, 24oc, Mineral Wool, R-5 CI)
        page.locator("#wallAssemblyType_B").select_option("stick")
        page.locator("#wallStudSize_B").select_option("2x6")
        page.locator("#wallStudSpacing_B").select_option("24")
        page.locator("#wallCavityInsulation_B").select_option("mineral_wool")
        page.locator("#wallContinuousInsulation_B").fill("5")

        # Take Screenshot
        screenshot_path = "verification/assembly_builder_verification.png"
        page.screenshot(path=screenshot_path, full_page=True)
        print(f"Screenshot saved to {screenshot_path}")

        browser.close()

if __name__ == "__main__":
    run()
