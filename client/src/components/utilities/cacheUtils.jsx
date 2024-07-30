// cacheUtils.jsx
export async function getCachedAudio(url) {
  // Check if the URL is a blob URL, which cannot be cached using Cache API
  if (url.startsWith("blob:")) {
    const response = await fetch(url);
    const blob = await response.blob();
    const objectURL = URL.createObjectURL(blob);
    return objectURL;
  }

  // Continue with the existing caching mechanism
  const cacheName = "audio-cache";
  const cache = await caches.open(cacheName);

  const cachedResponse = await cache.match(url);
  if (cachedResponse) {
    return cachedResponse.url;
  }

  const response = await fetch(url);
  cache.put(url, response.clone());

  return response.url;
}
