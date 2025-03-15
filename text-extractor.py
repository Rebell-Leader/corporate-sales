from flask import Flask, request, jsonify
from spec_checker import get_all_methods, find_best_choice

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
