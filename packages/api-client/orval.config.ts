import { defineConfig } from 'orval';

export default defineConfig({
  touchline: {
    input: '../../backend/openapi.json',
    output: {
      target: 'src/generated/touchline.ts',
      client: 'fetch',
      mode: 'single',
      clean: true,
      override: {
        mutator: { path: 'src/http.ts', name: 'httpFetch' },
      },
    },
  },
});
