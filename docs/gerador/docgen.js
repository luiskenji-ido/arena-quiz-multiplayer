// Gerador comum dos documentos (PRD, PTD, DTD) em .docx com a biblioteca "docx".
// Uso: const { build } = require('./docgen'); build({ ...meta, blocks: [...] }, 'saida.docx')
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, ImageRun, PageBreak, Header, Footer, Bookmark, InternalHyperlink,
  PageNumber, LevelFormat, TabStopType
} = require('docx');

const FONT = 'Arial';
const ACCENT = '6D28D9';
const PAGE_W = 11906, PAGE_H = 16838, MARGIN = 1134;            // A4, margens de 2 cm
const CONTENT_W = PAGE_W - 2 * MARGIN;                           // 9638 DXA
const IMG_MAX_W = Math.round(CONTENT_W / 1440 * 96);             // ≈ 642 px
const IMG_MAX_H = 860;
const DIAG = path.join(__dirname, '..', 'diagramas');

// "texto com **negrito** e `código`" -> TextRuns
function runs(text, base = {}) {
  const out = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(new TextRun({ text: text.slice(last, m.index), ...base }));
    const tok = m[0];
    if (tok.startsWith('**')) out.push(new TextRun({ text: tok.slice(2, -2), bold: true, ...base }));
    else out.push(new TextRun({ text: tok.slice(1, -1), font: 'Consolas', color: '5B21B6', ...base }));
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(new TextRun({ text: text.slice(last), ...base }));
  return out;
}

function pngSize(file) {
  const b = fs.readFileSync(file);
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20), data: b };
}

let figN = 0, tabN = 0, listN = 0;
const numberingConfigs = [];

function cell(text, width, opts = {}) {
  const paras = String(text).split('\n').map(line => new Paragraph({
    spacing: { before: 40, after: 40 },
    children: runs(line, { size: opts.size || 18, bold: !!opts.bold, color: opts.color })
  }));
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: opts.fill ? { type: ShadingType.CLEAR, color: 'auto', fill: opts.fill } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: paras
  });
}

function table(spec) {
  const total = spec.widths.reduce((a, b) => a + b, 0);
  const widths = spec.widths.map(w => Math.round(w / total * CONTENT_W));
  widths[widths.length - 1] += CONTENT_W - widths.reduce((a, b) => a + b, 0);
  const border = { style: BorderStyle.SINGLE, size: 4, color: 'C4B5FD' };
  const rows = [new TableRow({ tableHeader: true, children: spec.header.map((h, i) => cell(h, widths[i], { bold: true, fill: 'EDE9FE', color: '3B0764' })) })];
  spec.rows.forEach((r, k) => rows.push(new TableRow({ children: r.map((c, i) => cell(c, widths[i], { fill: k % 2 ? 'FAF8FF' : undefined })) })));
  const out = [];
  if (spec.title) {
    tabN++;
    out.push(new Paragraph({ spacing: { before: 160, after: 60 }, keepNext: true, children: [new TextRun({ text: `Tabela ${tabN} – ${spec.title}`, bold: true, size: 18, color: '4C1D95' })] }));
  }
  out.push(new Table({
    width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: widths, rows,
    borders: { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border }
  }));
  out.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
  return out;
}

function image(file, caption) {
  const p = path.join(DIAG, file);
  const { w, h, data } = pngSize(p);
  let width = IMG_MAX_W, height = Math.round(h * width / w);
  if (height > IMG_MAX_H) { height = IMG_MAX_H; width = Math.round(w * height / h); }
  figN++;
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 160, after: 60 }, keepNext: true,
      children: [new ImageRun({ type: 'png', data, transformation: { width, height }, altText: { title: caption, description: caption, name: file } })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
      children: [new TextRun({ text: `Figura ${figN} – ${caption}`, italics: true, size: 18, color: '4C1D95' }),
                 new TextRun({ text: `  (fonte: docs/diagramas/${file.replace('.png', '.mmd')})`, size: 16, color: '6B7280' })] })
  ];
}

function list(items, numbered) {
  const ref = numbered ? `num${++listN}` : 'bullets';
  if (numbered) numberingConfigs.push({ reference: ref, levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 300 } } } }] });
  return items.map(it => new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 60 }, children: runs(it, { size: 21 }) }));
}

const anchorOf = text => 'sec_' + text.normalize('NFD').replace(/[^A-Za-z0-9]+/g, '_').slice(0, 36);

// Sumário fixo com links internos (não depende de o Word atualizar campos)
function toc(blocks) {
  return blocks.filter(b => b[0] === 'h1' || b[0] === 'h2').map(([lvl, text]) => new Paragraph({
    spacing: { after: lvl === 'h1' ? 60 : 30, before: lvl === 'h1' ? 100 : 0 }, indent: { left: lvl === 'h1' ? 0 : 400 },
    children: [new InternalHyperlink({ anchor: anchorOf(text), children: [new TextRun({ text, size: lvl === 'h1' ? 22 : 20, bold: lvl === 'h1', color: lvl === 'h1' ? '4C1D95' : '374151' })] })]
  }));
}

