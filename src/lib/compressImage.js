// Resizes an image file down to at most `maxDim` on its longest side and
// re-encodes it as JPEG at `quality`, so photo uploads stay small on slow
// mobile networks. Returns a base64 string (no data: prefix) or null.
export async function compressImage(file, { maxDim = 800, quality = 0.6 } = {}) {
  if (!file) return null

  const bitmap = await createImageBitmapSafe(file)
  if (!bitmap) return null

  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(bitmap, 0, 0, width, height)

  const dataUrl = canvas.toDataURL('image/jpeg', quality)
  return dataUrl.split(',')[1] || null
}

async function createImageBitmapSafe(file) {
  try {
    if (window.createImageBitmap) {
      return await window.createImageBitmap(file)
    }
  } catch {
    // fall through to <img> based approach below
  }
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(null)
    }
    img.src = url
  })
}
