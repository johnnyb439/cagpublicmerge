// Custom image loader for CDN
export default function cdnImageLoader({ src, width, quality }) {
  const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL || ''
  
  // If src is already a full URL, return as-is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src
  }
  
  // For relative paths, prepend CDN URL
  const baseUrl = cdnUrl.endsWith('/') ? cdnUrl.slice(0, -1) : cdnUrl
  const imagePath = src.startsWith('/') ? src : `/${src}`
  
  // Add image optimization parameters if using a CDN that supports them
  // Example for Cloudflare Images or similar
  const params = new URLSearchParams({
    w: width.toString(),
    q: (quality || 75).toString(),
    // Add more optimization params as needed
    // format: 'auto',
    // fit: 'scale-down'
  })
  
  return `${baseUrl}${imagePath}?${params.toString()}`
}