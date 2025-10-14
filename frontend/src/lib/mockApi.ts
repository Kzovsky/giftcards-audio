export type GiftLink = {
  linkId: string;
  status: "CREATED" | "PENDING_VALIDATION" | "VALIDATED" | "RECORDED" | "REVOKED";
  hasAudio?: boolean;
};

let mockLinks: GiftLink[] = [
  { linkId: "abc123", status: "PENDING_VALIDATION" },
  { linkId: "xyz789", status: "VALIDATED" },
  { linkId: "done456", status: "RECORDED", hasAudio: true },
];

export async function listGiftLinks(): Promise<GiftLink[]> {
  return new Promise((r) => setTimeout(() => r(mockLinks), 400));
}

export async function validateLink(linkId: string) {
  mockLinks = mockLinks.map((l) =>
    l.linkId === linkId ? { ...l, status: "VALIDATED" } : l
  );
}

export async function revokeLink(linkId: string) {
  mockLinks = mockLinks.map((l) =>
    l.linkId === linkId ? { ...l, status: "REVOKED" } : l
  );
}

export async function getGiftStatus(linkId: string): Promise<GiftLink | null> {
  return mockLinks.find((l) => l.linkId === linkId) || null;
}
