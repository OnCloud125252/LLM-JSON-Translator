import { isClientError } from "./isClientError";

export function handleRecursiveError(error: any) {
  if (isClientError(error)) {
    throw error;
  }
}
