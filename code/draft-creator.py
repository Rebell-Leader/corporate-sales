from flask import app, request, jsonify


@app.route('/generateDraft', methods=['POST'])
def generate_draft_endpoint():
    data = request.get_json()
    product = data.get('product')
    RFQ = data.get('RFQ')
    quantity = data.get('quantity')
    draft = generate_draft(product, RFQ, quantity)
    return jsonify({'draft': draft})


def generate_draft(product, RFQ, quantity):
    # generate email with the given attributes
    return None


if __name__ == '__main__':
    app.run(debug=True)
