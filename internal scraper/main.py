import concurrent.futures
from urllib.parse import urlparse
from bs4 import BeautifulSoup
import re
import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.by import By
import time
from urllib.parse import urljoin, urlparse
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")

cookies = [
    {'name': 'cookie_consent', 'value': 'true',
        'domain': '.microharvest.com', 'path': '/'},
]


def is_internal_link(base_url: str, link_url: str) -> bool:
    base_domain = urlparse(base_url).netloc
    link_domain = urlparse(link_url).netloc
    return base_domain == link_domain or not link_domain


def extract_linkedin_link(soup):
    """Extract LinkedIn link from BeautifulSoup object"""
    linkedin_links = []
    for a in soup.find_all('a', href=True):
        if a['href'].startswith('https://www.linkedin.com/'):
            linkedin_links.append(a['href'])
    return linkedin_links[0] if linkedin_links else None


def scrape_internal_links(link: str) -> list[str]:

    d = webdriver.Chrome(service=Service(
        ChromeDriverManager().install()), options=chrome_options)
    d.get(link)

    for cookie in cookies:
        try:
            d.add_cookie(cookie)
        except Exception as e:
            print(f"Error adding cookie: {e}")

    d.refresh()

    all_links = set()
    depth1_links = set()
    elements = d.find_elements(By.TAG_NAME, "a")
    for el in elements:
        href = el.get_attribute("href")
        if href and is_internal_link(link, href) and href.startswith('http'):
            depth1_links.add(href)
            all_links.add(href)

    print(f"Found {len(depth1_links)} internal links at depth 1")
    depth2_links = set()
    # for page_link in depth1_links:
    #     try:
    #         d.get(page_link)
    #         time.sleep(1)
    #         page_elements = d.find_elements(By.TAG_NAME, "a")
    #         for el in page_elements:
    #             href = el.get_attribute("href")
    #             if href and is_internal_link(link, href) and href.startswith('http'):
    #                 depth2_links.add(href)
    #                 all_links.add(href)
    #     except Exception as e:
    #         print(f"Error accessing {page_link}: {e}")

    print(f"Total unique internal links: {len(all_links)}")
    print(all_links)
    return list(all_links)


def extract_email(text) -> str:
    """Extract email addresses from text using regex"""
    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    return re.findall(email_pattern, text)


def get_page_content(url):
    """Get page content and extract text, emails, and LinkedIn links"""
    try:
        d1 = webdriver.Chrome(service=Service(
            ChromeDriverManager().install()), options=chrome_options)

        d1.get(url)
        soup = BeautifulSoup(d1.page_source, 'html.parser')

        # Extract text content
        text_content = soup.get_text(separator=' ', strip=True)

        # Find emails
        emails = extract_email(text_content)

        # Find LinkedIn link
        linkedin_link = None
        for a in d1.find_elements(By.TAG_NAME, "a"):
            href = a.get_attribute("href")
            if href and href.startswith('https://www.linkedin.com/'):
                linkedin_link = href
                break

        d1.close()

        return {
            'url': url,
            'emails': emails,
            'linkedin': linkedin_link,
            'content': text_content
        }
    except Exception as e:
        return {
            'url': url,
            'emails': [],
            'linkedin': None,
            'content': ''
        }


def get_emails_and_linkedin(internal_list: list[str]) -> tuple:
    results = []
    all_emails = []
    linkedin_link = None

    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        future_to_url = {executor.submit(
            get_page_content, url): url for url in internal_list}
        for future in concurrent.futures.as_completed(future_to_url):
            url = future_to_url[future]
            try:
                data = future.result()
                results.append(data)
                if data['emails']:
                    all_emails.extend(data['emails'])

                if not linkedin_link and data['linkedin']:
                    linkedin_link = data['linkedin']

            except Exception as e:
                results.append({
                    'url': url,
                    'emails': [],
                    'linkedin': None,
                    'content': ''
                })

    unique_emails = list(set(all_emails))
    print(f'Found {len(unique_emails)} unique emails')
    print(f'LinkedIn link: {linkedin_link}')
    return (results, unique_emails, linkedin_link)


def run(link: str):
    internal_list = scrape_internal_links(link)

    results, emails, linkedin = get_emails_and_linkedin(internal_list)
    print(results)
    print(emails)
    print(f"LinkedIn: {linkedin}")
    with open("borys.txt", "w") as f:
        f.write('\n'.join(list(filter(lambda x: x.strip() != '',
                list(map(lambda x: x['content'], results))))))

    return (results, emails, linkedin)


run('https://microharvest.com')
