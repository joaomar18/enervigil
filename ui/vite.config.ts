import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");

    return {
        plugins: [sveltekit()],
        server: {
            host: true,
            port: 8080,
            proxy: {
                "/api": {
                    target: env.VITE_API_TARGET || "http://localhost:8000",
                    changeOrigin: true,
                },
                "/sse": {
                    target: env.VITE_SSE_TARGET || "http://localhost:8000",
                    changeOrigin: true,
                },
            },
        },
    };
});