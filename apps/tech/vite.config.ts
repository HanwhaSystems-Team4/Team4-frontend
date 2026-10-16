import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 개발 서버: /api 요청을 백엔드로 넘긴다. 백엔드는 앱마다 X-App 헤더로 정비자(tech) · 파트장(lead) 앱을 구분한다.
// API_TARGET 기본값은 docker compose 스택의 nginx 포트(8081). API 서버(8000)에 바로 붙일 때는 API_TARGET=http://127.0.0.1:8000.
const target = process.env.API_TARGET ?? "http://127.0.0.1:8081";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5181,
    strictPort: true,
    proxy: { "/api": { target, changeOrigin: true, headers: { "X-App": "tech" } } },
  },
  build: { outDir: "dist", emptyOutDir: true },
});
