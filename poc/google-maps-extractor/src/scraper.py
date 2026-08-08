import asyncio
import re
from loguru import logger
from crawlee.playwright_crawler import PlaywrightCrawler, PlaywrightCrawlingContext

# Configure Loguru to log to a file
logger.add("scraper.log", rotation="500 MB", level="INFO", backtrace=True, diagnose=True)

class Restaurant:
    """Defines the data structure for the extracted restaurant information."""
    def __init__(self):
        self.name = None
        self.address = None
        self.phone_number = None
        self.website = None
        self.rating = None
        self.reviews_count = None
        self.place_url = None

async def extract_restaurant_details(context: PlaywrightCrawlingContext, place_url: str):
    """Navigates to a restaurant's page and extracts its details."""
    logger.info(f"Scraping details from: {place_url}")
    page = await context.browser_context.new_page()
    await page.goto(place_url)

    item = Restaurant()
    item.place_url = place_url

    # Extract name
    try:
        name_locator = page.locator('h1')
        item.name = await name_locator.inner_text()
    except Exception:
        logger.warning(f"Could not extract name for {place_url}")

    # Extract details using data-item-id attributes
    common_details = {
        'address': 'address',
        'website': 'authority',
        'phone_number': 'phone'
    }
    for key, data_id in common_details.items():
        try:
            locator = page.locator(f'[data-item-id="{data_id}"] button, [data-item-id="{data_id}"] a')
            if await locator.count() > 0:
                item.__setattr__(key, await locator.first.inner_text())
        except Exception as e:
            logger.warning(f"Could not extract {key} for {place_url}: {e}")

    # Extract rating and reviews
    try:
        rating_locator = page.locator('span[aria-label*="stars"]')
        if await rating_locator.count() > 0:
            aria_label = await rating_locator.first.get_attribute('aria-label')
            match = re.search(r'(\d+\.\d+)\s+stars', aria_label)
            if match:
                item.rating = float(match.group(1))
    except Exception as e:
        logger.warning(f"Could not extract rating for {place_url}: {e}")

    try:
        reviews_locator = page.locator('button[jsaction*="reviews.setSort"]')
        if await reviews_locator.count() > 0:
            text = await reviews_locator.first.inner_text()
            match = re.search(r'([\d,]+)\s+reviews', text)
            if match:
                item.reviews_count = int(match.group(1).replace(',', ''))
    except Exception as e:
        logger.warning(f"Could not extract reviews count for {place_url}: {e}")

    await context.push_data(item.__dict__)
    await page.close()


async def request_handler(context: PlaywrightCrawlingContext):
    """
    Handles the main search page, scrolls to load all results,
    and enqueues detail pages for scraping.
    """
    page = context.page
    logger.info(f"Processing search results page: {page.url}")

    # Wait for the main results feed to appear
    feed_selector = 'div[role="feed"]'
    await page.wait_for_selector(feed_selector, timeout=30000)
    logger.info("Results feed loaded.")

    # Scroll to the bottom of the results to load all restaurants
    scrollable_feed = page.locator(feed_selector)
    while True:
        # Get current number of results
        initial_results_count = await page.locator(f'{feed_selector} > div').count()
        logger.info(f"Found {initial_results_count} results so far. Scrolling to load more...")

        # Scroll to the bottom of the feed
        await scrollable_feed.evaluate('node => node.scrollTop = node.scrollHeight')
        
        # Wait for a short period to allow new content to load
        await asyncio.sleep(3)

        # Check if new results have loaded
        current_results_count = await page.locator(f'{feed_selector} > div').count()
        if current_results_count == initial_results_count:
            logger.info("No new results loaded. Finished scrolling.")
            break
        logger.info(f"Loaded {current_results_count} results.")

    # Extract links for all restaurants and add them to the crawler queue
    place_links = page.locator('a[href*="/maps/place/"]')
    all_links = await place_links.all()

    urls_to_scrape = []
    for link_locator in all_links:
        href = await link_locator.get_attribute('href')
        if href and 'https://www.google.com' not in href:
            href = f"https://www.google.com{href}"
        urls_to_scrape.append(href)
    
    # Deduplicate URLs before adding to queue
    unique_urls = sorted(list(set(urls_to_scrape)))
    logger.info(f"Found {len(unique_urls)} unique restaurant links to scrape.")
    
    for url in unique_urls:
        await extract_restaurant_details(context, url)


async def main():
    """
    Main function to configure and run the PlaywrightCrawler.
    """
    logger.info("Starting Google Maps scraper.")
    
    crawler = PlaywrightCrawler(
        # The main request handler for the initial search URL
        request_handler=request_handler,
        # Set to False to see the browser in action, True for production runs
        headless=False,
        # Increase the navigation timeout to handle slow-loading pages
        navigation_timeout_secs=120,
    )
    
    start_urls = ["https://www.google.com/maps/search/restaurants+in+HCMC"]
    await crawler.run(start_urls)
    
    logger.info("Scraping finished.")

if __name__ == "__main__":
    asyncio.run(main())