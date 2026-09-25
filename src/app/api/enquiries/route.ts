import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, mobile, productId, notes, templateId } = body;

    // 1. Verify Authentication for "ADMIN" source
    const sessionCookie = request.cookies.get("admin_session");
    let source = "PUBLIC";
    
    if (sessionCookie?.value) {
      const payload = await verifyJwt(sessionCookie.value);
      if (payload?.role === "ADMIN") {
        source = "ADMIN";
      }
    }

    // 2. Validate data
    if (!customerName || !mobile || !productId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return NextResponse.json(
        { error: "Invalid mobile number" },
        { status: 400 }
      );
    }

    // 3. Find product and catalogue
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // 4. Find or create customer
    const customer = await prisma.customer.upsert({
      where: { mobile },
      update: { name: customerName },
      create: {
        name: customerName,
        mobile,
      },
    });

    // 5. Create enquiry
    const enquiry = await prisma.enquiry.create({
      data: {
        customerId: customer.id,
        productId: product.id,
        notes,
        status: "NEW",
        source, // ADMIN or PUBLIC
      } as any,
    });

    // 6. Generate WhatsApp message
    const catalogueUrl = product.pdfUrl || product.category.catalogueUrl || "Not available";
    
    // Fetch template from settings or use default
    let templateSetting = null;
    if (templateId) {
      templateSetting = await (prisma as any).messageTemplate.findUnique({ where: { id: templateId } });
    }
    if (!templateSetting) {
      templateSetting = await (prisma as any).messageTemplate.findFirst({ where: { isDefault: true } });
    }
    const defaultTemplate = `Hello {{customer_name}},

Thank you for visiting our store.

As per your inquiry regarding the {{model_number}}, please find the product catalogue below for your reference and detailed information.

📄 Product Catalogue:
{{catalogue_url}}

Please feel free to contact me if you have any questions or require any further information.

Regards,
{{admin_name}}
📞 {{admin_mobile}}`;
    
    const template = templateSetting?.content || defaultTemplate;
    
    // Get admin details
    let adminName = "Store Assistant";
    let adminMobile = "Our Store";
    
    if (sessionCookie?.value) {
      const payload = await verifyJwt(sessionCookie.value);
      if (payload?.id) {
        const adminUser = await (prisma as any).user.findUnique({ where: { id: payload.id as string } });
        if (adminUser) {
          adminName = adminUser.name;
          adminMobile = adminUser.mobile;
        }
      }
    } else {
      // If public request, maybe pick the first admin as fallback
      const fallbackAdmin = await (prisma as any).user.findFirst();
      if (fallbackAdmin) {
        adminName = fallbackAdmin.name;
        adminMobile = fallbackAdmin.mobile;
      }
    }

    let messageText = template
      .replace(/\{\{customer_name\}\}/g, customer.name)
      .replace(/\{\{model_number\}\}/g, product.modelNumber)
      .replace(/\{\{catalogue_url\}\}/g, catalogueUrl)
      .replace(/\{\{admin_name\}\}/g, adminName)
      .replace(/\{\{admin_mobile\}\}/g, adminMobile);


    // 6. Generate WhatsApp URL
    // Prepend '91' for India since the validation ensures a 10-digit Indian number
    const whatsappNumber = `91${mobile}`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageText)}`;

    return NextResponse.json({
      success: true,
      enquiryId: enquiry.id,
      whatsappUrl,
    });
  } catch (error) {
    console.error("Failed to create enquiry:", error);

    return NextResponse.json(
      { error: "Failed to create enquiry" },
      { status: 500 }
    );
  }
}
