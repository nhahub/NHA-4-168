export function normalizeRole(role?: string | null) {
  return role?.trim().toLowerCase() ?? '';
}

export function hasAnyRole(userRoles: string[] | null | undefined, allowedRoles: string[]) {
  if (!allowedRoles.length) {
    return true;
  }

  const normalizedAllowedRoles = allowedRoles.map(normalizeRole).filter(Boolean);
  if (!normalizedAllowedRoles.length) {
    return true;
  }

  const normalizedUserRoles = (userRoles ?? []).map(normalizeRole).filter(Boolean);
  return normalizedUserRoles.some((role) => normalizedAllowedRoles.includes(role));
}

export function isAdmin(userRoles: string[] | null | undefined) {
  return hasAnyRole(userRoles, ['admin']);
}

export function isStudent(userRoles: string[] | null | undefined) {
  return hasAnyRole(userRoles, ['student']);
}

export function isInstructor(userRoles: string[] | null | undefined) {
  return hasAnyRole(userRoles, ['instructor']);
}

export function isDriver(userRoles: string[] | null | undefined) {
  return hasAnyRole(userRoles, ['driver']);
}
