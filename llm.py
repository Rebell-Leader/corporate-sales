from openai import OpenAI
import time

class LLM:
    def __init__(self, api_key, model, base_url="https://api.featherless.ai/v1"):
        self.client = OpenAI(base_url=base_url, api_key=api_key)
        self.model = model

    def send_messages(self, msgs):
        print("| Request sent")
        start_time = time.time()
        response = self.client.chat.completions.create(
            model=self.model,
            messages=msgs
        )
        elapsed_time = time.time() - start_time
        print("| Request recieved, time elapsed: ", elapsed_time)
        return response.model_dump()
    
