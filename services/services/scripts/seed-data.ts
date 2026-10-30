import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Categories with features and steps
const categories = [
  {
    name: "Home Repair",
    slug: "home-repair",
    description: "General home maintenance and repair services",
    icon: "Wrench",
    sortOrder: 0,
    features: [
      { text: "Professional tools & equipment", icon: "Wrench", sortOrder: 0 },
      { text: "Skilled repair technicians", icon: "UserCheck", sortOrder: 1 },
      { text: "Quality repair materials", icon: "Hammer", sortOrder: 2 },
      { text: "Workmanship warranty", icon: "Shield", sortOrder: 3 },
      { text: "Complete job guarantee", icon: "CheckCircle", sortOrder: 4 },
    ],
    steps: [
      { stepNumber: 1, title: "Book Service", description: "Tell us what needs repair" },
      { stepNumber: 2, title: "Assessment", description: "Technician inspects and estimates" },
      { stepNumber: 3, title: "Repair Work", description: "Expert completes the repair" },
      { stepNumber: 4, title: "Final Check", description: "Quality inspection and approval" },
    ],
  },
  {
    name: "Cleaning",
    slug: "cleaning",
    description: "Professional cleaning services",
    icon: "Sparkles",
    sortOrder: 1,
    features: [
      { text: "All cleaning supplies included", icon: "SprayCan", sortOrder: 0 },
      { text: "Professional-grade equipment", icon: "Settings", sortOrder: 1 },
      { text: "Eco-friendly products", icon: "Leaf", sortOrder: 2 },
      { text: "Trained & vetted cleaners", icon: "UserCheck", sortOrder: 3 },
      { text: "Satisfaction guarantee", icon: "ThumbsUp", sortOrder: 4 },
    ],
    steps: [
      { stepNumber: 1, title: "Book Service", description: "Select cleaning type and schedule time" },
      { stepNumber: 2, title: "Team Arrives", description: "Our trained cleaners arrive on time" },
      { stepNumber: 3, title: "Deep Clean", description: "Thorough cleaning of your space" },
      { stepNumber: 4, title: "Quality Check", description: "Final walkthrough to ensure satisfaction" },
    ],
  },
  {
    name: "Electrical",
    slug: "electrical",
    description: "Licensed electricians for all electrical needs",
    icon: "Zap",
    sortOrder: 2,
    features: [
      { text: "Quality electrical parts", icon: "Zap", sortOrder: 0 },
      { text: "Certified electricians", icon: "UserCheck", sortOrder: 1 },
      { text: "Safety inspection included", icon: "ShieldCheck", sortOrder: 2 },
      { text: "Work warranty", icon: "Shield", sortOrder: 3 },
      { text: "Same-day service available", icon: "Clock", sortOrder: 4 },
    ],
    steps: [
      { stepNumber: 1, title: "Book Service", description: "Describe the electrical issue or requirement" },
      { stepNumber: 2, title: "Expert Assigned", description: "Certified electrician assigned to your job" },
      { stepNumber: 3, title: "Work Done", description: "Safe and professional installation/repair" },
      { stepNumber: 4, title: "Safety Test", description: "Complete testing and safety verification" },
    ],
  },
  {
    name: "Painting",
    slug: "painting",
    description: "Interior and exterior painting services",
    icon: "Paintbrush",
    sortOrder: 3,
    features: [
      { text: "Premium quality paint materials", icon: "Palette", sortOrder: 0 },
      { text: "Surface preparation & priming", icon: "Layers", sortOrder: 1 },
      { text: "Post-work cleanup", icon: "Sparkles", sortOrder: 2 },
      { text: "1-year service warranty", icon: "Shield", sortOrder: 3 },
      { text: "Free color consultation", icon: "MessageSquare", sortOrder: 4 },
    ],
    steps: [
      { stepNumber: 1, title: "Book Service", description: "Choose your service and schedule a convenient time" },
      { stepNumber: 2, title: "Get Quote", description: "Our expert visits and provides detailed estimation" },
      { stepNumber: 3, title: "Work Begins", description: "Professional painters complete the job" },
      { stepNumber: 4, title: "Final Review", description: "Inspect the work and confirm satisfaction" },
    ],
  },
  {
    name: "Plumbing",
    slug: "plumbing",
    description: "Professional plumbing repairs and installation",
    icon: "Droplets",
    sortOrder: 4,
    features: [
      { text: "Quality plumbing fixtures", icon: "Droplets", sortOrder: 0 },
      { text: "Experienced plumbers", icon: "UserCheck", sortOrder: 1 },
      { text: "Leak detection included", icon: "ShieldCheck", sortOrder: 2 },
      { text: "Service warranty", icon: "Shield", sortOrder: 3 },
      { text: "Emergency service available", icon: "Clock", sortOrder: 4 },
    ],
    steps: [
      { stepNumber: 1, title: "Book Service", description: "Describe the plumbing issue" },
      { stepNumber: 2, title: "Plumber Visits", description: "Expert diagnoses the problem" },
      { stepNumber: 3, title: "Repair Work", description: "Professional repair or installation" },
      { stepNumber: 4, title: "Leak Test", description: "Thorough testing to ensure no leaks" },
    ],
  },
  {
    name: "Transport",
    slug: "transport",
    description: "Moving and delivery services",
    icon: "Truck",
    sortOrder: 5,
    features: [
      { text: "Well-maintained vehicles", icon: "Truck", sortOrder: 0 },
      { text: "Packing materials included", icon: "Package", sortOrder: 1 },
      { text: "Real-time tracking", icon: "MapPin", sortOrder: 2 },
      { text: "Transit insurance", icon: "Shield", sortOrder: 3 },
      { text: "Trained moving team", icon: "Users", sortOrder: 4 },
    ],
    steps: [
      { stepNumber: 1, title: "Book Service", description: "Enter pickup and drop locations" },
      { stepNumber: 2, title: "Team Arrives", description: "Moving team arrives with vehicle" },
      { stepNumber: 3, title: "Safe Transit", description: "Careful loading and transport" },
      { stepNumber: 4, title: "Delivery", description: "Unloading and placement at destination" },
    ],
  },
];

