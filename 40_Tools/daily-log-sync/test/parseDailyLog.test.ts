import assert from 'node:assert/strict';
import test from 'node:test';
import { parseDailyLog } from '../src/parseDailyLog.js';

test('parseDailyLog parses snippet and hours when hours line is at EOF', () => {
  const content = [
    '# 2026-05-19',
    '',
    '## Daily Report Snippet',
    '完成 A 任務',
    '完成 B 任務',
    '',
    '工時：7.5h',
  ].join('\n');

  const parsed = parseDailyLog(content);

  assert.equal(parsed.summary, '完成 A 任務\n完成 B 任務');
  assert.equal(parsed.hoursRaw, '7.5h');
  assert.equal(parsed.hoursNumeric, 7.5);
});

test('parseDailyLog stops snippet parsing at the next level-2 header', () => {
  const content = [
    '## Daily Report Snippet',
    '今天整理需求與資料',
    '',
    '## Notes',
    '不應該被納入 snippet',
    '',
    '工時：8h',
  ].join('\n');

  const parsed = parseDailyLog(content);

  assert.equal(parsed.summary, '今天整理需求與資料');
  assert.equal(parsed.hoursRaw, '8h');
  assert.equal(parsed.hoursNumeric, 8);
});
