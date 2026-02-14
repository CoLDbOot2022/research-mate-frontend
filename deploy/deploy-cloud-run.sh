#!/usr/bin/env bash
set -euo pipefail

: "${GCP_PROJECT:?GCP_PROJECT is required}"
: "${REGION:?REGION is required}"
: "${SERVICE_NAME:=research-mate-front}"
: "${NEXT_PUBLIC_API_URL:?NEXT_PUBLIC_API_URL is required}"  # https://api.example.com/api/v1

IMAGE="gcr.io/${GCP_PROJECT}/${SERVICE_NAME}:$(date +%Y%m%d-%H%M%S)"

gcloud builds submit --project "$GCP_PROJECT" --tag "$IMAGE" .

gcloud run deploy "$SERVICE_NAME" \
  --project "$GCP_PROJECT" \
  --region "$REGION" \
  --platform managed \
  --image "$IMAGE" \
  --allow-unauthenticated \
  --port 3000 \
  --cpu 1 \
  --memory 1Gi \
  --max-instances 20 \
  --set-env-vars "NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}"

echo "Deployed: ${SERVICE_NAME}"
