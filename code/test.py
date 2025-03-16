from db import import_data_to_sqlite, db_search
from productMatcher import extract_req_test, match_product_test

import_data_to_sqlite()

text = "I need a laptop with atleast 512GB storage with extensive certified security features and a camera shutter"
req = extract_req_test(text)
print(match_product_test(req))


