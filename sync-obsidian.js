#!/usr/bin/env node
/**
 * sync-obsidian.js
 * 从 index.html 提取 NH_WEEKS 数据，自动生成 Obsidian 笔记
 * 用法：node sync-obsidian.js          （一次性生成）
 *       node sync-obsidian.js --watch   （监听 index.html 变更自动重新生成）
 */

const fs = require('fs');
const path = require('path');

// ===== 配置 =====
const INDEX_HTML = path.join(__dirname, 'index.html');
const OBSIDIAN_ROOT = path.resolve(__dirname, '../../且曼 ai 产品经理笔记');
const WEEK_DIRS = ['第一周笔记/课程笔记', '第二周笔记/RAG笔记', '第三周/课程笔记'];

// ===== 从 index.html 提取 NH_WEEKS =====
function extractNHWeeks(html) {
  // 匹配 const NH_WEEKS=[ ... ]; 整个数组（支持嵌套方括号）
  const startMarker = 'const NH_WEEKS=[';
  const startIdx = html.indexOf(startMarker);
  if (startIdx === -1) throw new Error('找不到 NH_WEEKS 数据');

  let depth = 0, i = startIdx + 'const NH_WEEKS='.length;
  for (; i < html.length; i++) {
    if (html[i] === '[') depth++;
    else if (html[i] === ']') { depth--; if (depth === 0) break; }
  }
  const raw = html.slice(startIdx + 'const NH_WEEKS='.length, i + 1);

  // JS对象字面量转JSON：给没引号的key加引号
  let json = raw
    .replace(/'/g, '"')
    .replace(/(\w+)\s*:/g, '"$1":')
    .replace(/,\s*([\]\}])/g, '$1')  // 去尾逗号
    .replace(/""(\w)/g, '"$1');       // 修复双引号问题

  try {
    return JSON.parse(json);
  } catch (e) {
    // 如果JSON解析失败，用eval兜底（安全：只读本地文件）
    const fn = new Function('return ' + raw);
    return fn();
  }
}

// ===== 初始化 .obsidian 配置 =====
function initObsidian() {
  const obsDir = path.join(OBSIDIAN_ROOT, '.obsidian');
  fs.mkdirSync(obsDir, { recursive: true });

  fs.writeFileSync(path.join(obsDir, 'app.json'), JSON.stringify({
    strictLineBreaks: false,
    showLineNumber: true,
    readableLineLength: true,
    livePreview: true,
    defaultViewMode: "preview"
  }, null, 2));

  fs.writeFileSync(path.join(obsDir, 'appearance.json'), JSON.stringify({
    baseFontSize: 16,
    theme: "obsidian"
  }, null, 2));

  fs.writeFileSync(path.join(obsDir, 'core-plugins.json'), JSON.stringify([
    "file-explorer", "global-search", "switcher", "graph",
    "backlink", "outgoing-link", "tag-pane", "page-preview",
    "note-composer", "command-palette", "markdown-importer", "outline"
  ], null, 2));
}

// ===== 日期解析 =====
function parseDate(dateStr) {
  // "3月28日（周五）" → "2026-03-28"
  const m = dateStr.match(/(\d+)月(\d+)日/);
  if (!m) return '2026-04-01';
  const month = m[1].padStart(2, '0');
  const day = m[2].padStart(2, '0');
  return `2026-${month}-${day}`;
}

// ===== 生成单个课程笔记 =====
function genCourseNote(course, weekNum, date, weekMocName, prevName, nextName) {
  const tags = (course.tags || []).map(t => `  - ${t}`).join('\n');
  let fm = `---
title: "${course.title}"
type: note
course: AI产品经理
week: ${weekNum}
date: ${date}
courseId: "${course.id}"
tags:
${tags}
up: "[[${weekMocName}]]"`;
  if (prevName) fm += `\nprev: "[[${prevName}]]"`;
  if (nextName) fm += `\nnext: "[[${nextName}]]"`;
  fm += '\n---\n';

  let body = `\n# ${course.id} · ${course.title}\n\n> 回到 [[${weekMocName}]]\n\n`;

  // 知识要点 — 按内容分组
  if (course.points && course.points.length) {
    body += '## 核心知识点\n\n';
    course.points.forEach((p, i) => {
      body += `${i + 1}. ${p}\n`;
    });
    body += '\n';
  }

  // 核心要点
  if (course.keyPoint) {
    body += `## 💡 核心要点\n\n> ${course.keyPoint}\n\n`;
  }

  // 作业
  if (course.homework) {
    body += `## 📝 作业\n\n- ${course.homework}\n\n`;
  }

  // 关联PM节点
  if (course.relatedNodes && course.relatedNodes.length) {
    body += '## 🔗 关联PM工作流节点\n\n';
    course.relatedNodes.forEach(rn => {
      body += `- **${rn.title}**：${rn.why}\n`;
    });
    body += '\n';
  }

  // 导航
  body += '---\n\n';
  const nav = [];
  if (prevName) nav.push(`**← 上一节** [[${prevName}]]`);
  if (nextName) nav.push(`**→ 下一节** [[${nextName}]]`);
  if (nav.length) body += nav.join(' · ') + '\n';

  return fm + body;
}

