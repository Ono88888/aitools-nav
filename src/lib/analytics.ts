import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

const LOGS_DB = process.env.NOTION_LOGS_DB_ID

export type EventType = 'visit' | 'click' | 'search' | 'register' | 'login' | 'error'

export async function trackEvent(params: {
  type: EventType
  path?: string
  target?: string
  userId?: string
  ip?: string
  userAgent?: string
  metadata?: any
}) {
  if (!LOGS_DB || !process.env.NOTION_API_KEY) {
    console.warn('Analytics: NOTION_LOGS_DB_ID or NOTION_API_KEY not set')
    // 降级：如果没配置日志库，可以记录到控制台或尝试使用 LEARN_DB
    return
  }

  try {
    const properties: any = {
      Name: {
        title: [
          {
            text: {
              content: `${params.type.toUpperCase()}: ${params.path || params.target || 'N/A'}`,
            },
          },
        ],
      },
      Type: {
        select: { name: params.type },
      },
      Path: {
        rich_text: [{ text: { content: params.path || '' } }],
      },
      Target: {
        rich_text: [{ text: { content: params.target || '' } }],
      },
      UserId: {
        rich_text: [{ text: { content: params.userId || 'Guest' } }],
      },
      IP: {
        rich_text: [{ text: { content: params.ip || '' } }],
      },
      UserAgent: {
        rich_text: [{ text: { content: params.userAgent?.slice(0, 2000) || '' } }],
      },
      Timestamp: {
        date: { start: new Date().toISOString() },
      },
    }

    if (params.metadata) {
      properties.Metadata = {
        rich_text: [{ text: { content: JSON.stringify(params.metadata).slice(0, 2000) } }],
      }
    }

    await notion.pages.create({
      parent: { database_id: LOGS_DB },
      properties,
    })
  } catch (error) {
    console.error('Failed to track event in Notion:', error)
  }
}
