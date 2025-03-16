import json
import sqlite3

def import_data_to_sqlite():
    conn = sqlite3.connect("corporate_sales.db")
    cur = conn.cursor()

    cur.execute("DROP TABLE IF EXISTS products")
    cur.execute("""
        CREATE TABLE products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT,
            price INTEGER,
            email TEXT,
            brand TEXT,
            model_name TEXT,
            model_id TEXT,
            specs TEXT
        )
    """)

    with open('res/product_db.json', 'r') as file:
        data = json.load(file)

    if data:
        for item in data:
            cur.execute(
                "INSERT INTO products (category, price, email, brand, model_name, model_id, specs) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (item.get('category'), item.get('price'), item.get('email'), item.get('brand'), item.get('model_name'), item.get('model_id'),
                 json.dumps(item.get('specs', {})))
            )
        print(f"Imported {len(data)} items into SQLite.")
    else:
        print("Data not found")

    cur.execute("SELECT COUNT(*) FROM products")
    count = cur.fetchone()[0]
    print(f"There are {count} lines in DB now")

    conn.commit()
    cur.close()
    conn.close()

def db_get_by_id(item_id: int):
    conn = sqlite3.connect("corporate_sales.db")
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    query = "SELECT id, category, price, brand, model_name, model_id, specs FROM products WHERE id = ?"
    params = [item_id]

    cur.execute(query, params)
    matching_items = cur.fetchall()

    result = []
    for row in matching_items:
        row_dict = dict(row)
        if 'id' in row_dict:
            del row_dict['id']
        result.append(row_dict)

    cur.close()
    conn.close()
    return result[0]

def db_search(item: dict):
    conn = sqlite3.connect("corporate_sales.db")
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    query = "SELECT id, category, price, brand, model_name, model_id, specs FROM products WHERE 1=1"
    params = []

    if 'category' in item:
        query += " AND category = ?"
        params.append(item['category'])

    if 'brand' in item:
        query += " AND brand = ?"
        params.append(item['brand'])

    if 'model_name' in item:
        query += " AND model_name = ?"
        params.append(item['model_name'])

    if 'specs' in item and isinstance(item['specs'], dict):
        for spec_key, value in item['specs'].items():
            if spec_key == 'add_spec':
                continue

            if isinstance(value, (int, float)):
                query += " AND CAST(json_extract(specs, '$.' || ?) AS REAL) = ?"
            else:
                query += " AND json_extract(specs, '$.' || ?) = ?"
            params.extend([spec_key, str(value)])

    query += " ORDER BY price ASC"
    cur.execute(query, params)
    matching_items = cur.fetchall()

    result = []
    for row in matching_items:
        row_dict = dict(row)
        # if 'id' in row_dict:
        #     del row_dict['id']
        result.append(row_dict)

    cur.close()
    conn.close()
    return result