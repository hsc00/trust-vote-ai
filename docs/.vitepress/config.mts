import { defineConfig } from "vitepress";

export default defineConfig({
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
        ],
      },
      {
        text: "Engineering Logs",
        items: [
          {
            text: "1. Dependency Security",
            link: "/logs/1-dependency-security",
          },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/hsc00/trust-vote-ai" },
    ],
  },
});
