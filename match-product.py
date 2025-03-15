from flask import Flask, request, jsonify
import json
import psycopg2
import psycopg2.extras

app = Flask(__name__)


@app.route('/matchProduct', methods=['POST'])
def match_product():
    data = request.json
    query = data.get('query')
    if not query:
        return jsonify({'error': 'Query is required'}), 400

    best_choice = find_best_choice(query, methods)

    return jsonify(best_choice)


# if __name__ == '__main__':
#     app.run(debug=True)


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
    conn = psycopg2.connect("dbname=corporate_sales")
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    query = "SELECT * FROM products WHERE 1=1"
    params = []

    if 'category' in item:
        query += " AND category = %s"
        params.append(item['category'])

    if 'specs' in item and isinstance(item['specs'], dict):
        for key, value in item['specs'].items():
            query += f" AND specs->>%s = %s"
            params.extend([key, value])

    print(cur.mogrify(query, params).decode('utf-8'))

    cur.execute(query, params)
    matching_items = cur.fetchall()

    result = []
    for row in matching_items:
        item_dict = dict(row)
        if 'id' in item_dict:
            del item_dict['id']
        result.append(item_dict)

    print(f"Found: {len(result)} items")
    print(result)

    cur.close()
    conn.close()

    return result


with open('sample-item.json', 'r') as f:
    sample_item = json.load(f)

test_item = sample_item

matching_items = db_search(test_item)
print(matching_items)


def check_additional_specs(query, item):
    # returns True/False if the additional specs match the item

    return None


def spec_sheet_checker(query: dict):
    # performs additional checks on DBSearch

    return None
