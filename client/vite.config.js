import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import process from "process";

export default defineConfig(({ mode }) => {
  // Load environment variables based on the mode (e.g., 'development' or 'production')
  const env = loadEnv(mode, process.cwd());

  // Parse the allowed origins into an array if it is a comma-separated list
  const allowedOrigins = env.VITE_ALLOWED_ORIGINS
    ? env.VITE_ALLOWED_ORIGINS.split(",")
    : [];

  return {
    base: "/", // Ensure the base URL is set correctly
    plugins: [react()],
    resolve: {
      alias: {
        "@": "/src",
        "@components": "/src/components",
        "@hooks": "/src/components/hooks",
        "@utilities": "/src/components/utilities",
      },
    },
    optimizeDeps: {
      exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
    },
    server: {
      host: "0.0.0.0", // Listen on all network interfaces
      port: 5173,
      cors: {
        origin: allowedOrigins, // Allow requests from specified origins
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
      },
    },
    worker: {
      format: "es",
    },
    build: {
      rollupOptions: {
        external: ["@ffmpeg/core"],
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              return id
                .toString()
                .split("node_modules/")[1]
                .split("/")[0]
                .toString();
            }
          },
        },
      },
    },
  };
});
