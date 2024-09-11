import asyncio
import os
import uvicorn
import logging
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from openai import OpenAI, OpenAIError

load_dotenv()

logging.basicConfig(level=logging.INFO)  # Set the logging level
logger = logging.getLogger(__name__)  # Create a logger instance

app = FastAPI()

BASE_URL = os.getenv('INFERENCE_BASE_URL', 'http://127.0.0.1:8000/v1')

logger.info(f"Inference API URL: {BASE_URL}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this to your frontend's URL in production
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class OpenAIRequest(BaseModel):
    prompt: str
    max_tokens: int = 500

client = OpenAI(
    api_key="EMPTY",
    base_url=BASE_URL,
)

@app.get("/models")
def get_models() -> list:
    models = client.models.list()
    model_list = [model.id for model in models]
    return model_list


@app.post("/completion")
async def completion(request: OpenAIRequest):
    try:
        response = client.chat.completions.create(
            model=get_models()[0], #get first model
            messages=[{"role": "user", "content": request.prompt}],
            max_tokens=request.max_tokens,
            stream=False
        )

        return response.choices[0].message.content

    except OpenAIError as e:
        return f"Error: {str(e)}"

@app.post("/stream")
async def stream(request: OpenAIRequest):
    async def stream_response(prompt: str, max_tokens: int):
        try:
            response = client.chat.completions.create(
                model=get_models()[0],  #get first model
                messages=[{"role": "user", "content": prompt}],
                max_tokens=max_tokens,
                stream=True
            )

            for chunk in response:
                content = chunk.choices[0].delta.content
                if content is not None: 
                    print(content, end="", flush=True)
                    yield content
                    await asyncio.sleep(0)

        except OpenAIError as e:
            yield f"Error: {str(e)}"

    return StreamingResponse(stream_response(request.prompt, request.max_tokens), media_type="text/event-stream")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)

