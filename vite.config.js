import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  base: "/my-schedule/",
  plugins: [react()],
  resolve: {
    alias: {
      "@chakra-ui/react": fileURLToPath(
        new URL("./src/map-shims/chakra.jsx", import.meta.url)
      ),
      "react-zoom-pan-pinch": fileURLToPath(
        new URL("./src/map-shims/zoom.jsx", import.meta.url)
      )
    }
  }
});