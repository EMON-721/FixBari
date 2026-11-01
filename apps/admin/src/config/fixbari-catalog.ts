// Snapshot of the public FixBari service catalog. Import is explicit and admin-only.
// Imported services stay inactive until an admin approves the price and activates them.
export type CatalogCategory = {name:string;slug:string;description:string;icon:string};
export type CatalogService = {name:string;slug:string;categorySlug:string;description:string;icon:string;basePrice:number;duration:number};
export const FIXBARI_CATEGORIES: CatalogCategory[] = [
  {
    "name": "Home Repair",
    "slug": "home-repair",
    "description": "General home maintenance and repair services",
    "icon": "Wrench"
  },
  {
    "name": "Cleaning",
    "slug": "cleaning",
    "description": "Professional cleaning services",
    "icon": "Sparkles"
  },
  {
    "name": "Electrical",
    "slug": "electrical",
    "description": "Licensed electricians for all electrical needs",
    "icon": "Zap"
  },
  {
    "name": "Painting",
    "slug": "painting",
    "description": "Interior and exterior painting services",
    "icon": "Paintbrush"
  },
  {
    "name": "Plumbing",
    "slug": "plumbing",
    "description": "Professional plumbing repairs and installation",
    "icon": "Droplets"
  },
  {
    "name": "Transport",
    "slug": "transport",
    "description": "Moving and delivery services",
    "icon": "Truck"
  },
  {
    "name": "Appliance & AC",
    "slug": "appliance-ac",
    "description": "Appliance diagnostics, maintenance and repairs",
    "icon": "Snowflake"
  },
  {
    "name": "Pest Control",
    "slug": "pest-control",
    "description": "Home and building pest treatment services",
    "icon": "Bug"
  },
  {
    "name": "Home Improvement",
    "slug": "home-improvement",
    "description": "Renovation and structural maintenance",
    "icon": "Hammer"
  },
  {
    "name": "Outdoor & Maintenance",
    "slug": "outdoor-maintenance",
    "description": "Garden, water tank and property systems care",
    "icon": "Trees"
  }
];
export const FIXBARI_SERVICES: CatalogService[] = [
  {
    "name": "Interior Painting",
    "slug": "interior-painting",
    "categorySlug": "painting",
    "description": "Professional interior wall painting service for homes and offices",
    "icon": "Paintbrush",
    "basePrice": 6000,
    "duration": 480
  },
  {
    "name": "Exterior Painting",
    "slug": "exterior-painting",
    "categorySlug": "painting",
    "description": "Weather-resistant exterior wall painting for lasting protection",
    "icon": "PaintBucket",
    "basePrice": 8000,
    "duration": 960
  },
  {
    "name": "Texture Painting",
    "slug": "texture-painting",
    "categorySlug": "painting",
    "description": "Decorative texture and pattern painting for unique walls",
    "icon": "Palette",
    "basePrice": 12000,
    "duration": 960
  },
  {
    "name": "Spray Painting",
    "slug": "spray-painting",
    "categorySlug": "painting",
    "description": "Fast and even spray painting coverage for smooth finish",
    "icon": "SprayCan",
    "basePrice": 7500,
    "duration": 480
  },
  {
    "name": "Furniture Repair",
    "slug": "furniture-repair",
    "categorySlug": "home-repair",
    "description": "Fix broken furniture, chairs, tables, and cabinets",
    "icon": "Hammer",
    "basePrice": 1500,
    "duration": 60
  },
  {
    "name": "Door Repair",
    "slug": "door-repair",
    "categorySlug": "home-repair",
    "description": "Door hinge, lock, frame repairs and adjustments",
    "icon": "DoorOpen",
    "basePrice": 2000,
    "duration": 60
  },
  {
    "name": "Window Repair",
    "slug": "window-repair",
    "categorySlug": "home-repair",
    "description": "Window glass, frame, and handle repairs",
    "icon": "LayoutGrid",
    "basePrice": 1800,
    "duration": 60
  },
  {
    "name": "Roof Repair",
    "slug": "roof-repair",
    "categorySlug": "home-repair",
    "description": "Roof leak repairs and waterproofing solutions",
    "icon": "Home",
    "basePrice": 5000,
    "duration": 240
  },
  {
    "name": "Deep Cleaning",
    "slug": "deep-cleaning",
    "categorySlug": "cleaning",
    "description": "Thorough deep cleaning of entire home or office",
    "icon": "Sparkles",
    "basePrice": 3500,
    "duration": 240
  },
  {
    "name": "Regular Cleaning",
    "slug": "regular-cleaning",
    "categorySlug": "cleaning",
    "description": "Weekly or monthly regular cleaning service",
    "icon": "SprayCan",
    "basePrice": 1500,
    "duration": 120
  },
  {
    "name": "Kitchen Cleaning",
    "slug": "kitchen-cleaning",
    "categorySlug": "cleaning",
    "description": "Deep kitchen cleaning including appliances and cabinets",
    "icon": "CookingPot",
    "basePrice": 2000,
    "duration": 120
  },
  {
    "name": "Bathroom Cleaning",
    "slug": "bathroom-cleaning",
    "categorySlug": "cleaning",
    "description": "Complete bathroom sanitization and cleaning",
    "icon": "Bath",
    "basePrice": 1200,
    "duration": 60
  },
  {
    "name": "House Wiring",
    "slug": "house-wiring",
    "categorySlug": "electrical",
    "description": "Complete house electrical wiring and rewiring",
    "icon": "Zap",
    "basePrice": 5000,
    "duration": 480
  },
  {
    "name": "Fan Installation",
    "slug": "fan-installation",
    "categorySlug": "electrical",
    "description": "Ceiling and wall fan installation and repair",
    "icon": "Fan",
    "basePrice": 800,
    "duration": 30
  },
  {
    "name": "Light Fixture",
    "slug": "light-fixture",
    "categorySlug": "electrical",
    "description": "Light fixture installation and bulb replacement",
    "icon": "Lightbulb",
    "basePrice": 600,
    "duration": 30
  },
  {
    "name": "AC Servicing",
    "slug": "ac-servicing",
    "categorySlug": "electrical",
    "description": "Air conditioner installation, repair, and servicing",
    "icon": "Snowflake",
    "basePrice": 1500,
    "duration": 60
  },
  {
    "name": "Leak Repair",
    "slug": "leak-repair",
    "categorySlug": "plumbing",
    "description": "Fix leaking pipes, faucets, and water connections",
    "icon": "Droplets",
    "basePrice": 1200,
    "duration": 60
  },
  {
    "name": "Pipe Installation",
    "slug": "pipe-installation",
    "categorySlug": "plumbing",
    "description": "New pipe installation and replacement",
    "icon": "Pipette",
    "basePrice": 3000,
    "duration": 120
  },
  {
    "name": "Drain Cleaning",
    "slug": "drain-cleaning",
    "categorySlug": "plumbing",
    "description": "Unclog and clean blocked drains and pipes",
    "icon": "Waves",
    "basePrice": 1000,
    "duration": 60
  },
  {
    "name": "Water Heater",
    "slug": "water-heater",
    "categorySlug": "plumbing",
    "description": "Water heater installation and repair",
    "icon": "Flame",
    "basePrice": 4000,
    "duration": 120
  },
  {
    "name": "House Moving",
    "slug": "house-moving",
    "categorySlug": "transport",
    "description": "Complete house moving with packing and unpacking",
    "icon": "Truck",
    "basePrice": 15000,
    "duration": 240
  },
  {
    "name": "Office Moving",
    "slug": "office-moving",
    "categorySlug": "transport",
    "description": "Professional office relocation service",
    "icon": "Building2",
    "basePrice": 20000,
    "duration": 360
  },
  {
    "name": "Furniture Moving",
    "slug": "furniture-moving",
    "categorySlug": "transport",
    "description": "Safe furniture transportation and delivery",
    "icon": "Sofa",
    "basePrice": 5000,
    "duration": 120
  },
  {
    "name": "Parcel Delivery",
    "slug": "parcel-delivery",
    "categorySlug": "transport",
    "description": "Quick and safe parcel delivery service",
    "icon": "Package",
    "basePrice": 500,
    "duration": 60
  },
  {
    "name": "Refrigerator Repair",
    "slug": "refrigerator-repair",
    "categorySlug": "appliance-ac",
    "description": "Planned refrigerator repair service. Provider availability, final scope and pricing require confirmation.",
    "icon": "Snowflake",
    "basePrice": 0,
    "duration": 60
  },
  {
    "name": "Washing Machine Repair",
    "slug": "washing-machine-repair",
    "categorySlug": "appliance-ac",
    "description": "Planned washing machine repair service. Provider availability, final scope and pricing require confirmation.",
    "icon": "Snowflake",
    "basePrice": 0,
    "duration": 60
  },
  {
    "name": "Microwave Servicing",
    "slug": "microwave-servicing",
    "categorySlug": "appliance-ac",
    "description": "Planned microwave servicing service. Provider availability, final scope and pricing require confirmation.",
    "icon": "Snowflake",
    "basePrice": 0,
    "duration": 60
  },
  {
    "name": "Water Purifier Servicing",
    "slug": "water-purifier-servicing",
    "categorySlug": "appliance-ac",
    "description": "Planned water purifier servicing service. Provider availability, final scope and pricing require confirmation.",
    "icon": "Snowflake",
    "basePrice": 0,
    "duration": 60
  },
  {
    "name": "Cockroach Control",
    "slug": "cockroach-control",
    "categorySlug": "pest-control",
    "description": "Planned cockroach control service. Provider availability, final scope and pricing require confirmation.",
    "icon": "Sparkles",
    "basePrice": 0,
    "duration": 60
  },
  {
    "name": "Termite Treatment",
    "slug": "termite-treatment",
    "categorySlug": "pest-control",
    "description": "Planned termite treatment service. Provider availability, final scope and pricing require confirmation.",
    "icon": "Sparkles",
    "basePrice": 0,
    "duration": 60
  },
  {
    "name": "Mosquito Control",
    "slug": "mosquito-control",
    "categorySlug": "pest-control",
    "description": "Planned mosquito control service. Provider availability, final scope and pricing require confirmation.",
    "icon": "Sparkles",
    "basePrice": 0,
    "duration": 60
  },
  {
    "name": "Rodent Control",
    "slug": "rodent-control",
    "categorySlug": "pest-control",
    "description": "Planned rodent control service. Provider availability, final scope and pricing require confirmation.",
    "icon": "Sparkles",
    "basePrice": 0,
    "duration": 60
  },
  {
    "name": "Carpentry",
    "slug": "carpentry",
    "categorySlug": "home-improvement",
    "description": "Planned carpentry service. Provider availability, final scope and pricing require confirmation.",
    "icon": "Hammer",
    "basePrice": 0,
    "duration": 60
  },
  {
    "name": "Tile Installation",
    "slug": "tile-installation",
    "categorySlug": "home-improvement",
    "description": "Planned tile installation service. Provider availability, final scope and pricing require confirmation.",
    "icon": "Hammer",
    "basePrice": 0,
    "duration": 60
  },
  {
    "name": "Waterproofing",
    "slug": "waterproofing",
    "categorySlug": "home-improvement",
    "description": "Planned waterproofing service. Provider availability, final scope and pricing require confirmation.",
    "icon": "Hammer",
    "basePrice": 0,
    "duration": 60
  },
  {
    "name": "Glass and Aluminium Work",
    "slug": "glass-and-aluminium-work",
    "categorySlug": "home-improvement",
    "description": "Planned glass and aluminium work service. Provider availability, final scope and pricing require confirmation.",
    "icon": "Hammer",
    "basePrice": 0,
    "duration": 60
  },
  {
    "name": "Garden Maintenance",
    "slug": "garden-maintenance",
    "categorySlug": "outdoor-maintenance",
    "description": "Planned garden maintenance service. Provider availability, final scope and pricing require confirmation.",
    "icon": "Home",
    "basePrice": 0,
    "duration": 60
  },
  {
    "name": "Water Tank Cleaning",
    "slug": "water-tank-cleaning",
    "categorySlug": "outdoor-maintenance",
    "description": "Planned water tank cleaning service. Provider availability, final scope and pricing require confirmation.",
    "icon": "Home",
    "basePrice": 0,
    "duration": 60
  },
  {
    "name": "Generator Servicing",
    "slug": "generator-servicing",
    "categorySlug": "outdoor-maintenance",
    "description": "Planned generator servicing service. Provider availability, final scope and pricing require confirmation.",
    "icon": "Home",
    "basePrice": 0,
    "duration": 60
  },
  {
    "name": "CCTV Installation",
    "slug": "cctv-installation",
    "categorySlug": "outdoor-maintenance",
    "description": "Planned cctv installation service. Provider availability, final scope and pricing require confirmation.",
    "icon": "Home",
    "basePrice": 0,
    "duration": 60
  }
];
