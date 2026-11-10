import "server-only";
import { sessionUser } from "./auth";

/** Returns the signed-in admin, or null. Every admin page calls this before rendering data. */
export async function adminUser() {
  const user = await sessionUser();
  return user && user.role === "admin" ? user : null;
}
