export type TicketStatus = "new" | "in-progress" | "resolved" | "closed"
export type TicketPriority = "low" | "medium" | "high" | "urgent"

export interface Ticket {
  id: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  category: string
  clientId: string
  clientName: string
  clientEmail: string
  clientPhone: string
  assignedTo?: string
  assignedToName?: string
  createdAt: string
  updatedAt: string
  closedAt?: string
  comments: TicketComment[]
}

export interface TicketComment {
  id: string
  ticketId: string
  authorId: string
  authorName: string
  content: string
  isInternal: boolean
  createdAt: string
}

export interface KnowledgeBaseArticle {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  authorId: string
  authorName: string
  createdAt: string
  updatedAt: string
  views: number
  helpful: number
  notHelpful: number
}
