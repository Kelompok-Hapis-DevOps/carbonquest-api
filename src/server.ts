import { createApp } from "./app.js";
import { assertRequiredEnv, getPort } from "./config/env.js";

// Node >= 20.12 can load .env natively; ignore when the file is absent (e.g. CI).
try {
  process.loadEnvFile?.();
} catch {
  // no .env file: rely on real environment variables
}

assertRequiredEnv();

const PORT = getPort();
const app = createApp();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(
    `📚 API Documentation available at http://localhost:${PORT}/docs`
  );
});
