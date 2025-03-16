from db import import_data_to_sqlite, db_search
from code.app import extract_req_test, match_product_test

import_data_to_sqlite()

text = "We need 12 laptop with atleast 512GB storage with extensive certified security features and a camera shutter. As well as same amount of Monitors with atleast one HDMI port as input."
req = extract_req_test(text)
print(match_product_test(req))


