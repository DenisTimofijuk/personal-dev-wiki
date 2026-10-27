import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outputDir = join(projectRoot, '.vitepress', 'dist')

test('build produces the homepage and main documentation sections', async () => {
  const pages = [
    'index.html',
    'HomeLab/index.html',
    'Programming/index.html',
    'Systems/index.html',
    'Tools/index.html'
  ]

  for (const page of pages) {
    const html = await readFile(join(outputDir, page), 'utf8')
    assert.match(html, /<html\b/i, `Expected HTML document: ${page}`)
  }
})

test('homepage preserves branding and GitHub Pages base path', async () => {
  const html = await readFile(join(outputDir, 'index.html'), 'utf8')

  assert.match(html, /Personal Dev Wiki/)
  assert.match(html, /\/personal-dev-wiki\/assets\//)
})

test('repository README is not published as a VitePress page', async () => {
  await assert.rejects(access(join(outputDir, 'README.html')), {
    code: 'ENOENT'
  })
})
