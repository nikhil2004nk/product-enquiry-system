import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Seeding database...");
  
  // 1. Seed Super Admin
  const pinHash = await bcrypt.hash("1234", 10);
  const superAdmin = await prisma.user.upsert({
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
  console.log(`✓ Super Admin user ensured: ${superAdmin.name} (${superAdmin.mobile})`);

  // 2. Ensure default Message Template exists
  const defaultTemplate = await prisma.messageTemplate.findFirst({ where: { isDefault: true } });
  if (!defaultTemplate) {
    await prisma.messageTemplate.create({
      data: {
        name: "Standard Reply",
        isDefault: true,
        content: `Hello {{customer_name}},

Thank you for your interest.

As per your inquiry regarding the {{model_number}}, please find the product catalogue below for your reference and detailed information.

📄 Product Catalogue:
{{catalogue_url}}

Please feel free to contact me if you have any questions or require any further information.

Regards,
{{admin_name}}
📞 {{admin_mobile}}`
      }
    });
    console.log(`✓ Default Message Template created.`);
  } else {
    console.log(`✓ Default Message Template already exists.`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
