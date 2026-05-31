import os
from google import genai
from google.genai import types
from app.core.config import settings

class GeminiClient:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        if not self.api_key or self.api_key == "your_gemini_api_key_here":
            print("[Warning] GEMINI_API_KEY not properly set in .env")
            self.client = None
        else:
            self.client = genai.Client(api_key=self.api_key)
            self.model_name = "gemini-2.5-flash"

    def ask_llm(self, prompt: str, system_instruction: str = None) -> str:
        """
        Sends a query to Gemini 2.5 Flash and returns the text response.
        """
        if not self.client:
            return "Error: Gemini Client not initialized due to missing API key."
            
        try:
            kwargs = {}
            if system_instruction:
                kwargs["config"] = types.GenerateContentConfig(system_instruction=system_instruction)
                
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                **kwargs
            )
            return response.text
        except Exception as e:
            return f"Error communicating with Gemini: {str(e)}"

    def generate_summary(self, data: str) -> str:
        system_instruction = "You are a concise retail analytics assistant. Summarize the provided data accurately."
        prompt = f"Please summarize the following retail data:\n{data}"
        return self.ask_llm(prompt, system_instruction)

    def generate_recommendation(self, analytics_context: str) -> str:
        system_instruction = "You are an expert retail store manager. Provide exactly one strong, actionable recommendation based on the data. Do not hallucinate."
        prompt = f"Based on this data, what is the best operational recommendation?\n{analytics_context}"
        return self.ask_llm(prompt, system_instruction)
