from code.llm import LLM

key="rc_f8cf96bf43de3fde06f99a693f4d11e32d0c68a3bf3b7cdcaf851efec169d0b8"
model = 'Qwen/Qwen2.5-72B-Instruct'

llm = LLM(key, model)

text = "Our Company needs to buy 10 Monitors with 32 inch diagonal and the same number of macbooks 15.6 inch, as well as 12 new desks to supply our new coworkers. Addiotonally laptops should be preferably black"

print(llm.parse_input(text))
