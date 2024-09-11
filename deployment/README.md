# Deploy the project IBM Power in OpenShift

> The backend route is just for debugging purpose. The service is sufficient for internal namespace/project communication.

## Step 0: Clone repo, connect to OCP cluster & create brief-builder project

```bash
git clone https://github.com/mgiessing/brief-builder && cd brief-builder

oc login <TOKEN>

oc new-project brief-builder --display-name 'Brief Builder using IBM Power10'
```

## Step 1: Deploy an inference service

### Option A: llama.cpp

> Llama.cpp is preferred for single user / single batch and has tremendous performance for this setup

```bash
cd deployment

oc apply -f llama.cpp

# Watch until pod is up and running
oc get pods -w
```

### Option B: vLLM

> vLLM is preferred for multiple users and smaller models as it has by far the best scalability 

```bash
cd deployment

oc apply -f vllm

# Watch until pod is up and running
oc get pods -w
```

## Step 2: Create backend s2i configuration

The default backend configured in `backend/.s2i/environment` is llama.cpp.

```bash
oc new-app --name=backend \
  --context-dir=backend \
  python:3.9-ubi9~https://github.com/mgiessing/brief-builder.git \
  --strategy=source

# Just for debugging - we actually use the backend through the frontend
oc create route edge backend --service=backend

```

> INFO: If you want to change the backend later you can do so by <br>`
oc set env deploy/backend INFERENCE_BASE_URL=http://vllm-cpu:8080/v1`

## Step 3: Create frontend s2i configuration

```bash
oc new-app --name=frontend \
  --context-dir=frontend \
  registry.access.redhat.com/ubi9/nodejs-18~https://github.com/mgiessing/brief-builder.git \
  --strategy=source

oc create route edge frontend --service=frontend
```