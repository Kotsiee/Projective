// vite.config.ts
import { defineConfig } from "npm:vite@7.2.2";
import { fresh } from "@fresh/plugin-vite";
import { walkSync } from "jsr:@std/fs/walk";
import path from "node:path";
import { pathToFileURL } from "node:url";
import process from "node:process";
var ROOT = process.cwd();
function discoverFeatureIslands() {
  const islands = [];
  const featuresPath = path.resolve(ROOT, "apps/web/features");
  try {
    for (const entry of walkSync(featuresPath, {
      exts: [".tsx", ".ts", ".jsx"],
      includeDirs: false
    })) {
      if (entry.path.includes("/islands/") || entry.path.includes("\\islands\\")) {
        const fileUrl = pathToFileURL(entry.path).href;
        islands.push(fileUrl);
      }
    }
  } catch (error) {
    console.warn("\u26A0\uFE0F Could not walk features directory for islands:", error);
  }
  return islands;
}
var vite_config_default = defineConfig({
  root: "apps/web",
  plugins: [
    fresh({
      islandSpecifiers: [
        ...discoverFeatureIslands()
      ]
    })
  ],
  server: {
    fs: {
      allow: [ROOT]
    },
    watch: {
      ignored: [
        "**/coverage/**",
        "**/dist/**",
        "**/.git/**",
        "!**/packages/**"
      ]
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(ROOT, "apps/web/"),
      "@styles": path.resolve(ROOT, "apps/web/styles/"),
      "@components": path.resolve(ROOT, "apps/web/components/"),
      "@features": path.resolve(ROOT, "apps/web/features/"),
      "@islands": path.resolve(ROOT, "apps/web/islands/"),
      "@server": path.resolve(ROOT, "apps/web/server/"),
      "@services": path.resolve(ROOT, "apps/web/services/"),
      "@types": path.resolve(ROOT, "apps/web/types/"),
      "@utils": path.resolve(ROOT, "apps/web/utils.ts"),
      "@projective/backend": path.resolve(ROOT, "packages/backend/mod.ts"),
      "@projective/ui": path.resolve(ROOT, "packages/ui/mod.ts"),
      "@projective/utils": path.resolve(ROOT, "packages/utils/mod.ts"),
      "@projective/types": path.resolve(ROOT, "packages/types/mod.ts"),
      "@projective/fields": path.resolve(ROOT, "packages/fields/mod.ts"),
      "@projective/data": path.resolve(ROOT, "packages/data/mod.ts"),
      "@projective/charts": path.resolve(ROOT, "packages/charts/mod.ts")
    }
  },
  optimizeDeps: {
    exclude: [
      "@projective/ui",
      "@projective/fields",
      "@projective/utils",
      "@projective/types",
      "@projective/data",
      "@projective/charts"
    ]
  },
  ssr: {
    noExternal: true
  },
  build: {
    sourcemap: false,
    commonjsOptions: {
      include: [/packages\//, /node_modules/]
    },
    rollupOptions: {
      external: [/node:/, "node:process"]
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlUm9vdCI6ICJmaWxlOi8vL0M6L1VzZXJzL0FobWVkL0RvY3VtZW50cy8wX1dlYnNpdGVzL1Byb2plY3RpdmUvIiwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBaG1lZFxcXFxEb2N1bWVudHNcXFxcMF9XZWJzaXRlc1xcXFxQcm9qZWN0aXZlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBaG1lZFxcXFxEb2N1bWVudHNcXFxcMF9XZWJzaXRlc1xcXFxQcm9qZWN0aXZlXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9BaG1lZC9Eb2N1bWVudHMvMF9XZWJzaXRlcy9Qcm9qZWN0aXZlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAnbnBtOnZpdGVANy4yLjInO1xyXG5pbXBvcnQgeyBmcmVzaCB9IGZyb20gJ0BmcmVzaC9wbHVnaW4tdml0ZSc7XHJcbmltcG9ydCB7IHdhbGtTeW5jIH0gZnJvbSAnanNyOkBzdGQvZnMvd2Fsayc7XHJcbmltcG9ydCBwYXRoIGZyb20gJ25vZGU6cGF0aCc7XHJcbmltcG9ydCB7IHBhdGhUb0ZpbGVVUkwgfSBmcm9tICdub2RlOnVybCc7XHJcbmltcG9ydCBwcm9jZXNzIGZyb20gJ25vZGU6cHJvY2Vzcyc7XHJcblxyXG4vLyAjcmVnaW9uIEhlbHBlciBGdW5jdGlvbnNcclxuY29uc3QgUk9PVCA9IHByb2Nlc3MuY3dkKCk7XHJcblxyXG4vKipcclxuICogRHluYW1pY2FsbHkgZGlzY292ZXJzIGFsbCBJc2xhbmQgY29tcG9uZW50cyB3aXRoaW4gdGhlIGZlYXR1cmVzIGRpcmVjdG9yeS5cclxuICogRm9ybWF0cyBkaXNjb3ZlcmVkIHBhdGhzIGFzIGV4cGxpY2l0IGZpbGU6Ly8gVVJMcyBzbyB0aGUgRGVubyBtb2R1bGUgbG9hZGVyXHJcbiAqIGNhbiByZXNvbHZlIHRoZW0gY29ycmVjdGx5IHdpdGhvdXQgbG9va2luZyBmb3IgdGhlbSBpbiB0aGUgaW1wb3J0IG1hcC5cclxuICpcclxuICogQHJldHVybnMge3N0cmluZ1tdfSBBbiBhcnJheSBvZiBmaWxlOi8vIFVSTCBzdHJpbmdzIGZvciBpc2xhbmQgY29tcG9uZW50cy5cclxuICovXHJcbmZ1bmN0aW9uIGRpc2NvdmVyRmVhdHVyZUlzbGFuZHMoKTogc3RyaW5nW10ge1xyXG5cdGNvbnN0IGlzbGFuZHM6IHN0cmluZ1tdID0gW107XHJcblx0Y29uc3QgZmVhdHVyZXNQYXRoID0gcGF0aC5yZXNvbHZlKFJPT1QsICdhcHBzL3dlYi9mZWF0dXJlcycpO1xyXG5cclxuXHR0cnkge1xyXG5cdFx0Zm9yIChcclxuXHRcdFx0Y29uc3QgZW50cnkgb2Ygd2Fsa1N5bmMoZmVhdHVyZXNQYXRoLCB7XHJcblx0XHRcdFx0ZXh0czogWycudHN4JywgJy50cycsICcuanN4J10sXHJcblx0XHRcdFx0aW5jbHVkZURpcnM6IGZhbHNlLFxyXG5cdFx0XHR9KVxyXG5cdFx0KSB7XHJcblx0XHRcdGlmIChlbnRyeS5wYXRoLmluY2x1ZGVzKCcvaXNsYW5kcy8nKSB8fCBlbnRyeS5wYXRoLmluY2x1ZGVzKCdcXFxcaXNsYW5kc1xcXFwnKSkge1xyXG5cdFx0XHRcdC8vIENvbnZlcnQgYWJzb2x1dGUgc3lzdGVtIHBhdGggKFBPU0lYIG9yIFdpbmRvd3MpIGludG8gYSBmaWxlOi8vLyBVUkxcclxuXHRcdFx0XHRjb25zdCBmaWxlVXJsID0gcGF0aFRvRmlsZVVSTChlbnRyeS5wYXRoKS5ocmVmO1xyXG5cdFx0XHRcdGlzbGFuZHMucHVzaChmaWxlVXJsKTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0gY2F0Y2ggKGVycm9yKSB7XHJcblx0XHRjb25zb2xlLndhcm4oJ1x1MjZBMFx1RkUwRiBDb3VsZCBub3Qgd2FsayBmZWF0dXJlcyBkaXJlY3RvcnkgZm9yIGlzbGFuZHM6JywgZXJyb3IpO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIGlzbGFuZHM7XHJcbn1cclxuLy8gI2VuZHJlZ2lvblxyXG5cclxuLy8gI3JlZ2lvbiBWaXRlIENvbmZpZ3VyYXRpb25cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuXHRyb290OiAnYXBwcy93ZWInLFxyXG5cclxuXHRwbHVnaW5zOiBbXHJcblx0XHRmcmVzaCh7XHJcblx0XHRcdGlzbGFuZFNwZWNpZmllcnM6IFtcclxuXHRcdFx0XHQuLi5kaXNjb3ZlckZlYXR1cmVJc2xhbmRzKCksXHJcblx0XHRcdF0sXHJcblx0XHR9KSxcclxuXHRdLFxyXG5cclxuXHRzZXJ2ZXI6IHtcclxuXHRcdGZzOiB7XHJcblx0XHRcdGFsbG93OiBbUk9PVF0sXHJcblx0XHR9LFxyXG5cdFx0d2F0Y2g6IHtcclxuXHRcdFx0aWdub3JlZDogW1xyXG5cdFx0XHRcdCcqKi9jb3ZlcmFnZS8qKicsXHJcblx0XHRcdFx0JyoqL2Rpc3QvKionLFxyXG5cdFx0XHRcdCcqKi8uZ2l0LyoqJyxcclxuXHRcdFx0XHQnISoqL3BhY2thZ2VzLyoqJyxcclxuXHRcdFx0XSxcclxuXHRcdH0sXHJcblx0fSxcclxuXHJcblx0cmVzb2x2ZToge1xyXG5cdFx0YWxpYXM6IHtcclxuXHRcdFx0J0AnOiBwYXRoLnJlc29sdmUoUk9PVCwgJ2FwcHMvd2ViLycpLFxyXG5cdFx0XHQnQHN0eWxlcyc6IHBhdGgucmVzb2x2ZShST09ULCAnYXBwcy93ZWIvc3R5bGVzLycpLFxyXG5cdFx0XHQnQGNvbXBvbmVudHMnOiBwYXRoLnJlc29sdmUoUk9PVCwgJ2FwcHMvd2ViL2NvbXBvbmVudHMvJyksXHJcblx0XHRcdCdAZmVhdHVyZXMnOiBwYXRoLnJlc29sdmUoUk9PVCwgJ2FwcHMvd2ViL2ZlYXR1cmVzLycpLFxyXG5cdFx0XHQnQGlzbGFuZHMnOiBwYXRoLnJlc29sdmUoUk9PVCwgJ2FwcHMvd2ViL2lzbGFuZHMvJyksXHJcblx0XHRcdCdAc2VydmVyJzogcGF0aC5yZXNvbHZlKFJPT1QsICdhcHBzL3dlYi9zZXJ2ZXIvJyksXHJcblx0XHRcdCdAc2VydmljZXMnOiBwYXRoLnJlc29sdmUoUk9PVCwgJ2FwcHMvd2ViL3NlcnZpY2VzLycpLFxyXG5cdFx0XHQnQHR5cGVzJzogcGF0aC5yZXNvbHZlKFJPT1QsICdhcHBzL3dlYi90eXBlcy8nKSxcclxuXHRcdFx0J0B1dGlscyc6IHBhdGgucmVzb2x2ZShST09ULCAnYXBwcy93ZWIvdXRpbHMudHMnKSxcclxuXHJcblx0XHRcdCdAcHJvamVjdGl2ZS9iYWNrZW5kJzogcGF0aC5yZXNvbHZlKFJPT1QsICdwYWNrYWdlcy9iYWNrZW5kL21vZC50cycpLFxyXG5cdFx0XHQnQHByb2plY3RpdmUvdWknOiBwYXRoLnJlc29sdmUoUk9PVCwgJ3BhY2thZ2VzL3VpL21vZC50cycpLFxyXG5cdFx0XHQnQHByb2plY3RpdmUvdXRpbHMnOiBwYXRoLnJlc29sdmUoUk9PVCwgJ3BhY2thZ2VzL3V0aWxzL21vZC50cycpLFxyXG5cdFx0XHQnQHByb2plY3RpdmUvdHlwZXMnOiBwYXRoLnJlc29sdmUoUk9PVCwgJ3BhY2thZ2VzL3R5cGVzL21vZC50cycpLFxyXG5cdFx0XHQnQHByb2plY3RpdmUvZmllbGRzJzogcGF0aC5yZXNvbHZlKFJPT1QsICdwYWNrYWdlcy9maWVsZHMvbW9kLnRzJyksXHJcblx0XHRcdCdAcHJvamVjdGl2ZS9kYXRhJzogcGF0aC5yZXNvbHZlKFJPT1QsICdwYWNrYWdlcy9kYXRhL21vZC50cycpLFxyXG5cdFx0XHQnQHByb2plY3RpdmUvY2hhcnRzJzogcGF0aC5yZXNvbHZlKFJPT1QsICdwYWNrYWdlcy9jaGFydHMvbW9kLnRzJyksXHJcblx0XHR9LFxyXG5cdH0sXHJcblxyXG5cdG9wdGltaXplRGVwczoge1xyXG5cdFx0ZXhjbHVkZTogW1xyXG5cdFx0XHQnQHByb2plY3RpdmUvdWknLFxyXG5cdFx0XHQnQHByb2plY3RpdmUvZmllbGRzJyxcclxuXHRcdFx0J0Bwcm9qZWN0aXZlL3V0aWxzJyxcclxuXHRcdFx0J0Bwcm9qZWN0aXZlL3R5cGVzJyxcclxuXHRcdFx0J0Bwcm9qZWN0aXZlL2RhdGEnLFxyXG5cdFx0XHQnQHByb2plY3RpdmUvY2hhcnRzJyxcclxuXHRcdF0sXHJcblx0fSxcclxuXHJcblx0c3NyOiB7XHJcblx0XHRub0V4dGVybmFsOiB0cnVlLFxyXG5cdH0sXHJcblxyXG5cdGJ1aWxkOiB7XHJcblx0XHRzb3VyY2VtYXA6IGZhbHNlLFxyXG5cdFx0Y29tbW9uanNPcHRpb25zOiB7XHJcblx0XHRcdGluY2x1ZGU6IFsvcGFja2FnZXNcXC8vLCAvbm9kZV9tb2R1bGVzL10sXHJcblx0XHR9LFxyXG5cdFx0cm9sbHVwT3B0aW9uczoge1xyXG5cdFx0XHRleHRlcm5hbDogWy9ub2RlOi8sICdub2RlOnByb2Nlc3MnXSxcclxuXHRcdH0sXHJcblx0fSxcclxufSk7XHJcbi8vICNlbmRyZWdpb25cclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF3VSxTQUFTLG9CQUFvQjtBQUNyVyxTQUFTLGFBQWE7QUFDdEIsU0FBUyxnQkFBZ0I7QUFDekIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMscUJBQXFCO0FBQzlCLE9BQU8sYUFBYTtBQUdwQixJQUFNLE9BQU8sUUFBUSxJQUFJO0FBU3pCLFNBQVMseUJBQW1DO0FBQzNDLFFBQU0sVUFBb0IsQ0FBQztBQUMzQixRQUFNLGVBQWUsS0FBSyxRQUFRLE1BQU0sbUJBQW1CO0FBRTNELE1BQUk7QUFDSCxlQUNPLFNBQVMsU0FBUyxjQUFjO0FBQUEsTUFDckMsTUFBTSxDQUFDLFFBQVEsT0FBTyxNQUFNO0FBQUEsTUFDNUIsYUFBYTtBQUFBLElBQ2QsQ0FBQyxHQUNBO0FBQ0QsVUFBSSxNQUFNLEtBQUssU0FBUyxXQUFXLEtBQUssTUFBTSxLQUFLLFNBQVMsYUFBYSxHQUFHO0FBRTNFLGNBQU0sVUFBVSxjQUFjLE1BQU0sSUFBSSxFQUFFO0FBQzFDLGdCQUFRLEtBQUssT0FBTztBQUFBLE1BQ3JCO0FBQUEsSUFDRDtBQUFBLEVBQ0QsU0FBUyxPQUFPO0FBQ2YsWUFBUSxLQUFLLCtEQUFxRCxLQUFLO0FBQUEsRUFDeEU7QUFFQSxTQUFPO0FBQ1I7QUFJQSxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMzQixNQUFNO0FBQUEsRUFFTixTQUFTO0FBQUEsSUFDUixNQUFNO0FBQUEsTUFDTCxrQkFBa0I7QUFBQSxRQUNqQixHQUFHLHVCQUF1QjtBQUFBLE1BQzNCO0FBQUEsSUFDRCxDQUFDO0FBQUEsRUFDRjtBQUFBLEVBRUEsUUFBUTtBQUFBLElBQ1AsSUFBSTtBQUFBLE1BQ0gsT0FBTyxDQUFDLElBQUk7QUFBQSxJQUNiO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTixTQUFTO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLE1BQ0Q7QUFBQSxJQUNEO0FBQUEsRUFDRDtBQUFBLEVBRUEsU0FBUztBQUFBLElBQ1IsT0FBTztBQUFBLE1BQ04sS0FBSyxLQUFLLFFBQVEsTUFBTSxXQUFXO0FBQUEsTUFDbkMsV0FBVyxLQUFLLFFBQVEsTUFBTSxrQkFBa0I7QUFBQSxNQUNoRCxlQUFlLEtBQUssUUFBUSxNQUFNLHNCQUFzQjtBQUFBLE1BQ3hELGFBQWEsS0FBSyxRQUFRLE1BQU0sb0JBQW9CO0FBQUEsTUFDcEQsWUFBWSxLQUFLLFFBQVEsTUFBTSxtQkFBbUI7QUFBQSxNQUNsRCxXQUFXLEtBQUssUUFBUSxNQUFNLGtCQUFrQjtBQUFBLE1BQ2hELGFBQWEsS0FBSyxRQUFRLE1BQU0sb0JBQW9CO0FBQUEsTUFDcEQsVUFBVSxLQUFLLFFBQVEsTUFBTSxpQkFBaUI7QUFBQSxNQUM5QyxVQUFVLEtBQUssUUFBUSxNQUFNLG1CQUFtQjtBQUFBLE1BRWhELHVCQUF1QixLQUFLLFFBQVEsTUFBTSx5QkFBeUI7QUFBQSxNQUNuRSxrQkFBa0IsS0FBSyxRQUFRLE1BQU0sb0JBQW9CO0FBQUEsTUFDekQscUJBQXFCLEtBQUssUUFBUSxNQUFNLHVCQUF1QjtBQUFBLE1BQy9ELHFCQUFxQixLQUFLLFFBQVEsTUFBTSx1QkFBdUI7QUFBQSxNQUMvRCxzQkFBc0IsS0FBSyxRQUFRLE1BQU0sd0JBQXdCO0FBQUEsTUFDakUsb0JBQW9CLEtBQUssUUFBUSxNQUFNLHNCQUFzQjtBQUFBLE1BQzdELHNCQUFzQixLQUFLLFFBQVEsTUFBTSx3QkFBd0I7QUFBQSxJQUNsRTtBQUFBLEVBQ0Q7QUFBQSxFQUVBLGNBQWM7QUFBQSxJQUNiLFNBQVM7QUFBQSxNQUNSO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNEO0FBQUEsRUFDRDtBQUFBLEVBRUEsS0FBSztBQUFBLElBQ0osWUFBWTtBQUFBLEVBQ2I7QUFBQSxFQUVBLE9BQU87QUFBQSxJQUNOLFdBQVc7QUFBQSxJQUNYLGlCQUFpQjtBQUFBLE1BQ2hCLFNBQVMsQ0FBQyxjQUFjLGNBQWM7QUFBQSxJQUN2QztBQUFBLElBQ0EsZUFBZTtBQUFBLE1BQ2QsVUFBVSxDQUFDLFNBQVMsY0FBYztBQUFBLElBQ25DO0FBQUEsRUFDRDtBQUNELENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
