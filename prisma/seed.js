const { PrismaClient, Role } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function ensureUser({ name, email, password, role, phone }) {
  const hashedPassword = await bcrypt.hash(password, 12);
  return prisma.user.upsert({
    where: { email },
    update: {
      name,
      password: hashedPassword,
      role,
      phone,
    },
    create: {
      name,
      email,
      password: hashedPassword,
      role,
      phone,
    },
  });
}

async function ensureCar(data) {
  // Upsert by slug so re-running the seed is idempotent and IDs stay stable
  // across runs — otherwise URLs and Next.js caches break after each re-seed.
  return prisma.car.upsert({
    where: { slug: data.slug },
    update: data,
    create: data,
  });
}

async function main() {
  await ensureUser({
    name: "Bilal Admin",
    email: "admin@prestige-avenue.com",
    password: "Admin12345!",
    role: Role.ADMIN,
    phone: "+33 6 00 00 00 01",
  });

  await ensureUser({
    name: "Nassim Client",
    email: "nassim@example.com",
    password: "Client12345!",
    role: Role.USER,
    phone: "+33 6 10 20 30 40",
  });

  await ensureUser({
    name: "Sofia Client",
    email: "sofia@example.com",
    password: "Client12345!",
    role: Role.USER,
    phone: "+33 6 11 22 33 44",
  });

  await ensureCar({
    slug: "renault-clio-6-alpine",
    brand: "Renault",
    model: "Clio 6",
    trim: "Esprit Alpine",
    year: 2025,
    category: "CITADINE",
    power: 156,
    transmission: "AUTOMATIC",
    fuelType: "HYBRID",
    seats: 5,
    doors: 5,
    pricePerDay: 34.99,
    pricePerKm: 0.3,
    includedKmPerDay: 200,
    weekendPackagePrice: 320.0,
    weekendPackageIncludedKm: 600,
    depositAmount: 1500.0,
    minDriverAge: 21,
    minLicenseYears: 2,
    shortTagline:
      "La citadine statutaire : lignes élégantes et technologies embarquées.",
    description:
      "La Renault Clio affirme une vision plus statutaire de la citadine : lignes élégantes, technologies embarquées intuitives et finitions soignées s'unissent pour offrir un confort haut de gamme et une présence qui dépasse largement son format compact.",
    highlights: [
      "156 ch",
      "29 aides à la conduite",
      "Profil coupé hybride",
      "Finitions Esprit Alpine",
    ],
    features: [
      {
        title: "Sécurité augmentée",
        body: "Nouvelle Clio propose 29 systèmes avancés d'aide à la conduite qui rendent votre expérience au volant plus sûre. En complément, les dispositifs safety score et safety coach fournissent des conseils personnalisés pour optimiser votre conduite.",
      },
      {
        title: "Lignes sportives",
        body: "Le profil « coupé » de la citadine hybride réinvente les codes du segment. Feux traités comme des éléments esthétiques à part entière, découpe des vitres et becquet lui confèrent une silhouette sportive et une énergie latine.",
      },
    ],
    mainImage:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=1600&q=80",
    ],
    videoUrl: null,
    status: "AVAILABLE",
    isFeatured: true,
    displayOrder: 1,
  });

  await ensureCar({
    slug: "audi-a3-sportback-2025",
    brand: "Audi",
    model: "A3 Sportback",
    trim: "TFSI e S line",
    year: 2025,
    category: "COMPACTE",
    power: 272,
    transmission: "AUTOMATIC",
    fuelType: "PLUG_IN_HYBRID",
    seats: 5,
    doors: 5,
    pricePerDay: 39.99,
    pricePerKm: 0.3,
    includedKmPerDay: 200,
    weekendPackagePrice: 490.0,
    weekendPackageIncludedKm: 600,
    depositAmount: 2500.0,
    minDriverAge: 23,
    minLicenseYears: 3,
    shortTagline:
      "L'hybride rechargeable premium, 272 ch et jusqu'à 142 km en électrique.",
    description:
      "Prenez le volant de la Nouvelle Audi A3 Sportback TFSI e et entrez dans une nouvelle ère de performance. Jusqu'à 142 km d'autonomie en électrique, une technologie de pointe et un design athlétique qui attire tous les regards. L'hybride rechargeable allie puissance, efficience et réduction des émissions pour transformer chacun de vos trajets en expérience premium.",
    highlights: [
      "272 ch",
      "142 km d'autonomie électrique",
      "Cockpit digital",
      "Hybride rechargeable",
    ],
    features: [
      {
        title: "Une expérience de conduite intelligente",
        body: "L'intérieur de l'Audi A3 Sportback propose un cockpit digital orienté vers le conducteur, des écrans haute définition, des matériaux soigneusement travaillés et un éclairage d'ambiance élégant qui rendent chaque trajet aussi confortable que technologique.",
      },
      {
        title: "La référence des compactes premium",
        body: "L'Audi A3 Sportback combine un design sportif affirmé, des technologies de dernière génération et un intérieur raffiné pour offrir une expérience de conduite aussi dynamique qu'élégante, parfaite pour le quotidien comme pour les grands trajets.",
      },
    ],
    mainImage:
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=1600&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1541443131876-44b03de101c5?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=1600&q=80",
    ],
    videoUrl: null,
    status: "AVAILABLE",
    isFeatured: true,
    displayOrder: 2,
  });

  await ensureCar({
    slug: "renault-clio-5-alpine",
    brand: "Renault",
    model: "Clio 5",
    trim: "Esprit Alpine",
    year: 2024,
    category: "CITADINE",
    power: 145,
    transmission: "AUTOMATIC",
    fuelType: "HYBRID",
    seats: 5,
    doors: 5,
    pricePerDay: 29.99,
    pricePerKm: 0.3,
    includedKmPerDay: 200,
    weekendPackagePrice: 280.0,
    weekendPackageIncludedKm: 600,
    depositAmount: 1500.0,
    minDriverAge: 21,
    minLicenseYears: 2,
    shortTagline:
      "Le sport chic à portée de main, jusqu'à 80% électrique en ville.",
    description:
      "La Renault Clio 5 finition Alpine ne passe jamais inaperçue : look sportif, détails exclusifs et ambiance moderne à bord en font le choix parfait pour ceux qui veulent se démarquer avec style, sans compromis sur le confort.",
    highlights: [
      "145 ch",
      "80% conduite électrique en ville",
      "Jantes Alpine 17\"",
      "Finitions bleu/blanc/rouge",
    ],
    features: [
      {
        title: "Version Esprit Alpine",
        body: "Un style incisif et stimulant : flancs sculptés, calandre élargie gris chromée, éclairage full LED en forme de demi losange à l'avant. La sportivité s'exprime dans la version Esprit Alpine. Jantes la flèche 17'', badge spécifique et lame F1 gris schiste mat emblématique pour l'extérieur. À l'intérieur, selleries parées du logo Alpine brodé, de surpiqûres et écusson spécifiques. Les coutures bleu/blanc/rouge du volant font référence à l'ADN Esprit Alpine.",
      },
      {
        title: "Le sport chic à portée de main",
        body: "La Renault Clio 5 en version Alpine combine caractère, élégance et technologies modernes pour offrir une citadine qui attire tous les regards et transforme chaque trajet en moment privilégié.",
      },
    ],
    mainImage:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1600&q=80",
      "https://images.unsplash.com/photo-1608889476561-6242cfdbf622?auto=format&fit=crop&w=1600&q=80",
    ],
    videoUrl: null,
    status: "AVAILABLE",
    isFeatured: true,
    displayOrder: 3,
  });

  console.log("Seed done: 3 cars + admin & test users (idempotent).");
  console.log("Admin login: admin@prestige-avenue.com / Admin12345!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
