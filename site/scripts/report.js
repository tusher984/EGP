const target = document.getElementById('article-body');
const title = document.getElementById('article-title');

function escapeText(value) {
  const node = document.createElement('span');
  node.textContent = value;
  return node.textContent;
}

function parseStory(source) {
  const blocks = [];
  let current = null;
  let field = null;

  const close = () => {
    if (current) blocks.push(current);
    current = null;
    field = null;
  };

  source.replace(/\r\n?/g, '\n').split('\n').forEach((raw) => {
    const line = raw.trim();
    if (!line || line.startsWith('//')) return;

    if (line.startsWith('#')) {
      close();
      const parts = line.slice(1).trim().split(/\s+/);
      current = { kind: parts[0], id: parts.slice(1).join(' '), en: [], heading: '' };
      return;
    }

    const match = line.match(/^(h\.)?(en|bn)\s*:\s*(.*)$/);
    if (match && current) {
      const isHeading = Boolean(match[1]);
      const language = match[2];
      if (language === 'en') {
        field = isHeading ? 'heading' : 'en';
        if (isHeading) current.heading = match[3];
        else current.en.push(match[3]);
      }
      return;
    }

    if (field === 'en' && current) {
      current.en[current.en.length - 1] += ` ${line}`;
    }
  });

  close();
  return blocks;
}

function renderBlock(block) {
  const text = block.en.join(' ').trim();
  if (block.kind === 'h2') {
    const heading = document.createElement('h3');
    heading.textContent = block.en[0] || block.id;
    return heading;
  }
  if (block.kind === 'finding') {
    const aside = document.createElement('aside');
    aside.className = `report-finding finding-${block.id || 'derived'}`;
    const heading = document.createElement('h3');
    heading.textContent = block.heading || 'Finding';
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    aside.append(heading, paragraph);
    return aside;
  }
  if (['p', 'lede'].includes(block.kind) && text) {
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    if (block.kind === 'lede') paragraph.className = 'article-lede';
    if (text.startsWith('[')) paragraph.className = 'report-placeholder';
    return paragraph;
  }
  return null;
}

fetch('site/story.md', { cache: 'no-cache' })
  .then((response) => {
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return response.text();
  })
  .then((source) => {
    const blocks = parseStory(source);
    const head = blocks.find((block) => block.kind === 'hed');
    const deck = blocks.find((block) => block.kind === 'dek');
    if (head?.en[0]) title.textContent = head.en[0];
    target.replaceChildren();
    if (deck?.en[0]) {
      const standfirst = document.createElement('p');
      standfirst.className = 'article-deck';
      standfirst.textContent = deck.en[0];
      target.appendChild(standfirst);
    }
    blocks.forEach((block) => {
      const node = renderBlock(block);
      if (node) target.appendChild(node);
    });
  })
  .catch(() => {
    target.innerHTML = '<p class="report-placeholder">The investigation text could not be loaded.</p>';
  });
