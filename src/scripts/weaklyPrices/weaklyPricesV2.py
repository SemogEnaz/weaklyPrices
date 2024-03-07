import sys
import csv
import os
import time

from modules.catagory import Catagory
from modules.item import Item

import requests
from bs4 import BeautifulSoup

from pyshadow.main import Shadow
from selenium.webdriver.chrome.options import Options
from selenium import webdriver
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException, TimeoutException, JavascriptException, StaleElementReferenceException

import math

def soup_from_link(link: str) -> BeautifulSoup:

        r = requests.get(link)
        soup = BeautifulSoup(r.text, 'lxml')

        return soup

def find_one_class(soup: BeautifulSoup, class_id: str):
    return soup.find(attrs={'class':class_id})

def parse_price(price_str: str):
        index = price_str.find('$')
        return price_str[index + 1:]

def remove_duplicates(catalogue: list[Catagory]):
    for category in catalogue:
        seen_links = set()
        unique_items = []

        for item in category.items:
            if item.link not in seen_links:
                seen_links.add(item.link)
                unique_items.append(item)
                
        category.items = unique_items


# Taken from weaklyPricesV1 ;)
def write_catalogue_to_csv(catalogue: list[Catagory], dir_name: str) -> None:

    for catagory in catalogue:
        headings = ['name', 'old_price', 'new_price', 'link']

        data = [headings]

        for item in catagory.items:
            data.append([item.name, item.old_price, item.new_price, item.link])

        file_name = os.path.join(dir_name, f'{catagory.name}.csv')

        with open(file_name, 'w', newline='') as file:
            writer = csv.writer(file)
            writer.writerows(data)

def get_coles_catalogue():  

    root_dir = 'https://www.coles.com.au'
    special = '/on-special'
    coles_catalogue_dir = './coles_catalogue/'

    def parse_name(name: str):
        index = name.find('|')
        return name[:index - 1]

    soup = soup_from_link(root_dir + special)

    nav_bar_class = 'coles-targeting-ScrollContainerContainer'
    nav_bar = soup.find(attrs={"class":nav_bar_class})

    link_elements = nav_bar.find_all('a')
    links = [link.get('href') for link in link_elements if link.get('href') != '#']

    # Error element class
    error_page_class = 'coles-targeting-StylesErrorPageStylesTitle'

    # Finding the item tiles
    items_table_class = 'coles-targeting-StylesCategoryStylesProductListContainer'
    item_class = 'coles-targeting-ProductTileProductTileWrapper'

    # Product details
    catagory_name_class = 'coles-targeting-ProductHeadingHeadingContainer'
    link_class = 'product__link'
    name_class = 'product__title'
    new_price_class = 'price__value'
    old_price_class = 'price__was'

    # Request page number
    page_request = '?page='
    total_page_count = 0
    total_item_count = 0

    catalogue = []

    sleep_timeout = 10

    # Getting items for all catagories
    for link in links:

        # Getting first page
        soup = soup_from_link(root_dir + link)

        # Getting name of catagory
        try:
            catagory_name = find_one_class(soup, catagory_name_class).find('h1').get_text()
        except:
            print(f'ERROR AT read catagory name of {link}')

            while True:
                time.sleep(sleep_timeout)
                sleep_timeout *= 2

                soup = soup_from_link(root_dir + link)

                try:
                    catagory_name = find_one_class(soup, catagory_name_class).find('h1').get_text()
                except:
                    print(f'ERROR while handling, sleeping ({sleep_timeout}sec)')
                    continue

                break

        print(f'{catagory_name}')
        
        # New catagory object initilized with link to page
        catagory = Catagory(catagory_name, root_dir + link)

        page_count = 2

        # Getting all pages from catagory
        while True:

            items_table = ''
            items = ''

            # If error displayed on page, next catagory
            if find_one_class(soup, error_page_class):
                print(f'\tPage count: {page_count - 2}', end='\n\t')
                break

            # Find items table
            items_table = find_one_class(soup, items_table_class)

            try:
                items = items_table.find_all(attrs={'class':item_class})
            except:

                print(f'\n\nERROR AT item_count:{len(catagory.items)} page_count:{page_count}...\nGoing to sleep (-___-) zzzz ({sleep_timeout}sec)\n')

                while True:
                    time.sleep(sleep_timeout)
                    sleep_timeout *= 2   # Doubling sleep count

                    soup = soup_from_link(root_dir + link + page_request + str(page_count))

                    try:
                        items_table = find_one_class(soup, items_table_class)
                        items = items_table.find_all(attrs={'class':item_class})
                    except:
                        print(f'\nERROR while handeling, looping\nSleeping for {sleep_timeout}sec')
                        continue

                    break

            # Make item objects from items table and store in catagory obj
            for item in items:

                # Item attributes
                item_link = find_one_class(item, link_class).get('href')
                item_name = find_one_class(item, name_class).get_text()

                try:
                    item_old_price = find_one_class(item, old_price_class).get_text()
                except:
                    continue

                item_new_price = find_one_class(item, new_price_class).get_text()

                item_name = parse_name(item_name)
                item_old_price = parse_price(item_old_price)
                item_new_price = parse_price(item_new_price)

                catagory.add_item(Item(item_name, item_old_price, item_new_price, root_dir + item_link))
                total_item_count += 1

            # Getting next page
            soup = soup_from_link(root_dir + link + page_request + str(page_count))

            page_count += 1     # Updating to next page and continue while loop
            total_page_count += 1
        
        # After catagory is fully read, add to catalogue array
        catalogue.append(catagory)
        print(f'Item count: {len(catagory.items)}')

    print(f'\nTotal pages read: {total_page_count}')
    print(f'Total items saved: {total_item_count}')

    remove_duplicates(catalogue)
    write_catalogue_to_csv(catalogue, coles_catalogue_dir)
    print(f'Data written to {coles_catalogue_dir}! :)')

