import { renderTimeline } from '../lib/timeline.mjs';

// Render at build time: readable and scrollable even with JavaScript disabled.
export default function remarkTimeline() {
  return (tree, file) => {
    const visit = (node) => {
      if (!node.children) return;
      node.children = node.children.map((child) => {
        if (child.type === 'code' && child.lang === 'timeline') {
          try {
            return { type: 'html', value: renderTimeline(child.value), position: child.position };
          } catch (error) {
            file.fail(`timeline: ${error.message}`, child);
          }
        }
        visit(child);
        return child;
      });
    };
    visit(tree);
  };
}
