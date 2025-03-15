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
        specs JSONB
    )
    """)

    with open('db.json', 'r') as file:
        data = json.load(file)

    if data:
        for item in data:
            cur.execute(
                "INSERT INTO products (category, price, specs) VALUES (%s, %s, %s)",
                (item.get('category'), item.get('price'),
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
