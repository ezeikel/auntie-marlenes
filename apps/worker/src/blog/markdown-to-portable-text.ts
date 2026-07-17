/**
 * Markdown → Sanity Portable Text converter (worker copy).
 *
 * Ported from apps/web/app/actions/blog.ts so the box pipeline produces the
 * exact same block shape the web action did (headings, bullet/number lists,
 * blockquotes, fenced code blocks, and inline bold/italic/code). Kept fully
 * typed (no `any`) rather than copied verbatim. If you change the parser
 * semantics, keep it in sync with the web copy.
 */

type PortableTextSpan = {
  _type: 'span';
  _key: string;
  text: string;
  marks: string[];
};

type PortableTextBlock = {
  _type: 'block';
  _key: string;
  style: string;
  markDefs: never[];
  children: PortableTextSpan[];
  listItem?: 'bullet' | 'number';
  level?: number;
};

type PortableTextCode = {
  _type: 'code';
  _key: string;
  language: string;
  code: string;
};

export type PortableTextNode = PortableTextBlock | PortableTextCode;

/**
 * Parse inline markdown (**bold**, *italic*, `code`) into Portable Text spans.
 */
function parseInlineMarkdown(text: string): PortableTextSpan[] {
  const spans: PortableTextSpan[] = [];
  let currentText = '';
  let currentMarks: string[] = [];
  let i = 0;

  const flushSpan = () => {
    if (currentText) {
      spans.push({
        _type: 'span',
        _key: `span-${spans.length}`,
        text: currentText,
        marks: [...currentMarks],
      });
      currentText = '';
    }
  };

  while (i < text.length) {
    // Bold: **text**
    if (text.slice(i, i + 2) === '**') {
      flushSpan();
      const endIndex = text.indexOf('**', i + 2);
      if (endIndex !== -1) {
        currentMarks.push('strong');
        currentText = text.slice(i + 2, endIndex);
        flushSpan();
        currentMarks = currentMarks.filter((m) => m !== 'strong');
        i = endIndex + 2;
        continue;
      }
    }

    // Italic: *text* (but not ** which is bold)
    if (text[i] === '*' && text[i + 1] !== '*') {
      flushSpan();
      const endIndex = text.indexOf('*', i + 1);
      if (endIndex !== -1 && text[endIndex + 1] !== '*') {
        currentMarks.push('em');
        currentText = text.slice(i + 1, endIndex);
        flushSpan();
        currentMarks = currentMarks.filter((m) => m !== 'em');
        i = endIndex + 1;
        continue;
      }
    }

    // Inline code: `text`
    if (text[i] === '`') {
      flushSpan();
      const endIndex = text.indexOf('`', i + 1);
      if (endIndex !== -1) {
        currentMarks.push('code');
        currentText = text.slice(i + 1, endIndex);
        flushSpan();
        currentMarks = currentMarks.filter((m) => m !== 'code');
        i = endIndex + 1;
        continue;
      }
    }

    currentText += text[i];
    i++;
  }

  flushSpan();
  return spans.length > 0
    ? spans
    : [{ _type: 'span', _key: 'span-0', text, marks: [] }];
}

/**
 * Convert a Markdown string into an array of Sanity Portable Text nodes.
 */
export function markdownToPortableText(markdown: string): PortableTextNode[] {
  const blocks: PortableTextNode[] = [];
  const lines = markdown.split('\n');
  let currentParagraph: string[] = [];
  let inCodeBlock = false;
  let codeContent: string[] = [];
  let codeLanguage = '';
  let inList = false;
  let listType: 'bullet' | 'number' = 'bullet';
  let listItems: PortableTextBlock[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(' ').trim();
      if (text) {
        blocks.push({
          _type: 'block',
          _key: `block-${blocks.length}`,
          style: 'normal',
          markDefs: [],
          children: parseInlineMarkdown(text),
        });
      }
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push(...listItems);
      listItems = [];
      inList = false;
    }
  };

  for (const line of lines) {
    // Code block start/end
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        blocks.push({
          _type: 'code',
          _key: `code-${blocks.length}`,
          language: codeLanguage || 'text',
          code: codeContent.join('\n'),
        });
        codeContent = [];
        codeLanguage = '';
        inCodeBlock = false;
      } else {
        flushParagraph();
        flushList();
        codeLanguage = line.slice(3).trim();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent.push(line);
      continue;
    }

    if (line.trim() === '') {
      flushParagraph();
      flushList();
      continue;
    }

    // Headers
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      flushParagraph();
      flushList();
      const level = headerMatch[1].length;
      blocks.push({
        _type: 'block',
        _key: `block-${blocks.length}`,
        style: `h${level}`,
        markDefs: [],
        children: parseInlineMarkdown(headerMatch[2]),
      });
      continue;
    }

    // Bullet list
    const bulletMatch = line.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      flushParagraph();
      if (!inList || listType !== 'bullet') {
        flushList();
        inList = true;
        listType = 'bullet';
      }
      listItems.push({
        _type: 'block',
        _key: `list-${blocks.length + listItems.length}`,
        style: 'normal',
        listItem: 'bullet',
        level: 1,
        markDefs: [],
        children: parseInlineMarkdown(bulletMatch[1]),
      });
      continue;
    }

    // Numbered list
    const numberMatch = line.match(/^\d+\.\s+(.+)$/);
    if (numberMatch) {
      flushParagraph();
      if (!inList || listType !== 'number') {
        flushList();
        inList = true;
        listType = 'number';
      }
      listItems.push({
        _type: 'block',
        _key: `list-${blocks.length + listItems.length}`,
        style: 'normal',
        listItem: 'number',
        level: 1,
        markDefs: [],
        children: parseInlineMarkdown(numberMatch[1]),
      });
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      flushParagraph();
      flushList();
      blocks.push({
        _type: 'block',
        _key: `block-${blocks.length}`,
        style: 'blockquote',
        markDefs: [],
        children: parseInlineMarkdown(line.slice(2)),
      });
      continue;
    }

    flushList();
    currentParagraph.push(line);
  }

  flushParagraph();
  flushList();

  return blocks;
}
