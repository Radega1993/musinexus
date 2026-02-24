type ProfileShape = {
  id: string;
  type: string;
  handle: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  location: string | null;
  links: unknown;
  instruments: string[];
  verified: boolean;
  isPrivate: boolean;
};

export function profileToJson(p: ProfileShape) {
  return {
    id: p.id,
    type: p.type,
    handle: p.handle,
    displayName: p.displayName,
    bio: p.bio ?? null,
    avatarUrl: p.avatarUrl ?? null,
    location: p.location ?? null,
    links: (p.links as Array<{ label: string; url: string }> | null) ?? null,
    instruments: p.instruments ?? [],
    verified: p.verified,
    isPrivate: p.isPrivate,
  };
}
