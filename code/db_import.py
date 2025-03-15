import json
import psycopg2
import psycopg2.extras


def import_data_to_postgres():
    conn = psycopg2.connect("dbname=corporate_sales")
    cur = conn.cursor()

    cur.execute("""
                
    DROP TABLE IF EXISTS products;
    CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        category VARCHAR(255),
        price INTEGER,
        brand VARCHAR(255),
        model_name VARCHAR(255),
        model_id VARCHAR(255),
        specs JSONB
    )
    """)

    with open('res/db_laptops2.json', 'r') as file:
        data = json.load(file)

    if data:
        for item in data:
            cur.execute(
                "INSERT INTO products (category, price, brand, model_name, model_id, specs) VALUES (%s, %s, %s, %s, %s, %s)",
                (item.get('category'), item.get('price'), item.get('brand'), item.get('model_name'), item.get('model_id'),
                 json.dumps(item.get('specs', {})))
            )
        print(f"Imported {len(data)} items in PostgreSQL.")
    else:
        print("Data not found")

    cur.execute("""
    CREATE INDEX IF NOT EXISTS idx_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_specs ON products USING GIN(specs);
    """)

    cur.execute("SELECT COUNT(*) FROM products")
    count = cur.fetchone()[0]
    print(f"There are {count} lines in DB now")

    conn.commit()
    cur.close()
    conn.close()


if __name__ == "__main__":
    import_data_to_postgres()