function block(b) {
  const [type, a, c] = b;
  switch (type) {
    case 'h1': return [new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new Bookmark({ id: anchorOf(a), children: [new TextRun(a)] })] })];
    case 'h2': return [new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new Bookmark({ id: anchorOf(a), children: [new TextRun(a)] })] })];
    case 'h3': return [new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(a)] })];
    case 'p': return [new Paragraph({ spacing: { after: 120, line: 300 }, children: runs(a, { size: 21 }) })];
    case 'bullets': return list(a, false);
    case 'numbered': return list(a, true);
    case 'table': return table(a);
    case 'img': return image(a, c);
    case 'note': return [new Paragraph({ spacing: { before: 80, after: 160 }, shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'F5F3FF' },
      border: { left: { style: BorderStyle.SINGLE, size: 18, color: ACCENT, space: 8 } }, indent: { left: 200, right: 200 },
      children: runs(a, { size: 20, color: '3B0764' }) })];
    case 'code': return String(a).split('\n').map((line, i, arr) => new Paragraph({ shading: { type: ShadingType.CLEAR, color: 'auto', fill: 'F3F4F6' },
      spacing: { before: i === 0 ? 80 : 0, after: i === arr.length - 1 ? 160 : 0 }, indent: { left: 200 },
      children: [new TextRun({ text: line || ' ', font: 'Consolas', size: 17 })] }));
    case 'pagebreak': return [new Paragraph({ children: [new PageBreak()] })];
    default: throw new Error('bloco desconhecido: ' + type);
  }
}

function cover(meta) {
  const line = (text, size, opts = {}) => new Paragraph({ alignment: AlignmentType.LEFT, spacing: { after: opts.after || 120 }, children: [new TextRun({ text, size, font: FONT, ...opts })] });
  return [
    new Paragraph({ spacing: { before: 2400 }, border: { top: { style: BorderStyle.SINGLE, size: 36, color: ACCENT, space: 12 } }, children: [] }),
    line(meta.kind, 28, { color: ACCENT, bold: true }),
    line(meta.title, 56, { bold: true, color: '1F2937', after: 200 }),
    line(meta.subtitle, 26, { color: '4B5563', after: 1200 }),
    new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'C4B5FD', space: 6 } }, children: [] }),
    line(`Produto: Arena Quiz Multiplayer`, 22),
    line(`Versão do documento: ${meta.version}`, 22),
    line(`Data: ${meta.date}`, 22),
    line(`Situação: ${meta.status}`, 22),
    new Paragraph({ children: [new PageBreak()] })
  ];
}

function build(meta, outFile) {
  figN = 0; tabN = 0; listN = 0; numberingConfigs.length = 0;
  const body = [];
  meta.blocks.forEach(b => body.push(...block(b)));
  const children = [
    ...cover(meta),
    new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: 'Sumário', bold: true, size: 32, color: '4C1D95' })] }),
    ...toc(meta.blocks),
    new Paragraph({ children: [new PageBreak()] }),
    ...body
  ];
  const doc = new Document({
    creator: 'Arena Quiz Multiplayer', title: `${meta.kind} – ${meta.title}`, description: meta.subtitle,
    styles: {
      default: { document: { run: { font: FONT, size: 21 } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { font: FONT, size: 32, bold: true, color: '4C1D95' }, paragraph: { spacing: { before: 360, after: 160 }, keepNext: true, outlineLevel: 0 } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { font: FONT, size: 26, bold: true, color: ACCENT }, paragraph: { spacing: { before: 240, after: 120 }, keepNext: true, outlineLevel: 1 } },
        { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { font: FONT, size: 22, bold: true, color: '1F2937' }, paragraph: { spacing: { before: 200, after: 80 }, keepNext: true, outlineLevel: 2 } }
      ]
    },
    numbering: { config: [
      { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 300 } } } }] },
      ...numberingConfigs
    ] },
    sections: [{
      properties: { page: { size: { width: PAGE_W, height: PAGE_H }, margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } }, titlePage: true },
      headers: { default: new Header({ children: [new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'C4B5FD', space: 4 } },
        tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_W }],
        children: [new TextRun({ text: `${meta.kind} – Arena Quiz Multiplayer`, size: 16, color: '6B7280' }), new TextRun({ text: `\tv${meta.version}`, size: 16, color: '6B7280' })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: 'Página ', size: 16, color: '6B7280' }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '6B7280' }),
                   new TextRun({ text: ' de ', size: 16, color: '6B7280' }), new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: '6B7280' })] })] }) },
      children
    }]
  });
  return Packer.toBuffer(doc).then(buf => { fs.writeFileSync(outFile, buf); console.log('gerado:', outFile, `(${figN} figuras, ${tabN} tabelas)`); });
}

module.exports = { build };
