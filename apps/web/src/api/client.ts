export const apiClient = async <T = unknown>(
  path: string,
  options?: RequestInit
): Promise<T> => {
  const url = `${import.meta.env.VITE_API_URL}${path}`;

  const response = await fetch(url, options);

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;

    try {
      const contentType = response.headers.get("content-type") ?? "";
      const errorBody = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      if (typeof errorBody === "string" && errorBody.trim()) {
        errorMessage = errorBody;
      }

      if (errorBody && typeof errorBody === "object") {
        const message = "message" in errorBody ? errorBody.message : undefined;
        const error = "error" in errorBody ? errorBody.error : undefined;

        if (typeof message === "string" && message.trim()) {
          errorMessage = message;
        } else if (Array.isArray(message) && message.length > 0) {
          errorMessage = message.join(", ");
        } else if (typeof error === "string" && error.trim()) {
          errorMessage = error;
        }
      }
    } catch {
    }

    throw new Error(errorMessage);
  }

  const data: T = await response.json();
  return data;
};
