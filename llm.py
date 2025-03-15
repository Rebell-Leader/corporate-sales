from openai import OpenAI
import time
import json

PARSE_CAT_QUANTITY_CONTEXT_PROMPT = """You are a parser. Extract the 'monitor' and 'laptop' categories and their quantities from the user's request. Output as a JSON list of objects: 
[{"category": "<cat_name>", "quantity": <number>}]."""

PARSE_SPEC_CONTEXT_PROMPT = {
"monitor":
    """You are a parser. Extract any monitor specifications from the user’s text (resolution_horizontal, resolution_vertical, refreshrate, diagonal ,matrix_type). Output as a JSON dictionary with the following fields:
    {
        "res_hor": <horizontal resolution if mentioned>,
        "res_ver": <vertical resolution if mentioned>,
        "refreshrate": <refreshrate if mentioned>,
        "type": <matrix type if mentioned>,
        "diagonal": <diagonal size in inch if mentioned, just the number>,
        "add_spec": <any other specs mentioned>
    }
    Only include a field if it was mentioned in the text. DO NOT ouput in .md format""",
"laptop": 
    """You are a parser. Extract any laptop specifications from the user’s text (resolution_horizontal, resolution_vertical, refreshrate, matrix_type, diagonal, ram_size, storage_size, gpu, cpu, battery, operating system). If laptop is an apple product, set operating system to be MacOS. Output as a JSON dictionary with the following fields:
    {
        "res_hor": <horizontal resolution if mentioned>,
        "res_ver": <vertical resolution if mentioned>,
        "refreshrate": <refreshrate if mentioned>,
        "type": <matrix type if mentioned>,
        "diagonal": <diagonal size in inch if mentioned, just the number>,
        "ram_size": <RAM size if mentioned, just the number>,
        "storage_size": <storage size if mentioned, just the number>,
        "gpu": <GPU name if mentioned>,
        "cpu": <CPU name if mentioned>,
        "battery": <battery size in Wh if mentioned, just the number>,
        "op_sys": <OS name if mentioned>,
        "add_spec": <any other specs not covered above>
    }
    Only include a field if it was mentioned in the text. DO NOT ouput in .md format"""
}

COMPARE_ADD_SPEC_CONTEXT_PROMPT = """You are a parser. Compare the user's request for additional specifications to the specifications in the spec sheet. Input is a string that describes additional specification. Output a JSON dictionary with the following fields:
{
    "satisfied": <true if all additional specs are in the spec sheet, false otherwise>,
    "missing": <list of additional specs that are not in the spec sheet>
}
Only include a field if it was mentioned in the text. DO NOT ouput in .md format. Here is a content of the spec sheet: \n"""


class LLM:
    def __init__(self, api_key, model, base_url="https://api.featherless.ai/v1"):
        self.client = OpenAI(base_url=base_url, api_key=api_key)
        self.model = model

    def send_request_raw_response(self, sys_context, user_message):
        print("| Request sent")
        start_time = time.time()
        msg = [
            {"role": "system", "content": sys_context},
            {"role": "user", "content": user_message}
        ]
        response = self.client.chat.completions.create(
            temperature=0.3,
            model=self.model,
            messages=msg
        )
        elapsed_time = time.time() - start_time
        print("| Request recieved, time elapsed: ", elapsed_time)
        return response.model_dump()

    def send_request(self, sys_context, user_message):
        return self.send_request_raw_response(sys_context, user_message)['choices'][0]['message']['content']

    def parse_category(self, input : str):
        response = self.send_request(PARSE_CAT_QUANTITY_CONTEXT_PROMPT, input)
        return response

    def parse_specification(self, category : str, input : str):
        response = self.send_request(PARSE_SPEC_CONTEXT_PROMPT[category], input)
        return response
    
    def __conv_to_json(self, input : str):
        if input.startswith("```"):
            return json.loads(input[7:-3])
        return json.loads(input)
    
    
    def parse_input(self, input : str):
        cats = self.parse_category(input)
        parsed = self.__conv_to_json(cats)
        print("Categories: \n", parsed)
        for c in parsed:
            details = self.parse_specification(c["category"], input)
            parsed_details = self.__conv_to_json(details)
            if len(parsed_details) == 0:
                print(f"No details found for {c['category']}")
                c["specs"] = {}
            else:
                print(f"Details for {c['category']}: \n", parsed_details)
                c["specs"] = parsed_details
        return parsed
        
    def compare_add_spec_req(self, add_spec : str, spec_sheet : str):
        response = self.send_request(COMPARE_ADD_SPEC_CONTEXT_PROMPT + spec_sheet, add_spec)
        parsed = self.__conv_to_json(response)
        if parsed["satisfied"]:
            print("All additional specs are in the spec sheet")
        else:
            print("Some additional specs are not in the spec sheet: ", parsed["missing"])
        pass
