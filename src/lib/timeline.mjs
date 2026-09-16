// Shared by Markdown fences and the Astro component. Content stays plain text.
export function parseTimeline(value) {
  const data = typeof value === 'string' ? JSON.parse(value) : value;
  if (!data || !Array.isArray(data.events) || data.events.length === 0) {
    throw new Error('时间线需要至少一个 events 节点。');
  }
  const text = (value, name, required = false) => {
    if (value == null && !required) return '';
    if (typeof value !== 'string' || (required && !value.trim())) {
      throw new Error(`时间线 ${name} 必须是${required ? '非空' : ''}文本。`);
    }
    return value.trim();
  };
  return {
    title: text(data.title ?? '时间线', 'title', true),
    description: text(data.description, 'description'),
    events: data.events.map((event, index) => {
      if (!event || typeof event !== 'object') throw new Error(`时间线节点 ${index + 1} 无效。`);
      const href = text(event.href, 'href');
      if (href && !/^(https?:\/\/|\/(?!\/)|#)/i.test(href)) {
        throw new Error('时间线链接仅支持 http(s)、站内路径或章节锚点。');
      }
      return {
        date: text(event.date, 'date', true),
        title: text(event.title, 'title', true),
        description: text(event.description, 'description'),
        href,
      };
    }),
  };
}

const escape = (value) => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

export function renderTimeline(value) {
  const data = parseTimeline(value);
  const items = data.events.map((event, index) => {
    const title = event.href
      ? `<a class="timeline-event-title" href="${escape(event.href)}">${escape(event.title)}<span aria-hidden="true"> ↗</span></a>`
      : `<span class="timeline-event-title">${escape(event.title)}</span>`;
    return `<li class="timeline-event">
      <span class="timeline-date">${escape(event.date)}</span>
      <span class="timeline-marker" aria-hidden="true"><span></span></span>
      <span class="timeline-index" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
      ${title}
      ${event.description ? `<p class="timeline-event-description">${escape(event.description)}</p>` : ''}
    </li>`;
  }).join('');
  return `<figure class="content-timeline" aria-label="${escape(data.title)}">
    <figcaption class="timeline-header">
      <div class="timeline-heading"><span class="timeline-eyebrow">时间线 · ${data.events.length} 个节点</span><strong class="timeline-title">${escape(data.title)}</strong></div>
      <div class="timeline-controls" hidden>
        <button type="button" data-timeline-direction="-1" aria-label="向前浏览时间线" title="向前浏览" disabled><span aria-hidden="true">←</span></button>
        <button type="button" data-timeline-direction="1" aria-label="向后浏览时间线" title="向后浏览"><span aria-hidden="true">→</span></button>
      </div>
    </figcaption>
    <div class="timeline-viewport" tabindex="0" role="region" aria-label="${escape(data.title)}，可横向滚动浏览">
      <ol class="timeline-track" role="list">${items}</ol>
    </div>
    <div class="timeline-footer">${data.description ? `<p>${escape(data.description)}</p>` : ''}<span class="timeline-scroll-hint" hidden>横向滑动浏览 <span aria-hidden="true">→</span></span></div>
  </figure>`;
}
