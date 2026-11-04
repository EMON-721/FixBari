import { NextRequest } from "next/server";
import { proxy } from "../../_backend-proxy";
type Context = { params: Promise<{ path?: string[] }> };
const forward = (request: NextRequest, context: Context) => proxy("services",request,context);
export { forward as GET, forward as HEAD, forward as POST, forward as PATCH, forward as PUT, forward as DELETE };
