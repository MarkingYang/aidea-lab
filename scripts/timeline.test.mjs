import test from 'node:test';
import assert from 'node:assert/strict';
import { parseTimeline, renderTimeline } from '../src/lib/timeline.mjs';
import remarkTimeline from '../src/plugins/remark-timeline.mjs';

test('plain-text content and link attributes cannot inject markup', () => {
  const html = renderTimeline({
    title: '<script>alert(1)</script>',
    events: [{ date: '2026', title: '<img src=x onerror=alert(1)>', description: 'A & B', href: '#chapter" onclick="alert(1)' }],
  });
  assert.ok(!html.includes('<script>') && !html.includes('<img'));
  assert.ok(html.includes('&lt;img'));
  assert.ok(html.includes('href="#chapter&quot; onclick=&quot;alert(1)"'));
  assert.ok(html.includes('A &amp; B'));
});

test('reject malformed data and executable or protocol-relative links', () => {
  for (const value of ['{', {}, { events: [] }, { events: [null] }, { events: [{ date: 2026, title: 'A' }] }]) {
    assert.throws(() => parseTimeline(value));
  }
  for (const href of ['javascript:alert(1)', 'data:text/html,test', '//example.com']) {
    assert.throws(() => parseTimeline({ events: [{ date: '2026', title: 'A', href }] }));
  }
  for (const href of ['#chapter', '/writing/example/', 'https://example.com']) {
    assert.equal(parseTimeline({ events: [{ date: '2026', title: 'A', href }] }).events[0].href, href);
  }
});

test('render readable ordered content without client-side rendering', () => {
  const html = renderTimeline({ events: [
    { date: '2017—2021', title: '早期研究', description: '保留日期范围' },
    { date: '2026.01—08', title: '后续研究' },
  ] });
  assert.ok(html.includes('<ol class="timeline-track" role="list">'));
  assert.equal((html.match(/<li /g) || []).length, 2);
  assert.ok(html.indexOf('早期研究') < html.indexOf('后续研究'));
  assert.ok(html.includes('保留日期范围'));
  assert.ok(!html.includes('<script'));
});

test('Markdown transforms only timeline fences and reports invalid authoring', () => {
  const ordinary = { type: 'code', lang: 'json', value: '{}' };
  const mermaid = { type: 'code', lang: 'mermaid', value: 'flowchart LR\n A --> B' };
  const tree = { children: [ordinary, { children: [
    { type: 'code', lang: 'timeline', value: '{"events":[{"date":"2026","title":"节点"}]}' }, mermaid,
  ] }] };
  const fail = (message) => { throw new Error(message); };
  remarkTimeline()(tree, { fail });
  assert.equal(tree.children[0], ordinary);
  assert.equal(tree.children[1].children[1], mermaid);
  assert.equal(tree.children[1].children[0].type, 'html');
  assert.throws(() => remarkTimeline()({ children: [{ type: 'code', lang: 'timeline', value: '{}' }] }, { fail }), /timeline:/);
});