def get_url_params(page_count = 1):

    url_query_start = '?'
    url_page_num = 'pageNumber='
    url_filter = '&sortBy=TraderRelevance&filter=SoldBy(Woolworths)'

    return url_query_start + url_page_num + str(page_count) + url_filter

def class_to_css(classes: str):
    return classes.replace(' ', '.', len(classes))

def print_loading_bar(current_page_str: str, final_page_str: str):

    current_page = int(current_page_str)
    final_page = int(final_page_str)

    max_size = 60
    clip_factor = max_size/final_page

    limit = lambda number: math.ceil(number * clip_factor)

    if final_page > max_size:
        current_page = limit(current_page)
        final_page = limit(final_page)

    bold = lambda string: f'\033[1m{string}\033[0m'
    close = lambda string:\
        f'{bold("[")} {string} {bold("]")}'

    progress = bold('>' * current_page)
    remaining = '-' * (final_page - current_page)

    loading_bar = close(progress + remaining)
    progress_fraction = bold(
        f'{int(current_page_str)}/{int(final_page_str)}')

    print(f'\r\t{loading_bar} {progress_fraction}', end='', flush=True)

def get_woolworths_catalogue():

    # Selenium documentation
    #   https://www.selenium.dev/documentation/
    #   https://selenium-python.readthedocs.io/index.html

    options = Options() 
    options.add_argument("--headless=new") # Opens selenium in the background

    driver = webdriver.Chrome(options=options)

    wait = WebDriverWait(driver, timeout=15, poll_frequency=.5)

    page_count = 1

    toggled_in_stock = False

    catagory_title_class = 'browseContainer-title ng-star-inserted'

    instock_xpath = '//*[@id="search-content"]/div/wow-chip-container[2]/ul/li[3]/wow-filter-chip/button'

    catalogue = []

    total_page_count = 0
    total_item_count = 0

    specials_link = 'https://www.woolworths.com.au/shop/browse/specials/prices-dropped'
    half_price_link = 'https://www.woolworths.com.au/shop/browse/specials/half-price'

    links = [
        specials_link,
        half_price_link,
    ]

    # Pre scrapin setup, goes through each link/catagory
    for link in links:

        # The 'In stock' filter needs to be manually clicked
        if not toggled_in_stock:

            print('\nAdding instock filter...', end='', flush=True)

            driver.get(link)
            
            instock_button = wait.until(
                EC.presence_of_element_located((By.XPATH, instock_xpath))
            )

            instock_button.click()

            toggled_in_stock = True

            print('Done!\n', flush=True)
            
        # Creating the catagory
        print('Creating catagory: ', end='', flush=True)

        driver.get(link + get_url_params(1))
        time.sleep(1)

        soup = BeautifulSoup(driver.page_source, 'lxml')
        catagory_name = soup.find(attrs={'class':catagory_title_class}).get_text()
        catagory_name = catagory_name[1:len(catagory_name) - 1]
        catagory = Catagory(catagory_name, link)

        print(f'{catagory_name}', end='\n\n', flush=True)

        page_count = 0
        item_count = 0

        # Getting the total pages in search
        total_pages = driver.find_element(By.CSS_SELECTOR, 'span.page-count').text

        # Here we're going to parse n' scrape the pages
        while True:
            
            driver.get(link + get_url_params(page_count + 1))

            # Printing loading screen
            print_loading_bar(page_count, total_pages)
            #if page_count % 2 == 0: print('>', end='', flush=True)

            item_elements = []

            # https://github.com/sukgu/pyshadow/tree/master#pyshadow
            shadow_driver = Shadow(driver)

            # Checking for items cards on page
            try:
                wait.until(
                    EC.presence_of_all_elements_located((
                        By.CSS_SELECTOR, 
                        '.ng-star-inserted>wc-product-tile.ng-star-inserted'
                    ))
                )
            except TimeoutException:
                print('Waiting for item cards failed!')

            # Break if last page is reached
            try:
                driver.find_element(By.CSS_SELECTOR, 'div.zero-filter-results')
                break
            except NoSuchElementException:
                pass

            # Getting list of items
            item_elements = shadow_driver.find_elements(
                'div.ng-tns-c106-3.product-grid-v2--tile.ng-star-inserted')


            # Scrpaing specific items from current page
            for item_element in item_elements:

                try:
                    element_name = shadow_driver.find_element(
                        item_element, 
                        'section>div.product-title-container>div.title>a'
                    )

                    element_link = shadow_driver.find_element(
                        item_element, 
                        'section>div.product-title-container>div.title>a'
                    )

                    # Specials old price element
                    try:
                        element_old_price = shadow_driver.find_element(
                            item_element, 
                            'div.product-tile-promo-info>div.html-content>span'
                        )
                    # Half price old price element
                    except:
                        element_old_price = shadow_driver.find_element(
                            item_element, 
                            'section>div.product-information-container>div>div>div.secondary>span.was-price'
                        )

                    element_new_price = shadow_driver.find_element(
                        item_element, 
                        'section>div.product-information-container>div>div>div.primary'
                    )

                except JavascriptException: 
                    continue

                item_new_price = parse_price(element_new_price.text)

                item_old_price = element_old_price.text
                # Some price drops do not clearly state how much they were
                if (item_old_price.find('$') != -1):
                    item_old_price = parse_price(item_old_price)
                    item_old_price = item_old_price[:item_old_price.find(' ')]
                else:
                    continue

                item_name = element_name.text
                item_name = item_name[:len(item_name)]

                item_link = element_link.get_attribute('href')

                catagory.add_item(Item(
                    item_name,
                    item_old_price,
                    item_new_price,
                    item_link
                ))

                item_count += 1
                total_item_count += 1

            page_count += 1
            total_page_count += 1

        catalogue.append(catagory)

        print(f'\n\n\tItem count: {item_count}')
        print(f'\tPage count: {page_count}\n')

    print(f'Total item count: {total_item_count}')
    print(f'Total page count: {total_page_count}')

    write_catalogue_to_csv(catalogue, './woolies_catalogue')
    print(f'Data written to ./woolies_catalogue! :)')

    driver.quit()

print(sys.argv)
isBoth = len(sys.argv) == 1
isColes = False
isWoolies = False

if not isBoth:
    if sys.argv[1] == 'c': isColes = True
    if sys.argv[1] == 'w': isWoolies = True

if isBoth or isColes:
    get_coles_catalogue()
if isBoth or isWoolies:
    get_woolworths_catalogue()
