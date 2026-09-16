import path from 'node:path';
import { fileURLToPath } from 'node:url';

const publicDirectory = fileURLToPath(new URL('../../public/', import.meta.url));

// Keep source images readable in local Markdown editors; publish public/ as /.
export default function remarkPublicImages() {
  return (tree, file) => {
    const webPath = (source) => {
      if (!file.path || !/^\.\.?\//.test(source)) return source;
      const target = path.resolve(path.dirname(file.path), source);
      const relative = path.relative(publicDirectory, target);
      if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) return source;
      return '/' + relative.split(path.sep).join('/');
    };
    const visit = (node) => {
      if (node.type === 'image') node.url = webPath(node.url);
      if (node.type === 'html') {
        node.value = node.value.replace(/<img\b[^>]*>/gi, tag =>
          tag.replace(/(\ssrc\s*=\s*)(["'])(.*?)\2/i,
            (_, prefix, quote, source) => prefix + quote + webPath(source) + quote));
      }
      node.children?.forEach(visit);
    };
    visit(tree);
  };
}
