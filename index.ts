import { renderCharts } from './charts.js'
import { scrapeAllVotes } from './scrape.js'

try {
  const results = await scrapeAllVotes()
  console.log(JSON.stringify(results, null, 2))
  console.log('')
  console.log(renderCharts(results))
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err)
  console.error('Error:', msg)
  process.exitCode = 1
}
