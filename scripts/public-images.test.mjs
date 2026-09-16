import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import remarkPublicImages from '../src/plugins/remark-public-images.mjs';

function render(children, filename = '../docs/example.md') {
  const tree = { type: 'root', children: structuredClone(children) };
  remarkPublicImages()(tree, { path: fileURLToPath(new URL(filename, import.meta.url)) });
  return tree.children;
}

test('draft and publication paths resolve to the same public URL', () => {
  for (const [file, prefix] of [['../docs/example.md', '../'], ['../src/content/writing/example.md', '../../../']]) {
    const [image] = render([{ type: 'image', url: `${prefix}public/images/example.png` }], file);
    assert.equal(image.url, '/images/example.png');
  }
});

test('HTML figures retain style, captions and source links', () => {
  const html = '<figure><img style="height: auto" src="../public/images/example.png" alt="图" /><figcaption><a href="https://example.com">来源</a></figcaption></figure>';
  assert.equal(render([{ type: 'html', value: html }])[0].value, html.replace('../public/', '/'));
});

test('external images, root URLs and resources outside public stay unchanged', () => {
  for (const url of ['https://example.com/image.png', '/images/example.png', '../private/image.png', '../public-other/image.png']) {
    assert.equal(render([{ type: 'image', url }])[0].url, url);
  }
});

test('code examples and ordinary links are not rewritten', () => {
  const children = [{ type: 'code', value: '<img src="../public/images/example.png">' }, { type: 'link', url: '../public/images/example.png' }];
  assert.deepEqual(render(children), children);
});
