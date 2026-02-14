# Frontend Production Guide

## 1) 환경변수
- `NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api/v1`

## 2) 배포
```bash
cd research-mate-front
export GCP_PROJECT=YOUR_PROJECT
export REGION=asia-northeast3
export NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api/v1
./deploy/deploy-cloud-run.sh
```

## 3) 배포 후 체크
- `/subject`에서 추천 요청 성공
- `/topic-confirm` 재추천/확정 동작
- `/report/[id]` 폴링/편집/채팅 동작
- `/my-reports` 목록 조회 동작
