from flask import Flask, request, jsonify
import json

app = Flask(__name__)


@app.route('/matchProduct', methods=['POST'])
def match_product():
    data = request.json
    query = data.get('query')
    if not query:
        return jsonify({'error': 'Query is required'}), 400

    methods = get_all_methods()
    best_choice = find_best_choice(query, methods)

    return jsonify(best_choice)


if __name__ == '__main__':
    app.run(debug=True)


def get_text(query: str):
    return None


def get_feature(query: str):
    # construct specs dictionary from the query

    # structure:
    # { 'query' : <full text of query>,
    #   'category' : monitor/laptop,
    #    'specs' : {
    #       'screen' : ...,
    #       'monitor' : ...
    #     }
    # }

    return None


def db_search(item: dict):
    # returns search on basic specs

    with open('db.json', 'r') as file:
        lst = json.load(file)

    print(lst)
    matching_items = []
    for db_item in lst:
        if all(item.get(key) == db_item.get(key) for key in item):
            matching_items.append(db_item)

    return matching_items


with open('sample-item.json', 'r') as file:
    item = json.load(file)

matching_items = db_search(item)
print(json.dumps(matching_items, indent=4))


def check_additional_specs(query, item):
    # returns True/False if the additional specs match the item

    return None


def spec_sheet_checker(query: dict):
    # performs additional checks on DBSearch

    return None
