import { StatusCodes } from "http-status-codes";

interface RouteInfo {
  path: string;
  method: string;
  description: string;
}

interface RoutesResponse {
  name: string;
  version: string;
  routes: RouteInfo[];
}

export async function handleRootRequest(): Promise<Response> {
  const packageJson = await Bun.file("./package.json").json();

  const routesResponse: RoutesResponse = {
    name: packageJson.name,
    version: packageJson.version,
    routes: [
      {
        path: "/",
        method: "GET",
        description: "List all available routes",
      },
      {
        path: "/health",
        method: "GET",
        description: "Health check endpoint",
      },
      {
        path: "/translate",
        method: "POST",
        description: "Translate JSON structure to target language",
      },
    ],
  };

  return Response.json(routesResponse, { status: StatusCodes.OK });
}
