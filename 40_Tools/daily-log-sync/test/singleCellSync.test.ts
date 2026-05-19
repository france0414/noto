import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCombinedContent, shouldBlockOverwriteSingleCell } from '../src/singleCellSync.js';

test('buildCombinedContent full-width parentheses with multiline summary', () => {
  const summary = 'Line 1\nLine 2';
  const hoursRaw = '2.5h';

  assert.equal(buildCombinedContent({ summary, hoursRaw }), 'Line 1\nLine 2（2.5h）');
});

test('shouldBlockOverwriteSingleCell false when empty existing cell', () => {
  assert.equal(
    shouldBlockOverwriteSingleCell({
      allowOverwrite: false,
      existingSummary: '',
      nextSummary: 'New summary',
    }),
    false,
  );
});

test('shouldBlockOverwriteSingleCell false when same content', () => {
  assert.equal(
    shouldBlockOverwriteSingleCell({
      allowOverwrite: false,
      existingSummary: 'Same summary',
      nextSummary: 'Same summary',
    }),
    false,
  );
});

test('shouldBlockOverwriteSingleCell true when different and overwrite disabled', () => {
  assert.equal(
    shouldBlockOverwriteSingleCell({
      allowOverwrite: false,
      existingSummary: 'Existing summary',
      nextSummary: 'Next summary',
    }),
    true,
  );
});

test('shouldBlockOverwriteSingleCell false when overwrite enabled', () => {
  assert.equal(
    shouldBlockOverwriteSingleCell({
      allowOverwrite: true,
      existingSummary: 'Existing summary',
      nextSummary: 'Next summary',
    }),
    false,
  );
});
