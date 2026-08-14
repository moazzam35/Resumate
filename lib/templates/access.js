export function isPremiumUser(user) {
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  const sub = user.subscription;
  return Boolean(sub && sub.isActive && sub.plan && sub.plan !== "FREE");
}