// Services by category slug
const services: Record<string, Array<{
  name: string;
  slug: string;
  description: string;
  icon: string;
  basePrice: number;
  duration: number;
  sortOrder: number;
}>> = {
  "home-repair": [
    { name: "Furniture Repair", slug: "furniture-repair", description: "Fix broken furniture, chairs, tables, and cabinets", icon: "Hammer", basePrice: 1500, duration: 120, sortOrder: 0 },
    { name: "Door Repair", slug: "door-repair", description: "Door hinge, lock, frame repairs and adjustments", icon: "DoorOpen", basePrice: 2000, duration: 90, sortOrder: 1 },
    { name: "Window Repair", slug: "window-repair", description: "Window glass, frame, and handle repairs", icon: "LayoutGrid", basePrice: 1800, duration: 120, sortOrder: 2 },
    { name: "Roof Repair", slug: "roof-repair", description: "Roof leak repairs and waterproofing solutions", icon: "Home", basePrice: 5000, duration: 360, sortOrder: 3 },
  ],
  "cleaning": [
    { name: "Deep Cleaning", slug: "deep-cleaning", description: "Thorough deep cleaning of entire home or office", icon: "Sparkles", basePrice: 3500, duration: 300, sortOrder: 0 },
    { name: "Regular Cleaning", slug: "regular-cleaning", description: "Weekly or monthly regular cleaning service", icon: "SprayCan", basePrice: 1500, duration: 150, sortOrder: 1 },
    { name: "Kitchen Cleaning", slug: "kitchen-cleaning", description: "Deep kitchen cleaning including appliances and cabinets", icon: "CookingPot", basePrice: 2000, duration: 180, sortOrder: 2 },
    { name: "Bathroom Cleaning", slug: "bathroom-cleaning", description: "Complete bathroom sanitization and cleaning", icon: "Bath", basePrice: 1200, duration: 90, sortOrder: 3 },
  ],
  "electrical": [
    { name: "House Wiring", slug: "house-wiring", description: "Complete house electrical wiring and rewiring", icon: "Zap", basePrice: 5000, duration: 2880, sortOrder: 0 },
    { name: "Fan Installation", slug: "fan-installation", description: "Ceiling and wall fan installation and repair", icon: "Fan", basePrice: 800, duration: 45, sortOrder: 1 },
    { name: "Light Fixture", slug: "light-fixture", description: "Light fixture installation and bulb replacement", icon: "Lightbulb", basePrice: 600, duration: 45, sortOrder: 2 },
    { name: "AC Servicing", slug: "ac-servicing", description: "Air conditioner installation, repair, and servicing", icon: "Snowflake", basePrice: 1500, duration: 90, sortOrder: 3 },
  ],
  "painting": [
    { name: "Interior Painting", slug: "interior-painting", description: "Professional interior wall painting service for homes and offices", icon: "Paintbrush", basePrice: 6000, duration: 1440, sortOrder: 0 },
    { name: "Exterior Painting", slug: "exterior-painting", description: "Weather-resistant exterior wall painting for lasting protection", icon: "PaintBucket", basePrice: 8000, duration: 2880, sortOrder: 1 },
    { name: "Texture Painting", slug: "texture-painting", description: "Decorative texture and pattern painting for unique walls", icon: "Palette", basePrice: 12000, duration: 4320, sortOrder: 2 },
    { name: "Spray Painting", slug: "spray-painting", description: "Fast and even spray painting coverage for smooth finish", icon: "SprayCan", basePrice: 7500, duration: 1440, sortOrder: 3 },
  ],
  "plumbing": [
    { name: "Leak Repair", slug: "leak-repair", description: "Fix leaking pipes, faucets, and water connections", icon: "Droplets", basePrice: 1200, duration: 90, sortOrder: 0 },
    { name: "Pipe Installation", slug: "pipe-installation", description: "New pipe installation and replacement", icon: "Pipette", basePrice: 3000, duration: 180, sortOrder: 1 },
    { name: "Drain Cleaning", slug: "drain-cleaning", description: "Unclog and clean blocked drains and pipes", icon: "Waves", basePrice: 1000, duration: 90, sortOrder: 2 },
    { name: "Water Heater", slug: "water-heater", description: "Water heater installation and repair", icon: "Flame", basePrice: 4000, duration: 150, sortOrder: 3 },
  ],
  "transport": [
    { name: "House Moving", slug: "house-moving", description: "Complete house moving with packing and unpacking", icon: "Truck", basePrice: 15000, duration: 360, sortOrder: 0 },
    { name: "Office Moving", slug: "office-moving", description: "Professional office relocation service", icon: "Building2", basePrice: 20000, duration: 480, sortOrder: 1 },
    { name: "Furniture Moving", slug: "furniture-moving", description: "Safe furniture transportation and delivery", icon: "Sofa", basePrice: 5000, duration: 180, sortOrder: 2 },
    { name: "Parcel Delivery", slug: "parcel-delivery", description: "Quick and safe parcel delivery service", icon: "Package", basePrice: 500, duration: 150, sortOrder: 3 },
  ],
};

