export function buildCombinedContent(params: { summary: string; hoursRaw: string }) {
  const { summary, hoursRaw } = params;
  return `${summary}（${hoursRaw}）`;
}

export function shouldBlockOverwriteSingleCell(params: {
  allowOverwrite: boolean;
  existingSummary: string;
  nextSummary: string;
}) {
  const { allowOverwrite, existingSummary, nextSummary } = params;

  if (allowOverwrite) {
    return false;
  }

  return existingSummary !== '' && existingSummary !== nextSummary;
}
