import type { EventStatus, Severity } from './types'

export function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)} ${formatTime(iso)}`
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  const days = Math.floor(hrs / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

export const severityColor: Record<Severity, string> = {
  Low: '#3b82f6',
  Moderate: '#f59e0b',
  High: '#ea580c',
  Severe: '#dc2626',
}

export const statusColor: Record<EventStatus, string> = {
  Verified: '#16a34a',
  'Under Review': '#f59e0b',
  Suspicious: '#dc2626',
  Pending: '#6b7280',
}

export const severityBg: Record<Severity, string> = {
  Low: '#eff6ff',
  Moderate: '#fffbeb',
  High: '#fff7ed',
  Severe: '#fef2f2',
}

export const statusBg: Record<EventStatus, string> = {
  Verified: '#f0fdf4',
  'Under Review': '#fffbeb',
  Suspicious: '#fef2f2',
  Pending: '#f9fafb',
}