async function seed() {
  console.log("Starting seed...");

  // Delete existing data
  console.log("Deleting existing data...");
  await prisma.service.deleteMany({});
  await prisma.categoryStep.deleteMany({});
  await prisma.categoryFeature.deleteMany({});
  await prisma.serviceCategory.deleteMany({});

  // Create categories with features and steps
  console.log("Creating categories...");
  const categoryMap: Record<string, string> = {};

  for (const cat of categories) {
    const { features, steps, ...categoryData } = cat;

    const category = await prisma.serviceCategory.create({
      data: {
        ...categoryData,
        features: {
          create: features,
        },
        steps: {
          create: steps,
        },
      },
    });

    categoryMap[cat.slug] = category.id;
    console.log(`  Created category: ${category.name}`);
  }

  // Create services
  console.log("Creating services...");
  for (const [categorySlug, categoryServices] of Object.entries(services)) {
    const categoryId = categoryMap[categorySlug];
    if (!categoryId) {
      console.error(`  Category not found: ${categorySlug}`);
      continue;
    }

    for (const svc of categoryServices) {
      await prisma.service.create({
        data: {
          ...svc,
          categoryId,
        },
      });
      console.log(`  Created service: ${svc.name}`);
    }
  }

  console.log("Seed completed successfully!");
}

seed()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
