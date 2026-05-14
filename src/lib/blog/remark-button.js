/**
 * Remark plugin that converts `!button[Label](url)` syntax to `<BlogButton>` component tags.
 *
 * @type {import('unified').Plugin<[], import('mdast').Root>}
 */

const SITE_ORIGIN_HTTPS = 'https://voorvoet.nl';
const SITE_ORIGIN_HTTP = 'http://voorvoet.nl';

/**
 * @param {string} url
 * @returns {boolean}
 */
export function isExternal(url) {
  if (!url.startsWith('http://') && !url.startsWith('https://')) return false;
  return (
    !url.startsWith(SITE_ORIGIN_HTTPS + '/') &&
    !url.startsWith(SITE_ORIGIN_HTTP + '/') &&
    url !== SITE_ORIGIN_HTTPS &&
    url !== SITE_ORIGIN_HTTP
  );
}

/**
 * @param {string} label
 * @param {string} href
 * @returns {string}
 */
export function renderButton(label, href) {
  const external = isExternal(href);
  const extraAttrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
  return `<BlogButton label="${label.replace(/"/g, '&quot;')}" href="${href.replace(/"/g, '&quot;')}"${extraAttrs} />`;
}

/**
 * @param {string} text
 * @returns {string}
 */
export function processButtonSyntax(text) {
  return text.replace(/!button\[([^\]]*)\]\(([^)]*)\)/g, (_match, label, href) => {
    const trimLabel = label.trim();
    const trimHref = href.trim();
    if (!trimLabel || !trimHref) return _match;
    return renderButton(trimLabel, trimHref);
  });
}

/**
 * @param {import('mdast').Parent} node
 * @param {(node: import('mdast').Paragraph, index: number, parent: import('mdast').Parent) => void} callback
 */
function visitParagraphs(node, callback) {
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (child.type === 'paragraph') {
      callback(child, i, node);
    } else if ('children' in child) {
      visitParagraphs(child, callback);
    }
  }
}

/** @type {import('unified').Plugin<[], import('mdast').Root>} */
const remarkButton = () => {
  return (tree) => {
    visitParagraphs(tree, (node, index, parent) => {
      const children = node.children;
      if (children.length !== 1 || children[0].type !== 'text') return;

      const raw = children[0].value.trim();

      const match = /^!button\[([^\]]*)\]\(([^)]*)\)$/.exec(raw);
      if (!match) return;

      const label = match[1].trim();
      const href = match[2].trim();

      if (!label || !href) return;

      parent.children[index] = {
        type: 'html',
        value: renderButton(label, href),
      };
    });
  };
};

export default remarkButton;
