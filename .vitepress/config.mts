import { defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar'
import { execSync } from 'child_process'

function getGitInfo() {
  try {
    const hash = execSync('git rev-parse --short HEAD').toString().trim()
    const date = execSync('git log -1 --format=%cd --date=short').toString().trim()
    return { hash, date }
  } catch (e) {
    return { hash: 'unknown', date: 'unknown' }
  }
}

const gitInfo = getGitInfo()

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Personal Dev Wiki",
  description: "My collection of solutions, tutorials, and documentation for homelab, programming, and technical challenges I've encountered.",
  base: '/personal-dev-wiki/', // Important! Replace with your actual repo name
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
    ],

    sidebar: generateSidebar({
      documentRootPath: './',
      useTitleFromFileHeading: true,
      hyphenToSpace: true,
      underscoreToSpace: true,
      collapsed: true,
      collapseDepth: 2
    }),

    search: {
      provider: 'local'
    },

    footer: {
      message: `Version: ${gitInfo.hash} | Updated: ${gitInfo.date}`
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/DenisTimofijuk/personal-dev-wiki' }
    ]
  }
})
