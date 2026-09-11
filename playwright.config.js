export default {
  testDir: "./tests",
  testMatch: "smoke.spec.js",
  use: {
    baseURL: "http://127.0.0.1:5178/",
    launchOptions: { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH },
  },
  webServer: {
    command: "pnpm run dev --port 5178",
    url: "http://127.0.0.1:5178/",
    reuseExistingServer: true,
  },
};
