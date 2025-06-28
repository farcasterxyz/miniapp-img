import { ImageResponse } from 'next/og';
import { Pattern } from '@/components/pattern';
import { readFileSync } from 'fs';
import path from 'path';

const STYLES = {
  header: {
    marginTop: 2,
    marginLeft: 12,
    color: '#24292E',
    fontFamily: 'Inter',
    fontSize: '40px',
    lineHeight: '40px',
    fontStyle: 'normal',
    fontWeight: 600,
    letterSpacing: '-0.09px'
  },
  sectionContainer: {
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 6,
    paddingBottom: 6,
    borderRadius: 16,
    backgroundColor: '#F0EDFF',
  },
  sectionText: {
    color: '#7C65C1',
    fontFamily: 'Inter',
    fontSize: '24px',
    fontStyle: 'normal',
    fontWeight: 600,
    lineHeight: '30px',
    letterSpacing: '-0.09px',
  },
  title: {
    marginTop: 12,
    color: '#24292E',
    fontSize: '64px',
    fontStyle: 'normal',
    fontWeight: 600,
    lineHeight: '76px',
    letterSpacing: '-0.09px',
  },
  description: {
    marginTop: 20,
    color: '#546473',
    fontFamily: 'Inter',
    fontSize: '32px',
    fontStyle: 'normal',
    fontWeight: 500,
    lineHeight: '36px',
    letterSpacing: '-0.09px',
    width: 898,
  }
}

const interMediumArrayBuffer = readFileSync(path.join(process.cwd(), 'static', 'inter/Inter_18pt-Medium.ttf'));
const interSemoBoldArrayBuffer = readFileSync(path.join(process.cwd(), 'static', 'inter/Inter_18pt-SemiBold.ttf'));

// Load logo as base64 (1.8KB file)
const logoBuffer = readFileSync(path.join(process.cwd(), 'static', 'wc.png'));
const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;

export async function GET(request: Request) {
  try {
    /**
     * Fetch any data you want. You'll want to minimize latency here so avoid
     * or cache network requests where possible. Otherwise prefetch the image
     * so it gets generated and can be served from the CDN cache.
     *
     * In this example we grab data from the URL parameters which is a simple
     * and effective way to make parameterized templates.
     */
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') ?? 'Dynamic Image';
    const section = searchParams.get('section') ?? 'Demo';
    const description = searchParams.get('description') ?? 'This image is dynamically rendered.';

    return new ImageResponse(
      (
        <Pattern>
          <div tw='flex flex-col' style={{ padding: 80 }}>
            <div tw='flex flex-row items-center'>
              <img src={logoBase64} height={45} width={45} />
              <div style={STYLES.header}>Mini App Dynamic Image Demo</div>
            </div>
            <div tw='flex flex-col items-start w-full' style={{ marginTop: 130 }}>
              {section &&
                <div tw='flex' style={STYLES.sectionContainer}>
                  <div style={STYLES.sectionText}>{section}</div>
                </div>
              }
              <div tw='flex flex-col w-full'>
                <div style={STYLES.title}>{title}</div>
                <p style={STYLES.description}>{description}</p>
              </div>
            </div>
          </div>
        </Pattern>
      ),
      {
        width: 1200,
        height: 800,
        headers: {
          /*
           * Cache headers for optimal performance:
           * - public: Allow caching by browsers and CDNs
           * - max-age=31536000: Browser cache for 1 year (maximum allowed)
           * - s-maxage=31536000: CDN cache for 1 year
           * - stale-while-revalidate: Serve stale content while fetching fresh
           *   content
           *
           * The header we use here will cause the image for any given URL to
           * be cached for a year; this is ideal for minimizing billing and
           * fast performance. 
           *
           * You can adjust the parameters down if you want to periodically
           * update data in the image (for instance, if you wanted to include a
           * changing value like the number of mints on an NFT) but be mindful
           * of performance and billing considerations.
           */
          'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate',
        },
        fonts: [
          {
            name: 'Inter',
            data: interMediumArrayBuffer,
            weight: 500,
            style: 'normal',
          },
          {
            name: 'Inter',
            data: interSemoBoldArrayBuffer,
            weight: 600,
            style: 'normal',
          },
        ],
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
