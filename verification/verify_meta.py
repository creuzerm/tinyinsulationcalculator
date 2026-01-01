
from playwright.sync_api import sync_playwright
import os

def verify_meta_tags():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        cwd = os.getcwd()

        # Verify index.html
        page.goto(f"file://{cwd}/index.html")
        title = page.title()
        print(f"Title: {title}")

        desc = page.locator("meta[name=\"description\"]").get_attribute("content")
        print(f"Description: {desc}")

        og_title = page.locator("meta[property=\"og:title\"]").get_attribute("content")
        print(f"OG Title: {og_title}")

        # Screenshot
        page.screenshot(path="verification/index_seo.png")

        # Verify existing_building_estimator.html
        page.goto(f"file://{cwd}/existing_building_estimator.html")
        title2 = page.title()
        print(f"Title 2: {title2}")

        desc2 = page.locator("meta[name=\"description\"]").get_attribute("content")
        print(f"Description 2: {desc2}")

        # Screenshot
        page.screenshot(path="verification/estimator_seo.png")

        browser.close()

if __name__ == "__main__":
    verify_meta_tags()
