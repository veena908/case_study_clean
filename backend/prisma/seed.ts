import { PrismaClient, Role, CustomerType, CustomerStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const DEMO_USERS: Array<{ name: string; email: string; password: string; role: Role }> = [
  { name: "Admin User", email: "admin@example.com", password: "Admin@123", role: Role.ADMIN },
  { name: "Sales User", email: "sales@example.com", password: "Sales@123", role: Role.SALES },
  { name: "Warehouse User", email: "warehouse@example.com", password: "Warehouse@123", role: Role.WAREHOUSE },
  { name: "Accounts User", email: "accounts@example.com", password: "Accounts@123", role: Role.ACCOUNTS },
];

async function main() {
  console.log("Seeding users...");
  const users: Record<string, { id: string }> = {};
  for (const u of DEMO_USERS) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const created = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { name: u.name, email: u.email, passwordHash, role: u.role },
    });
    users[u.role] = created;
  }

  console.log("Seeding products...");
  const productData = [
    { name: "Cement Bag 50kg", sku: "CEM-50", category: "Construction", unitPrice: "350.00", currentStock: 200, minStockAlert: 50, location: "Warehouse A" },
    { name: "Steel Rod 12mm", sku: "STL-12", category: "Construction", unitPrice: "620.00", currentStock: 150, minStockAlert: 30, location: "Warehouse A" },
    { name: "PVC Pipe 2 inch", sku: "PVC-02", category: "Plumbing", unitPrice: "180.00", currentStock: 40, minStockAlert: 40, location: "Warehouse B" },
    { name: "LED Bulb 9W", sku: "LED-09", category: "Electrical", unitPrice: "95.00", currentStock: 500, minStockAlert: 100, location: "Warehouse C" },
    { name: "Paint Bucket 20L", sku: "PNT-20", category: "Finishing", unitPrice: "2400.00", currentStock: 15, minStockAlert: 20, location: "Warehouse B" },
  ];
  const products = [];
  for (const p of productData) {
    products.push(
      await prisma.product.upsert({
        where: { sku: p.sku },
        update: {},
        create: p,
      })
    );
  }

  console.log("Seeding customers...");
  const customerData = [
    { name: "Ramesh Traders", mobile: "9876543210", email: "ramesh@traders.com", businessName: "Ramesh Traders Pvt Ltd", customerType: CustomerType.WHOLESALE, address: "MG Road, Hyderabad", status: CustomerStatus.ACTIVE, notes: "Regular bulk buyer" },
    { name: "Sunrise Hardware", mobile: "9876543211", email: "contact@sunrisehw.com", businessName: "Sunrise Hardware", customerType: CustomerType.RETAIL, address: "Market Street, Vijayawada", status: CustomerStatus.ACTIVE, notes: "Prefers monthly credit" },
    { name: "Deccan Distributors", mobile: "9876543212", email: "info@deccandist.com", businessName: "Deccan Distributors", customerType: CustomerType.DISTRIBUTOR, address: "Industrial Area, Warangal", status: CustomerStatus.LEAD, notes: "First contacted via trade fair" },
    { name: "Krishna Builders", mobile: "9876543213", email: "krishna@builders.com", businessName: "Krishna Builders", customerType: CustomerType.WHOLESALE, address: "Ring Road, Nizamabad", status: CustomerStatus.INACTIVE, notes: "No orders in last 6 months" },
  ];
  const customers = [];
  for (const c of customerData) {
    const existing = await prisma.customer.findFirst({ where: { mobile: c.mobile } });
    customers.push(
      existing ??
        (await prisma.customer.create({
          data: c,
        }))
    );
  }

  console.log("Seeding a follow-up note per customer...");
  for (const c of customers) {
    const noteCount = await prisma.followUpNote.count({ where: { customerId: c.id } });
    if (noteCount === 0) {
      await prisma.followUpNote.create({
        data: {
          customerId: c.id,
          note: "Initial contact logged during onboarding.",
          createdById: users[Role.SALES].id,
        },
      });
    }
  }

  console.log("Seed complete.");
  console.log("\nTest login credentials:");
  for (const u of DEMO_USERS) {
    console.log(`  ${u.role.padEnd(10)} ${u.email} / ${u.password}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
