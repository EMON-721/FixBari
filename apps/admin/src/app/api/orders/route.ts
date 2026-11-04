import { NextRequest } from "next/server";
import { proxy } from "../_backend-proxy";
type Context = { params: Promise<{path?: string[]}> };
const forward=(request:NextRequest)=>proxy("orders",request,{params:Promise.resolve({path:[]})} as Context);
export {forward as GET,forward as HEAD,forward as POST,forward as PATCH,forward as PUT,forward as DELETE};
