import Link from "next/link";
export default function HelpPage(){
 const sections=[
  ["Account management","Users shows actual registered accounts. Never promote customers to Admin without controlled authorization. Existing Owner Admin cannot be suspended."],
  ["Technician onboarding","Applicants register as customers with a pending technician application. Review their service areas, skills and experience in Technicians; approval creates the technician profile and requires re-login."],
  ["Service catalog","In Services, create categories then add and price services. Proposed services remain inactive until a valid price and availability are approved. Category deletion is blocked while services exist."],
  ["Bookings & cash on delivery","Customers submit service details, date, address and COD payment method. Admin confirms and assigns only approved available technicians. No online collection is active."],
  ["Additional requests","Requests includes quotation, emergency, property, appliance, support and inspection workflows. A status change does not mean physical dispatch or a payment was made."],
  ["Website settings","Settings should be saved only when a persisted backend is enabled; do not treat a visual-only form as a stored configuration."],
 ];
 return <main className="space-y-6 p-4 sm:p-6 lg:p-8">
  <h1 className="text-2xl font-bold">FixBari Admin Help</h1><p className="text-gray-600">Operational guidance for the restricted Admin Portal.</p>
  <div className="grid gap-4 lg:grid-cols-2">{sections.map(([heading,body])=><section key={heading} className="rounded-2xl border bg-white p-5">
   <h2 className="font-semibold">{heading}</h2><p className="mt-2 text-sm leading-6 text-gray-600">{body}</p></section>)}</div>
  <div className="flex flex-wrap gap-4 text-sm font-semibold text-amber-700"><Link href="/services">Service Manager</Link><Link href="/technicians">Technician Review</Link><Link href="/bookings">Bookings</Link><Link href="/reports">Reports</Link></div>
 </main>;
}
