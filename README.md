# mini-blog

Mini blog uygulamasi. Frontend (Next.js + React) ve backend (NestJS + Prisma) ile PostgreSQL kullanir.

## Gereksinimler
- Node.js 20+ ve npm
- Docker (opsiyonel, en kolay yol)
- Docker kullanilmazsa PostgreSQL 16+
- 3000/4000/5432 portlari bos olmali

## Hizli Baslat (Docker Compose)
1) `docker compose up --build`
2) Ilk kurulumda migration calistir:
   `docker compose exec backend npx prisma migrate deploy`
3) Uygulamalar:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000

Not: Docker Compose backend icin `backend/.env` dosyasini okur. Uretimde secret degerlerini degistir.

## Lokal Kurulum (Docker kullanmadan)
1) Postgres calistir ve `miniblog` veritabanini olustur.
2) Backend:
   - `cd backend`
   - `npm install`
   - `backend/.env.example` -> `backend/.env` kopyala
   - `npx prisma generate`
   - `npx prisma migrate dev`
   - `npm run start:dev`
3) Frontend:
   - `cd frontend`
   - `npm install`
   - `frontend/.env.example` -> `frontend/.env.local` kopyala
   - `npm run dev`
4) Tarayicida http://localhost:3000

## Ortam Degiskenleri

### backend/.env
`backend/.env.example` dosyasini kopyalayip doldur.

- `DATABASE_URL` = PostgreSQL connection string
- `JWT_ACCESS_SECRET` = access token icin gizli anahtar
- `JWT_REFRESH_SECRET` = refresh token icin gizli anahtar
- `ACCESS_TOKEN_TTL` = ornek `15m`
- `REFRESH_TOKEN_TTL_DAYS` = ornek `7`
- `COOKIE_SECURE` = `true` ise sadece https cookie
- `COOKIE_SAMESITE` = `lax` / `strict` / `none`
- `COOKIE_DOMAIN` = opsiyonel domain
- `PORT` = opsiyonel (default 4000)

### frontend/.env.local
`frontend/.env.example` dosyasini kopyalayip doldur.

- `NEXT_PUBLIC_API_URL` = API base URL (gerekli)
- `API_URL_INTERNAL` = server-side istekler icin opsiyonel, Docker icinde `http://backend:4000`

## Scriptler

### Backend
- `npm run start:dev` - gelistirme
- `npm run build` - production build
- `npm run start:prod` - production baslatma
- `npm run lint`
- `npm run test`

### Frontend
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

## Notlar
- Yuklemeler `backend/uploads` altina yazilir, `/uploads` uzerinden servis edilir.
- Cookie ayarlari production icin `COOKIE_SECURE=true` ve uygun `COOKIE_SAMESITE` ile guncellenmelidir.

---

## Görseller

<img width="1366" height="1196" alt="screencapture-localhost-3000-2026-01-11-01_45_511" src="https://github.com/user-attachments/assets/dad727b7-69e4-4c46-93d1-bb0d57855536" />

<img width="1366" height="2091" alt="screencapture-localhost-3000-posts-ilk-publish-testi-1767909024205-2026-01-11-01_46_26" src="https://github.com/user-attachments/assets/840d4859-aad2-48cf-8794-101fc53fb036" />

<img width="1366" height="1204" alt="screencapture-localhost-3000-dashboard-2026-01-11-01_46_53" src="https://github.com/user-attachments/assets/06e665ac-66c2-4276-a482-10400dfff413" />

<img width="1366" height="1001" alt="screencapture-localhost-3000-write-2026-01-11-01_47_10" src="https://github.com/user-attachments/assets/09d44485-88ca-4bc3-91d5-0b1901550ea5" />

<img width="1366" height="2111" alt="screencapture-localhost-3000-2026-01-11-01_45_51" src="https://github.com/user-attachments/assets/fc76d345-a355-4a8e-be3e-74aa5fe6f475" />

<img width="1366" height="680" alt="screencapture-localhost-3000-register-2026-01-11-01_39_01" src="https://github.com/user-attachments/assets/dae959f1-e97b-47dd-9098-5dafe63b94ab" />

<img width="1366" height="599" alt="screencapture-localhost-3000-login-2026-01-11-01_38_52" src="https://github.com/user-attachments/assets/cb2e9d53-a4b1-4e70-8ad5-2a2285c88ff2" />
