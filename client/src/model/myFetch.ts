const API_ROOT = import.meta.env.VITE_API_ROOT as string;
console.log("API_ROOT", API_ROOT);
/**
 * Makes a RESTful API call to the specified URL using the specified HTTP method and request body.
 * @param url - The URL to make the API call to.
 * @param body - The request body to send with the API call.
 * @param method - The HTTP method to use for the API call (default is 'GET').
 * @returns A Promise that resolves to the JSON response from the API call.
 */
export function rest(url: string, body?: unknown, method?: string) {
  // fluent pattern made popular by jQuery
  return fetch(url, {
    method: method ?? (body ? "POST" : "GET"),
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  }).then((response) =>
    response.ok
      ? response.json()
      : response.json().then((err) => Promise.reject(err))
  );
}

export function api(action: string, body?: unknown, method?: string) {
  return rest(`${API_ROOT}/${action}`, body, method);
}


export type DataEnvelope<T> = {
  data: T,
  isSuccess: boolean,
  error?: string,
}

export type DataListEnvelope<T> = DataEnvelope<T[]> & {
  total: number,
}

/* List of Asynchronous patterns:
  - Callbacks: This is the most basic asynchronous pattern.
  - Pipelining: This is a pattern that allows you to chain asynchronous operations together.
  - Async/Await: This is a pattern that allows you to write asynchronous code that looks like synchronous code. It compiles your code to use Promises.
  - Promises: This uses the Promise object to represent the eventual completion (or failure) of an asynchronous operation, and its resulting value.
*/
