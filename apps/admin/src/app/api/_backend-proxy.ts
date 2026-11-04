import { NextRequest, NextResponse } from "next/server";

// Fixed, individually configured backends. Never proxy to a client-selected URL.
// Credentials and service origins are never exposed to browser JavaScript.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Context = { params: Promise<{ path?: string[] }> };
type ServiceKind = "orders" | "services";
const allowedMethods = new Set(["GET","HEAD","POST","PATCH","PUT","DELETE"]);
function destination(service: ServiceKind, parts: string[], search: string) {
  const raw = (service === "orders"
    ? process.env.ORDERS_SERVICE_ORIGIN
    : process.env.SERVICES_SERVICE_ORIGIN || process.env.SERVICE_CATALOG_ORIGIN || "").trim();
  if (!raw || !parts.every(x=>/^[A-Za-z0-9_-]{1,128}$/.test(x))) return null;
  let url: URL;
  try { url = new URL(raw); } catch { return null; }
  if (url.protocol !== "https:" || url.username || url.password ||
      url.pathname !== "/" || url.search || url.hash) return null;
  const target = new URL("/api/" + service + "/" + parts.join("/"), url);
  target.search = search;
  return target;
}
async function proxy(service: ServiceKind, req: NextRequest, ctx: Context) {
  if (!allowedMethods.has(req.method)) return new NextResponse(null,{status:405});
  const { path = [] } = await ctx.params;
  const upstreamUrl = destination(service,path,req.nextUrl.search);
  if (!upstreamUrl) return NextResponse.json({
    success:false,error:{code:"BACKEND_NOT_CONNECTED",message:service+" service is not yet configured for this website."}
  },{status:503,headers:{"Cache-Control":"no-store"}});
  const headers = new Headers({ Accept:"application/json" });
  const type=req.headers.get("content-type"), auth=req.headers.get("authorization");
  if(type) headers.set("Content-Type",type);
  if(auth) headers.set("Authorization",auth);
  try {
    const response=await fetch(upstreamUrl,{
      method:req.method,
      headers,
      body:["GET","HEAD"].includes(req.method)?undefined:await req.arrayBuffer(),
      cache:"no-store",redirect:"manual",signal:AbortSignal.timeout(30000),
    });
    if(response.status>=300&&response.status<400) throw new Error("untrusted redirect");
    const outputHeaders=new Headers({"Cache-Control":"no-store"});
    const responseType=response.headers.get("content-type");
    if(responseType)outputHeaders.set("Content-Type",responseType);
    return new NextResponse(req.method==="HEAD"?null:await response.arrayBuffer(),{
      status:response.status,headers:outputHeaders,
    });
  } catch {
    return NextResponse.json({success:false,error:{code:"BACKEND_UNAVAILABLE",message:service+" service is currently unreachable. Please retry."}},{
      status:503,headers:{"Cache-Control":"no-store","Retry-After":"10"},
    });
  }
}
export { proxy };
