export function postLoginPath(options: {
  next?: string | null;
  isAdmin?: boolean;
  isEditor?: boolean;
  isContributor?: boolean;
}): string {
  const next = options.next;
  if (next && next.startsWith('/') && !next.startsWith('//')) return next;
  if (options.isAdmin || options.isEditor) return '/admin';
  if (options.isContributor) return '/colaborador';
  return '/portal';
}

export function postLoginPathFromRoles(roles: string[], next?: string | null): string {
  return postLoginPath({
    next,
    isAdmin: roles.includes('admin'),
    isEditor: roles.includes('editor'),
    isContributor: roles.includes('contributor'),
  });
}
