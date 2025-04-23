export function info(...args: any[]) {
  if (process.env.APP_ENVIRONMENT === "development") {
    console.info(...args);
  }
}
