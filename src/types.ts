export type VoteKind = 'yea' | 'nay' | 'absent' | 'abstain'

export type CouncilorTotals = {
  councilorName: string
} & Record<VoteKind, number>
