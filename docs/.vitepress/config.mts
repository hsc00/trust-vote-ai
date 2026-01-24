import { defineConfig } from "vitepress";

export default defineConfig({
  base: "/trust-vote-ai/",
  title: "TrustVote AI",
  description: "High-Integrity Decision Engine",
  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Architecture", link: "/architecture/1-documentation-stack" },
      { text: "Logs", link: "/logs/1-dependency-security" },
    ],

    sidebar: [
      {
        text: "Architecture",
        items: [
          {
            text: "1. Documentation Stack",
            link: "/architecture/1-documentation-stack",
          },
          {
            text: "2. Licensing Strategy",
            link: "/architecture/3-licensing-strategy",
          },
          {
            text: "3. Branching Strategy",
            link: "/architecture/3-branching-strategy",
          },
          {
            text: "4. Runtime & Language",
            link: "/architecture/4-runtime-language",
          },
        ],
      },
      {
        text: "Engineering Logs",
        items: [
          {
            text: "1. Dependency Security",
            link: "/logs/1-dependency-security",
          },
          {
            text: "2. CI/CD Pipeline Fixes",
            link: "/logs/2-github-actions-pages-pipeline",
          },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/hsc00/trust-vote-ai" },
    ],
  },
});
