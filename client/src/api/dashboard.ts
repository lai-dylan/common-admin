import { get } from './request'
import type { Statistics } from '@/types'

export const getStatistics = () => get<Statistics>('/dashboard/statistics')

export const getVisitTrend = (days: number = 7) => get<{ date: string; visits: number }[]>('/dashboard/visit-trend', { days })

export const getRecentActivity = () => get<{ id: number; action: string; time: string; user: string }[]>('/dashboard/activity')
