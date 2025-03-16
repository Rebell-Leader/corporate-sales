from flask import Flask, request, jsonify
import json
import sqlite3
from llm import LLM
from db import db_search

key="rc_f8cf96bf43de3fde06f99a693f4d11e32d0c68a3bf3b7cdcaf851efec169d0b8"
model = 'Qwen/Qwen2.5-72B-Instruct'

app = Flask(__name__)

llm = LLM(key, model)

# @app.route('/matchProduct', methods=['POST'])
# def match_product():
#     data = request.json
#     query = data.get('query')
#     if not query:
#         return jsonify({'error': 'Query is required'}), 400
#     result = match_product(query)
#     pass

@app.route('/extract-req', methods=['POST'])
def extract_req():
    data = request.json
    input_txt = data.get('input')
    if not input_txt:
        return jsonify({'error': 'Input text is required'})
    llm_response = llm.parse_input(input_txt)
    return llm_response, 200

def extract_req_test(input_txt):
    if not input_txt:
        return jsonify({'error': 'Input text is required'})
    llm_response = llm.parse_input(input_txt)
    return llm_response

@app.route('/match-product', methods=['POST'])
def match_product():
    data = request.json
    requirements = data.get('requirements')
    if not requirements:
        return jsonify({'error': 'Requirements are needed'})
    
    picked_items = []

    for item in requirements:
        print(item)
        search_res = db_search(item)
        for res in search_res:
           add_spec = item['specs'].get('add_spec', None)
           if add_spec:
                if not check_additional_specs(add_spec, res):
                     continue
                picked_items.append(res)
                break
    return picked_items

def match_product_test(requirements):
    if not requirements:
        return jsonify({'error': 'Requirements are needed'})
    
    picked_items = []

    for item in requirements:
        print(item)
        search_res = db_search(item)
        for res in search_res:
           add_spec = item['specs'].get('add_spec', None)
           if add_spec:
                if not check_additional_specs(add_spec, res):
                     continue
                picked_items.append(res)
                break
    return picked_items

def check_additional_specs(add_spec, item):
    spec_file_path = 'res/specs/{}.md'.format(item['category'] + '_' + item['model_id'])
    spec_file = open(spec_file_path, 'r')
    spec_sheet = spec_file.read()
    spec_file.close()
    response = llm.check_add_spec_req(add_spec, spec_sheet)
    return response

