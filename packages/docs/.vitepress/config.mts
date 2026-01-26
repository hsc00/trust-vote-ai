import { defineConfig } from 'vitepress';

export default defineConfig({
  base: '/trust-vote-ai/',
  title: 'TrustVote AI',
  description: 'High-Integrity Decision Engine',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Architecture', link: '/architecture/1-documentation-stack' },
      { text: 'Logs', link: '/logs/1-dependency-security' },
    ],

    sidebar: [
      {
        text: 'Architecture',
        items: [
          {
            text: '1. Documentation Stack',
            link: '/architecture/1-documentation-stack',
          },
          {
            text: '2. Licensing Strategy',
            link: '/architecture/2-licensing-strategy',
          },
          {
            text: '3. Branching Strategy',
            link: '/architecture/3-branching-strategy',
          },
          {
            text: '4. Runtime & Language',
            link: '/architecture/4-runtime-language',
          },
          {
            text: '5. Backend Framework',
            link: '/architecture/5-backend-framework',
          },
          {
            text: '6. Core Data Schema',
            link: '/architecture/6-core-data-schema',
          },
          {
            text: '7. Quality Gates & CI/CD Pipeline',
            link: '/architecture/7-quality-gates',
          },
          {
            text: '8. Repository Strategy',
            link: '/architecture/8-repository-strategy',
          },
        ],
      },
      {
        text: 'Engineering Logs',
        items: [
          {
            text: '1. Dependency Security',
            link: '/logs/1-dependency-security',
          },
          {
            text: '2. CI/CD Pipeline Fixes',
            link: '/logs/2-github-actions-pages-pipeline',
          },
          {
            text: '3. Monorepo Transition & Quality Gates Implementation',
            link: '/logs/3-monorepo-quality-setup',
          },
        ],
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/hsc00/trust-vote-ai' }],
  },
});
