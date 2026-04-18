const { PrismaClient, BookingStatus, PaymentStatus, Role } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

function money(value) {
  return Number(value.toFixed(2));
}

function breakdown(totalPrice) {
  const depositDueNow = money(totalPrice * 0.4);
  const remainingBalance = money(totalPrice - depositDueNow);
  return { depositDueNow, remainingBalance };
}

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
  const existing = await prisma.car.findFirst({
    where: {
      brand: data.brand,
      model: data.model,
      year: data.year,
    },
  });

  if (existing) {
    return prisma.car.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.car.create({ data });
}

async function upsertBooking({
  userId,
  carId,
  startDate,
  endDate,
  totalPrice,
  status,
  paymentStatus,
}) {
  const { depositDueNow, remainingBalance } = breakdown(totalPrice);
  const token = `seed-${carId}-${startDate.toISOString().slice(0, 10)}-${status}`;

  return prisma.booking.upsert({
    where: { submissionToken: token },
    update: {
      userId,
      carId,
      startDate,
      endDate,
      totalPrice,
      depositDueNow,
      remainingBalance,
      status,
      paymentStatus,
    },
    create: {
      userId,
      carId,
      startDate,
      endDate,
      totalPrice,
      depositDueNow,
      remainingBalance,
      status,
      paymentStatus,
      submissionToken: token,
    },
  });
}

async function main() {
  const admin = await ensureUser({
    name: "Bilal Admin",
    email: "admin@prestige-avenue.com",
    password: "Admin12345!",
    role: Role.ADMIN,
    phone: "+33 6 00 00 00 01",
  });

  const user1 = await ensureUser({
    name: "Nassim Client",
    email: "nassim@example.com",
    password: "Client12345!",
    role: Role.USER,
    phone: "+33 6 10 20 30 40",
  });

  const user2 = await ensureUser({
    name: "Sofia Client",
    email: "sofia@example.com",
    password: "Client12345!",
    role: Role.USER,
    phone: "+33 6 11 22 33 44",
  });

  const cars = await Promise.all([
    ensureCar({
      brand: "Audi",
      model: "A3 Sportback",
      year: 2024,
      pricePerDay: 220,
      weekendPrice: 280,
      depositAmount: 1500,
      description:
        "Compacte premium, finition S line, parfaite pour les trajets urbains et business.",
      mainImage:
        "https://images.unsplash.com/photo-1619976216263-2f2fce8f1f37?auto=format&fit=crop&w=1200&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1200&q=80",
      ],
      videoUrl: null,
      status: "AVAILABLE",
    }),
    ensureCar({
      brand: "Mercedes-Benz",
      model: "Classe C",
      year: 2023,
      pricePerDay: 290,
      weekendPrice: 350,
      depositAmount: 2200,
      description: "Berline executive avec interieur cuir et conduite confortable.",
      mainImage:
        "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1200&q=80",
      ],
      videoUrl: null,
      status: "AVAILABLE",
    }),
    ensureCar({
      brand: "BMW",
      model: "Série 4 Coupe",
      year: 2022,
      pricePerDay: 340,
      weekendPrice: 410,
      depositAmount: 2500,
      description: "Coupe sportif premium, ideal pour weekend et evenements.",
      mainImage:
        "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80",
      ],
      videoUrl: null,
      status: "AVAILABLE",
    }),
    ensureCar({
      brand: "Porsche",
      model: "Macan",
      year: 2024,
      pricePerDay: 520,
      weekendPrice: 620,
      depositAmount: 4000,
      description: "SUV performance haut de gamme pour deplacements premium.",
      mainImage:
        "https://images.unsplash.com/photo-1603386329225-868f9b1ee6c9?auto=format&fit=crop&w=1200&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1519643381401-22c77e60520e?auto=format&fit=crop&w=1200&q=80",
      ],
      videoUrl: null,
      status: "MAINTENANCE",
    }),
    ensureCar({
      brand: "Range Rover",
      model: "Velar",
      year: 2023,
      pricePerDay: 480,
      weekendPrice: 560,
      depositAmount: 3800,
      description: "SUV luxueux avec design moderne et finition premium.",
      mainImage:
        "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=1200&q=80",
      galleryImages: [
        "https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=1200&q=80",
      ],
      videoUrl: null,
      status: "AVAILABLE",
    }),
  ]);

  const audiA3 = cars.find((car) => car.brand === "Audi" && car.model === "A3 Sportback");
  const mercedes = cars.find((car) => car.brand === "Mercedes-Benz");
  const bmw = cars.find((car) => car.brand === "BMW");

  if (!audiA3 || !mercedes || !bmw) {
    throw new Error("Cars seed incomplete.");
  }

  await prisma.blockedDate.upsert({
    where: { id: "seed-blocked-audi-maintenance" },
    update: {
      carId: audiA3.id,
      startDate: new Date("2026-04-10T00:00:00.000Z"),
      endDate: new Date("2026-04-14T00:00:00.000Z"),
      reason: "Maintenance preventive",
    },
    create: {
      id: "seed-blocked-audi-maintenance",
      carId: audiA3.id,
      startDate: new Date("2026-04-10T00:00:00.000Z"),
      endDate: new Date("2026-04-14T00:00:00.000Z"),
      reason: "Maintenance preventive",
    },
  });

  await upsertBooking({
    userId: user1.id,
    carId: audiA3.id,
    startDate: new Date("2026-03-20T00:00:00.000Z"),
    endDate: new Date("2026-03-23T00:00:00.000Z"),
    totalPrice: 780,
    status: BookingStatus.CONFIRMED,
    paymentStatus: PaymentStatus.PAID,
  });

  await upsertBooking({
    userId: user2.id,
    carId: mercedes.id,
    startDate: new Date("2026-03-25T00:00:00.000Z"),
    endDate: new Date("2026-03-26T00:00:00.000Z"),
    totalPrice: 290,
    status: BookingStatus.PENDING,
    paymentStatus: PaymentStatus.UNPAID,
  });

  await upsertBooking({
    userId: user1.id,
    carId: bmw.id,
    startDate: new Date("2026-02-20T00:00:00.000Z"),
    endDate: new Date("2026-02-23T00:00:00.000Z"),
    totalPrice: 970,
    status: BookingStatus.COMPLETED,
    paymentStatus: PaymentStatus.PAID,
  });

  await upsertBooking({
    userId: admin.id,
    carId: audiA3.id,
    startDate: new Date("2026-01-16T00:00:00.000Z"),
    endDate: new Date("2026-01-19T00:00:00.000Z"),
    totalPrice: 760,
    status: BookingStatus.CANCELLED,
    paymentStatus: PaymentStatus.REFUNDED,
  });

  console.log("Seed done: cars, users, bookings, blocked dates inserted/updated.");
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
