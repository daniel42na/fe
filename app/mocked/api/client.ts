const MOCK_API_DELAY_MS = 300;

export async function mockFetch<T>(data: T): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_API_DELAY_MS));
  return structuredClone(data);
}
