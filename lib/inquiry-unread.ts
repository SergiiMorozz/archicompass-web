export type UnreadInquiry = {
  id: string;
  client_id: string;
  status: string;
};

export type UnreadMessage = {
  inquiry_id: string;
  sender_id: string;
  read_at: string | null;
};

export function clientUnreadByInquiry(
  inquiries: Array<Pick<UnreadInquiry, "id">>,
  messages: UnreadMessage[],
  clientId: string
) {
  const inquiryIds = new Set(inquiries.map((inquiry) => inquiry.id));
  const unread = new Map<string, number>();

  messages.forEach((message) => {
    if (
      inquiryIds.has(message.inquiry_id) &&
      message.sender_id !== clientId &&
      !message.read_at
    ) {
      unread.set(message.inquiry_id, (unread.get(message.inquiry_id) ?? 0) + 1);
    }
  });

  return unread;
}

export function professionalUnreadByInquiry(
  inquiries: UnreadInquiry[],
  messages: UnreadMessage[]
) {
  const clients = new Map(inquiries.map((inquiry) => [inquiry.id, inquiry.client_id]));
  const unread = new Map<string, number>();

  inquiries.forEach((inquiry) => {
    if (inquiry.status === "sent") unread.set(inquiry.id, 1);
  });

  messages.forEach((message) => {
    if (
      message.sender_id === clients.get(message.inquiry_id) &&
      !message.read_at
    ) {
      unread.set(message.inquiry_id, (unread.get(message.inquiry_id) ?? 0) + 1);
    }
  });

  return unread;
}

export function unreadTotal(unread: Map<string, number>) {
  return Array.from(unread.values()).reduce((sum, count) => sum + count, 0);
}
