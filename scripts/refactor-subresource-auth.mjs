import fs from "node:fs";
import path from "node:path";

const base = "E:/projects/Ai resume bulider/resume_bulider/app/api/resumes/[id]";
const dirs = ["achievements", "certificates", "educations", "experiences", "languages", "projects", "skills"];

const oldImport = `import { verifyAccessToken, getTokenFromRequest } from "@/lib/auth";`;
const localFn = `async function authenticate(request) {
  const token = getTokenFromRequest(request);
  if (!token) return { error: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };
  const payload = await verifyAccessToken(token);
  if (!payload) return { error: NextResponse.json({ error: "Invalid token" }, { status: 401 }) };
  return { userId: payload.userId };
}`;
const newImport = `import { authenticateToken } from "@/lib/middleware";`;

for (const d of dirs) {
  const f = path.join(base, d, "route.js");
  let content = fs.readFileSync(f, "utf8");
  const before = content;
  content = content.replace(oldImport, newImport);
  content = content.replace(localFn, "");
  content = content.replaceAll("const auth = await authenticate(request);", "const auth = await authenticateToken(request);");
  if (content === before) {
    console.log(`NO CHANGE: ${d}`);
  } else {
    fs.writeFileSync(f, content);
    console.log(`UPDATED: ${d}`);
  }
}
