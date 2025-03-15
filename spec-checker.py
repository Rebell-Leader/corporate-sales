import json


def calculate_similarity_score(query: dict, item: dict):
    # Returns similarity score between the query and the item in the list
    # based on their specs

    return None


def db_search(item: dict):
    # returns search on basic specs

    with open('db.json', 'r') as file:
        lst = json.load(file)

    print(lst)
    return None


db_search(None)


def check_additional_specs(query, item):
    # returns True/False if the additional specs match the item

    return None


def spec_sheet_checker(query: dict):
    # performs additional checks on DBSearch

    return None
