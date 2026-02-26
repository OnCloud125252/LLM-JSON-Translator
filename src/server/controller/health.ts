import { StatusCodes } from "http-status-codes";

interface HealthResponse {
  status: string;
  version: string;
  environment: string;
  timestamp: string;
}

export async function handleHealthRequest(): Promise<Response> {
  const packageJson = await Bun.file("./package.json").json();

  const healthResponse: HealthResponse = {
    status: "healthy",
    version: packageJson.version,
    environment: process.env.APP_ENVIRONMENT || "unknown",
    timestamp: new Date().toISOString(),
  };

  return Response.json(healthResponse, { status: StatusCodes.OK });
}
