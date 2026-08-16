import { FrameworkCodeSnippet, FrameworkType } from '@weblens/shared';

export function generateFrameworkFixes(ruleId: string, title: string, technicalDetails?: string | null): FrameworkCodeSnippet[] {
  const snippets: FrameworkCodeSnippet[] = [];

  switch (ruleId) {
    case 'seo.missing-title':
    case 'seo.title-too-short':
    case 'seo.title-too-long':
      snippets.push({
        framework: 'html',
        label: 'HTML5 (<head>)',
        language: 'html',
        filename: 'index.html',
        code: `<!-- Add a concise 30-60 character descriptive title -->\n<head>\n  <title>Acme Software — Fast Developer Workspaces & Cloud Tools</title>\n</head>`,
      });
      snippets.push({
        framework: 'nextjs',
        label: 'Next.js (App Router)',
        language: 'typescript',
        filename: 'app/layout.tsx',
        code: `import type { Metadata } from 'next';\n\nexport const metadata: Metadata = {\n  title: 'Acme Software — Fast Developer Workspaces',\n  description: 'Instant website diagnostics and development tools.',\n};`,
      });
      snippets.push({
        framework: 'react',
        label: 'React (React Helmet)',
        language: 'tsx',
        filename: 'src/pages/Home.tsx',
        code: `import { Helmet } from 'react-helmet-async';\n\nexport function HomePage() {\n  return (\n    <>\n      <Helmet>\n        <title>Acme Software — Fast Developer Workspaces</title>\n      </Helmet>\n      <main>...</main>\n    </>\n  );\n}`,
      });
      break;

    case 'seo.missing-meta-description':
    case 'seo.meta-description-too-short':
      snippets.push({
        framework: 'html',
        label: 'HTML5',
        language: 'html',
        filename: 'index.html',
        code: `<!-- 120-155 characters summarizing page content & CTA -->\n<meta name="description" content="Discover instant website diagnostics covering performance, SEO, accessibility, and security with WebLens." />`,
      });
      snippets.push({
        framework: 'nextjs',
        label: 'Next.js 14+ (Metadata API)',
        language: 'typescript',
        filename: 'app/page.tsx',
        code: `export const metadata = {\n  description: 'Discover instant website diagnostics covering performance, SEO, and security with WebLens.',\n};`,
      });
      snippets.push({
        framework: 'react',
        label: 'React Helmet',
        language: 'tsx',
        filename: 'src/App.tsx',
        code: `<Helmet>\n  <meta name="description" content="Instant website health scanner for developers." />\n</Helmet>`,
      });
      break;

    case 'sec.missing-csp':
      snippets.push({
        framework: 'html',
        label: 'HTML Meta Tag',
        language: 'html',
        code: `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://trusted.cdn.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;" />`,
      });
      snippets.push({
        framework: 'nextjs',
        label: 'Next.js (next.config.js)',
        language: 'javascript',
        filename: 'next.config.js',
        code: `const cspHeader = "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';";\n\nmodule.exports = {\n  async headers() {\n    return [\n      {\n        source: '/(.*)',\n        headers: [{ key: 'Content-Security-Policy', value: cspHeader.replace(/\\n/g, '') }],\n      },\n    ];\n  },\n};`,
      });
      break;

    case 'sec.missing-hsts':
      snippets.push({
        framework: 'javascript',
        label: 'Node.js / Express',
        language: 'typescript',
        code: `// Enforce Strict-Transport-Security via helmet or express middleware\nimport helmet from 'helmet';\napp.use(helmet.hsts({\n  maxAge: 31536000,\n  includeSubDomains: true,\n  preload: true\n}));`,
      });
      snippets.push({
        framework: 'nextjs',
        label: 'Next.js Headers',
        language: 'javascript',
        filename: 'next.config.js',
        code: `module.exports = {\n  async headers() {\n    return [\n      {\n        source: '/(.*)',\n        headers: [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' }],\n      },\n    ];\n  },\n};`,
      });
      break;

    case 'a11y.missing-alt':
      snippets.push({
        framework: 'html',
        label: 'HTML5',
        language: 'html',
        code: `<!-- Meaningful alt text for screen readers -->\n<img src="/hero.jpg" alt="Dashboard showing real-time website analytics" />\n\n<!-- Empty alt for purely decorative graphics -->\n<img src="/sparkle.svg" alt="" role="presentation" />`,
      });
      snippets.push({
        framework: 'nextjs',
        label: 'Next.js Image Component',
        language: 'tsx',
        code: `import Image from 'next/image';\n\n<Image\n  src="/hero.jpg"\n  alt="Dashboard showing real-time website analytics"\n  width={1200}\n  height={630}\n  priority\n/>`,
      });
      snippets.push({
        framework: 'react',
        label: 'React JSX',
        language: 'tsx',
        code: `<img\n  src={heroBanner}\n  alt="Product user interface demonstrating performance audits"\n  className="rounded-xl shadow-lg"\n/>`,
      });
      break;

    case 'perf.lcp-slow':
    case 'perf.lcp-moderate':
      snippets.push({
        framework: 'html',
        label: 'HTML Asset Preload',
        language: 'html',
        filename: 'index.html',
        code: `<!-- Preload critical hero image -->\n<link rel="preload" fetchpriority="high" as="image" href="/hero.webp" type="image/webp" />`,
      });
      snippets.push({
        framework: 'nextjs',
        label: 'Next.js Priority Loading',
        language: 'tsx',
        code: `<Image\n  src="/hero.webp"\n  alt="Hero visual"\n  width={1200}\n  height={800}\n  priority={true}\n  fetchPriority="high"\n/>`,
      });
      break;

    default:
      snippets.push({
        framework: 'html',
        label: 'Standard Implementation',
        language: 'html',
        code: technicalDetails ? technicalDetails : `<!-- Recommended configuration for ${title} -->`,
      });
      break;
  }

  return snippets;
}
