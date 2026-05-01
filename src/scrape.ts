import axios from 'axios'
import { type CheerioAPI, load as loadHtml } from 'cheerio'

import type { CouncilorTotals, VoteKind } from './types.js'

export const START_URL = 'https://www.portland.gov/council/votes'

/** Doc numbers like `2025-116` — year must be >= this to include (and continue paging). */
export const MIN_DOC_YEAR = 2025

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function fetchPage(url: string): Promise<CheerioAPI> {
  const { data } = await axios.get<string>(url)
  return loadHtml(data)
}

/** Leading four digits of doc number, or null if missing / not of form `YYYY…`. */
export function docYearFromCell(text: string): number | null {
  const t = text.trim()
  if (!t) return null
  const m = /^(\d{4})/.exec(t)
  if (!m) return null
  const y = parseInt(m[1], 10)
  return Number.isNaN(y) ? null : y
}

export function normalizeVote(text: string): VoteKind | null {
  const t = text.toLowerCase()

  if (t.includes('yea') || t.includes('yes')) return 'yea'
  if (t.includes('nay') || t.includes('no')) return 'nay'
  if (t.includes('absent')) return 'absent'
  if (t.includes('abstain')) return 'abstain'

  return null
}

function ensureCouncilor(
  map: Record<string, CouncilorTotals>,
  name: string,
): void {
  if (!map[name]) {
    map[name] = {
      councilorName: name,
      yea: 0,
      nay: 0,
      absent: 0,
      abstain: 0,
    }
  }
}

export async function scrapeAllVotes(): Promise<CouncilorTotals[]> {
  let url: string | null = START_URL
  const councilors: Record<string, CouncilorTotals> = {}

  while (url) {
    console.error(`Scraping: ${url}`)
    const $ = await fetchPage(url)
    let stopPaging = false

    $('.view-council-votes tbody tr').each((_, tr) => {
      const docCell = $(tr).find('.views-field-field-document-number').text()
      const year = docYearFromCell(docCell)

      if (year === null || year < MIN_DOC_YEAR) {
        stopPaging = true
        return false
      }

      const name = $(tr).find('.views-field-field-name').text().trim()
      const value = $(tr)
        .find('.views-field-field-voted-as-follows')
        .text()
        .trim()

      if (!name || !value) return

      const voteType = normalizeVote(value)
      if (!voteType) return

      ensureCouncilor(councilors, name)

      councilors[name][voteType]++
    })

    if (stopPaging) {
      url = null
    } else {
      const nextLink = $('a[rel="next"]').attr('href')
      if (nextLink) {
        url = new URL(nextLink, url).href
        await sleep(200)
      } else {
        url = null
      }
    }
  }

  return Object.values(councilors)
}
