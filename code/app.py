from flask import Flask, request, jsonify
import json
import sqlite3
from llm import LLM
from db import db_search, import_data_to_sqlite, db_get_by_id
from flask_cors import CORS
import os
from dotenv import load_dotenv, dotenv_values

model = 'Qwen/Qwen2.5-72B-Instruct'

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Set default MIME type for all responses to application/json
@app.after_request
def add_header(response):
    response.headers['Content-Type'] = 'application/json'
    return response

load_dotenv()
key = os.getenv('API_KEY')
llm = LLM(key, model)


@app.route('/extract-req', methods=['POST'])
def extract_req():
    data = request.json
    input_txt = data.get('input')
    if not input_txt:
        return {'error': 'Input text is required'}, 400
    llm_response = llm.parse_input(input_txt)
    return llm_response, 200

@app.route('/match-product', methods=['POST'])
def match_product():
    data = request.json
    requirements = data.get('requirements')
    if not requirements:
        return {'error': 'Requirements are needed'}, 400
    
    picked_items = []

    for item in requirements:
        print(item)
        search_res = db_search(item)
        for res in search_res:
           add_spec = item['specs'].get('add_spec', None)
           res['specs'] = json.loads(res['specs'])
           if add_spec:
                if not check_additional_specs(add_spec, res):
                     continue
                picked_items.append(res)
                break
    return picked_items, 200

@app.route('/gen-email', methods=['POST'])
def generate_email():
    data = request.json
    item_id = data.get('item_id')
    if not item_id:
        return {'error': 'Requirements are needed'}, 400
    item = db_get_by_id(item_id)
    print(item)
    email = item["email"]
    email_content = llm.gen_email(item)
    email_subject = f"RFQ for {item["model_name"]} for tender"
    return {"email": email, "subject": email_subject, "content": email_content}, 200


def check_additional_specs(add_spec, item):
    spec_file_path = 'res/specs/{}.md'.format(item['category'] + '_' + item['model_id'])
    spec_file = open(spec_file_path, 'r')
    spec_sheet = spec_file.read()
    spec_file.close()
    response = llm.check_add_spec_req(add_spec, spec_sheet)
    return response


if __name__ == '__main__':
    import_data_to_sqlite()
    app.run(debug=True, host='0.0.0.0', port=3001)
