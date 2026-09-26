import { prisma } from "./src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const pinHash = await bcrypt.hash("1234", 10);
  const user = await prisma.user.upsert({
    where: { mobile: "9324302421" },
    update: {
      name: "Nikhil kushwaha",
      pinHash,
      role: "SUPERADMIN"
    },
    create: {
      name: "Nikhil kushwaha",
      mobile: "9324302421",
      pinHash,
      role: "SUPERADMIN"
    }
  });
  console.log("Super admin created:", user.name, "with role", user.role);
}

main()
  .catch(console.error);