// ===== 生成周MOC学习地图 =====
function genWeekMoc(week, weekNum, allCourseNames) {
  const weekLabel = ['一', '二', '三'][weekNum - 1] || weekNum;
  const tags = [
    '  - MOC',
    '  - AI产品经理',
    `  - 第${weekLabel}周`
  ].join('\n');

  let fm = `---
title: "Week0${weekNum} 学习地图"
type: MOC
course: AI产品经理
week: ${weekNum}
date: ${parseDate(week.days[0]?.date || '')}
tags:
${tags}
---\n\n`;

  let body = `# 📘 Week.0${weekNum} 学习地图\n\n`;
  body += `> **${week.title}**\n> ${week.subtitle || ''}\n\n---\n\n`;

  // 每天的课程表
  week.days.forEach(day => {
    body += `## 📅 ${day.date} · ${day.title}\n\n`;
    body += '| # | 课程 | 笔记链接 |\n|---|------|--------|\n';
    day.courses.forEach(c => {
      const noteName = allCourseNames.find(n => n.id === c.id)?.name || c.title;
      body += `| ${c.id} | ${c.title} | [[${noteName}]] |\n`;
    });
    body += '\n---\n\n';
  });

  // 统计
  let totalCourses = 0, totalPoints = 0;
  week.days.forEach(d => {
    totalCourses += d.courses.length;
    d.courses.forEach(c => { totalPoints += (c.points || []).length; });
  });

  body += `## 📊 统计\n\n`;
  body += `| 指标 | 数值 |\n|------|------|\n`;
  body += `| 课程节数 | ${totalCourses} |\n`;
  body += `| 课程天数 | ${week.days.length} |\n`;
  body += `| 知识要点 | ${totalPoints} |\n`;
  if (week.dateRange) body += `| 日期范围 | ${week.dateRange} |\n`;
  body += '\n';

  // 金句
  if (week.quotes && week.quotes.length) {
    body += '## 💬 金句\n\n';
    week.quotes.slice(0, 5).forEach(q => { body += `> "${q}"\n\n`; });
  }

  // 工具
  if (week.tools && week.tools.length) {
    body += '## 🛠️ 工具\n\n';
    week.tools.forEach(t => { body += `- **${t.n}**：${t.d}\n`; });
    body += '\n';
  }

  // 跨周链接
  body += '## 🔗 跨周链接\n\n';
  for (let i = 1; i <= 3; i++) {
    if (i !== weekNum) {
      body += `- [[00 Week0${i} 学习地图]]\n`;
    }
  }

  return fm + body;
}

// ===== 主函数 =====
function sync() {
  console.log('📖 读取 index.html...');
  const html = fs.readFileSync(INDEX_HTML, 'utf-8');

  console.log('🔍 提取 NH_WEEKS 数据...');
  const weeks = extractNHWeeks(html);
  console.log(`   找到 ${weeks.length} 周数据`);

  console.log('🔧 初始化 Obsidian vault...');
  initObsidian();

  // 遍历每周，收集所有课程信息
  let totalFiles = 0;
  weeks.forEach((week, wi) => {
    const weekNum = wi + 1;
    const weekDir = path.join(OBSIDIAN_ROOT, WEEK_DIRS[wi]);
    fs.mkdirSync(weekDir, { recursive: true });

    // 收集本周所有课程，分配文件名
    const allCourses = [];
    week.days.forEach((day, di) => {
      day.courses.forEach((course, ci) => {
        const idx = String(allCourses.length + 1).padStart(2, '0');
        const name = `${idx} ${course.title}`;
        allCourses.push({
          id: course.id,
          name,
          course,
          date: parseDate(day.date),
          dayIdx: di,
          courseIdx: ci
        });
      });
    });

    const mocName = `00 Week0${weekNum} 学习地图`;

    // 生成MOC
    const mocContent = genWeekMoc(week, weekNum, allCourses);
    const mocPath = path.join(weekDir, mocName + '.md');
    fs.writeFileSync(mocPath, mocContent, 'utf-8');
    totalFiles++;

    // 生成课程笔记
    allCourses.forEach((item, idx) => {
      const prevName = idx > 0 ? allCourses[idx - 1].name : null;
      const nextName = idx < allCourses.length - 1 ? allCourses[idx + 1].name : null;
      const content = genCourseNote(item.course, weekNum, item.date, mocName, prevName, nextName);
      const filePath = path.join(weekDir, item.name + '.md');
      fs.writeFileSync(filePath, content, 'utf-8');
      totalFiles++;
    });

    console.log(`   ✅ 第${['一','二','三'][wi]}周：${allCourses.length} 个课程笔记 + 1 个学习地图`);
  });

  console.log(`\n🎉 完成！共生成 ${totalFiles} 个md文件`);
  console.log(`📂 笔记目录：${OBSIDIAN_ROOT}`);
  console.log('💡 在 Obsidian 中打开「且曼 ai 产品经理笔记」文件夹作为 vault 即可');
}

// ===== 入口 =====
if (process.argv.includes('--watch')) {
  console.log('👀 监听模式启动，等待 index.html 变更...\n');
  sync();
  let timer = null;
  fs.watch(INDEX_HTML, () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      console.log('\n📝 检测到 index.html 变更，重新同步...\n');
      try { sync(); } catch (e) { console.error('同步失败:', e.message); }
    }, 1000); // 1秒防抖
  });
} else {
  sync();
}
