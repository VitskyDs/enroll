const JINA_API_KEY = import.meta.env.VITE_JINA_API_KEY as string

/**
 * Fetch the text content of a URL via the Jina Reader API.
 * Returns cleaned markdown suitable for passing to an LLM.
 */
export async function fetchPageContent(url: string): Promise<string> {
  const response = await fetch(`https://r.jina.ai/${url}`, {
    headers: {
      Authorization: `Bearer ${JINA_API_KEY}`,
      Accept: 'text/plain',
    },
  })

  if (!response.ok) {
    throw new Error(`Jina fetch failed: ${response.status} ${response.statusText}`)
  }

  return response.text()
}
