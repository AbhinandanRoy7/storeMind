import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.api.copilot import chat_with_copilot, ChatRequest

def main():
    try:
        req = ChatRequest(query="Why is conversion down?")
        res = chat_with_copilot(req)
        print("Copilot Response:")
        print(res)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    main()
