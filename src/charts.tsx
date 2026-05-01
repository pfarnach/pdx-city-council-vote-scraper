import React from 'react'
import { renderToString, Box, Text, Newline } from 'ink'
import { StackedBarChart, BarChart } from '@pppp606/ink-chart'

import type { CouncilorTotals, VoteKind } from './types.js'

/** `renderToString` defaults to 80 cols; charts use stdout width — mismatch wraps bars. */
function terminalColumns(): number {
  const c = process.stdout.columns
  return typeof c === 'number' && c > 0 ? c : 80
}

/** Bar width passed to ink-chart (margins for label + value columns). */
function chartContentWidth(): number {
  return Math.max(36, terminalColumns() - 10)
}

function truncateLabel(s: string, max = 26): string {
  if (s.length <= max) return s
  return `${s.slice(0, max - 1)}…`
}

function barRows(
  results: CouncilorTotals[],
  field: VoteKind,
  color: string,
): Array<{ label: string; value: number; color: string }> {
  return [...results]
    .sort((a, b) => b[field] - a[field])
    .map((r) => ({
      label: truncateLabel(r.councilorName),
      value: r[field],
      color,
    }))
}

export function renderCharts(results: CouncilorTotals[]): string {
  // Each @pppp606/ink-chart instance registers SIGWINCH via useAutoWidth().
  process.setMaxListeners(0)

  const cols = terminalColumns()
  const barW = chartContentWidth()

  const sortedByName = [...results].sort((a, b) =>
    a.councilorName.localeCompare(b.councilorName),
  )

  const yeaBars = barRows(results, 'yea', '#2ecc71')
  const nayBars = barRows(results, 'nay', '#e74c3c')
  const absentBars = barRows(results, 'absent', '#f1c40f')
  const abstainBars = barRows(results, 'abstain', '#9b59b6')

  return renderToString(
    <Box flexDirection="column">
      <Text bold>Vote mix by councilor (stacked: Yea / Nay / Absent / Abstain)</Text>
      <Newline />
      {sortedByName.map((c) => (
        <React.Fragment key={c.councilorName}>
          <Text bold>{c.councilorName}</Text>
          <StackedBarChart
            width={barW}
            mode="absolute"
            showLabels
            showValues
            data={[
              { label: 'Yea', value: c.yea, color: '#2ecc71' },
              { label: 'Nay', value: c.nay, color: '#e74c3c' },
              { label: 'Absent', value: c.absent, color: '#f1c40f' },
              { label: 'Abstain', value: c.abstain, color: '#9b59b6' },
            ]}
          />
          <Newline />
        </React.Fragment>
      ))}
      <Text bold>Yea votes</Text>
      <Newline />
      {yeaBars.length > 0 ? (
        <BarChart
          width={cols}
          sort="none"
          showValue="right"
          data={yeaBars}
        />
      ) : (
        <Text dimColor>(no results)</Text>
      )}
      <Newline />
      <Text bold>Nay votes</Text>
      <Newline />
      {nayBars.length > 0 ? (
        <BarChart
          width={cols}
          sort="none"
          showValue="right"
          data={nayBars}
        />
      ) : (
        <Text dimColor>(no results)</Text>
      )}
      <Newline />
      <Text bold>Absent votes</Text>
      <Newline />
      {absentBars.length > 0 ? (
        <BarChart
          width={cols}
          sort="none"
          showValue="right"
          data={absentBars}
        />
      ) : (
        <Text dimColor>(no results)</Text>
      )}
      <Newline />
      <Text bold>Abstain votes</Text>
      <Newline />
      {abstainBars.length > 0 ? (
        <BarChart
          width={cols}
          sort="none"
          showValue="right"
          data={abstainBars}
        />
      ) : (
        <Text dimColor>(no results)</Text>
      )}
    </Box>,
    { columns: cols },
  )
}
