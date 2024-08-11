import { sentrySvelteKit } from "@sentry/sveltekit";
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [sentrySvelteKit({
    sourceMapsUploadOptions: {
      org: "camille-masset",
      project: "next-cine-showtime"
    }
  }), sveltekit()],
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
  },
});