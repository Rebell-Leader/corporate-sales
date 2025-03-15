from llm import LLM

key = "rc_f8cf96bf43de3fde06f99a693f4d11e32d0c68a3bf3b7cdcaf851efec169d0b8"
model = 'Qwen/Qwen2.5-14B-Instruct'

llm = LLM(key, model)

messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello!"}
]

print(llm.send_messages(messages))
