# Brief Builder using IBM Power10

This repository contains the components to deploy a brief builder using IBM Power10 inferencing. The frontend is built using Svelte and the Carbon Design System + a FastAPI backend to route the requests to the inference engine.

## Setup for local development

Clone the repository

```bash
git clone https://github.com/mgiessing/brief-builder && cd brief-builder
```

### Inference engine setup

We will be using the vLLM inference engine that is also the core of the official IBM watsonx.ai technology.
However, you can use any inference engine that provides an OpenAI compatible server (e.g. llama.cpp)

Make sure to run this on a Power10 system

```
export MODEL="TinyLlama/TinyLlama-1.1B-Chat-v1.0"

podman run -ti --rm \
  -p 8000:8000 \
  --ipc=host quay.io/mgiessing/vllm:v0.5.3.post1-cpu \
  --dtype=bfloat16 \
  --model=${MODEL}
```

### Backend setup

Copy the `.env.example` into `.env` and fill the `INFERENCE_BASE_URL`. 
The URL is where you've deployed the vLLM server.

#### a) local

```bash
cd backend
cp .env.example .env

pip3 install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend setup

Copy the `.env.example` into `.env` and fill the `VITE_BACKEND_BASE_URL`

#### local

```bash
cd frontend
cp .env.example .env

npm install
npm run dev
```

## Setup for containerized development

Create a pod network for communication

```bash
podman pod create --name brief-builder -p 8080:8080 -p 3000:3000
```

### a) Backend

```bash
cd backend
podman build -t brief-builder-backend .
podman run -ti --rm --pod brief-builder -e INFERENCE_BASE_URL=http://<IP>:<PORT>/v1 brief-builder-backend 
#point to your Inference engine backend
```

### b) Frontend

```bash
cd frontend
cp .env.example .env
podman build -t brief-builder-frontend .
podman run -ti --rm --pod brief-builder brief-builder-frontend
```


## Deploy in OpenShift

Have a look [deployment](deployment/README.md)