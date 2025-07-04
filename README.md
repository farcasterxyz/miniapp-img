[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ffarcasterxyz%2Fminiapp-img)

This repo demonstrates how to generate dynamic images using Next + Vercel. It's
easy to fork, modify, and deploy. And in most cases the free plan should be
sufficient.

Note, you can deploy and use this as a standalone service with the sole purpose
of generating images for your mini app.

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Run the development server:
```bash
pnpm dev
```

3. View the demo route:
```
http://localhost:3000/api/demo
```

You can pass parameters to customize the template:
```
http://localhost:3000/api/demo?title=Hello&section=Guide&description=Your%20custom%20text
```

4. Modify `app/api/demo/route.tsx` to customize the image generation or setup new routes
   by creating by copying the `demo` directory (e.g. `app/api/home/route.tsx`).

You can create as many different image routes as needed. For example, you might
have one for you home route and then one for different paths or resources that
are part of your application (e.g. `app/api/episode/route.tsx` for rending an
image representing a particular episode image `/api/episodes?id=1`).


## Using Google Fonts

1. Download `.ttf` files from [fonts.google.com](https://fonts.google.com)
2. Save in `/static/` directory
3. Load in your route:
```tsx
import { readFileSync } from 'fs';
import path from 'path';

const fontBuffer = readFileSync(path.join(process.cwd(), 'static', 'your-font.ttf'));

// In ImageResponse options:
fonts: [{
  name: 'YourFont',
  data: fontBuffer,
  weight: 400,
  style: 'normal',
}]
```


## Image Loading Strategies

### Base64 (< 10KB)
Best for small icons and logos. Inline with data URI:
```tsx
const imageBuffer = readFileSync(path.join(process.cwd(), 'static', 'icon.png'));
const base64 = `data:image/png;base64,${imageBuffer.toString('base64')}`;
```

### Self-hosted (> 10KB)
For larger images, serve from `/public` folder:
```tsx
// Place image in: /public/images/large-image.png

// In development:
<img src="http://localhost:3000/images/large-image.png" />

// In production:
<img src="https://yourdomain.com/images/large-image.png" />

// Or dynamically:
const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
<img src={`${baseUrl}/images/large-image.png`} />
```

### When to use each:
- **Base64**: Icons, logos < 10KB (avoids network requests)
- **Public folder**: Images > 10KB (avoids ~33% base64 size increase)
- **External CDN**: Large images, multiple variants, or shared across projects


## Using SVG Images

You can use SVGs in two ways:

### Inline SVGs (Recommended)

Define SVG elements directly in your JSX:

```tsx
const svg = (
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800" fill="none">
    {/* SVG paths and elements */}
  </svg>
);

// Use it in your component:
<div>{svg}</div>
```

### External SVGs
For hosted SVG files:

```tsx
<img src="https://your-domain.com/your-svg.svg" height={34} width={34} />
```


## Cache Control

Cache headers improve performance and reduce costs. Choose based on your content:

### 🔒 Static Images

If the image at a particular URL will never change:

```tsx
'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable'
```

**Result:** Cached for 1 year, never revalidates  
**Cost:** Generate once, serve forever
**Example:** stats about a completed football match

### 🔄 Dynamic Data

If the image at a particular URL should periodically change:

```tsx
'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=86400'
```

**Result:** Browser 5min → CDN 5m → Stale OK for 1 day  
**Cost:** ~24 generations/day per unique URL
**Examples:** stats about an in-progress football match

### ⚡ Real-time Updates

You almost certainly don't want to do this since it will be slow and expensive;
and when developing you can use the developer tools in your browser to disable
caching to bypass the cache. But for demonstration purposes if you did want to
always dynamically generate the image:

```tsx
'Cache-Control': 'no-cache, no-store, must-revalidate'
```
**Result:** Always fresh  
**Cost:** Every request generates (expensive and slow!)

Just hope you don't go viral with this setting or you'll be in for an unpleasant
bill!

### Implementation

Set cache headers in your ImageResponse:

```tsx
return new ImageResponse(
  (<div>...</div>),
  {
    width: 1200,
    height: 630,
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate',
    },
  }
);
```

### Cache Options

- `max-age=3600`: Browser cache time of 1 hour
- `s-maxage=86400`: CDN cache of 24 hours
- `stale-while-revalidate`: Serve stale content while updating
- `no-cache`: Force revalidation on every request
- `immutable`: Never revalidate (for versioned URLs)

**Note:** Maximum cache duration is 1 year (31536000 seconds) per HTTP spec.

## References

- [Mini App Docs - Sharing your app](https://miniapps.farcaster.xyz/docs/guides/sharing)
- [Next Docs - Image Response](https://nextjs.org/docs/14/app/api-reference/functions/image-response)

