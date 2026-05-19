export interface ParsedDailyLog {
  summary: string;
  hoursRaw: string;
  hoursNumeric: number;
}

export function parseDailyLog(content: string): ParsedDailyLog {
  const summary = parseDailyReportSnippet(content);
  const hours = parseHours(content);

  return {
    summary,
    hoursRaw: `${hours}h`,
    hoursNumeric: hours,
  };
}

function parseDailyReportSnippet(content: string): string {
  const snippetMatch = content.match(/^##\s+Daily Report Snippet\s*$([\s\S]*?)(?=^##\s+|^工時[：:]|(?![\s\S]))/m);

  if (!snippetMatch) {
    throw new Error('找不到 `## Daily Report Snippet` 區塊。');
  }

  const snippet = snippetMatch[1]
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line, index, lines) => {
      if (line.trim() !== '') {
        return true;
      }

      const prev = lines[index - 1]?.trim() ?? '';
      const next = lines[index + 1]?.trim() ?? '';
      return prev !== '' && next !== '';
    })
    .join('\n')
    .trim();

  if (!snippet) {
    throw new Error('`## Daily Report Snippet` 區塊是空的。');
  }

  return snippet;
}

function parseHours(content: string): number {
  const hoursMatch = content.match(/^工時[：:]\s*([0-9]+(?:\.[0-9]+)?)\s*h\s*$/m);

  if (!hoursMatch) {
    throw new Error('找不到 `工時：8h` 這類格式。');
  }

  return Number(hoursMatch[1]);
}
