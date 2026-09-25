import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, mobile, productId, notes } = body;

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

    // 5. Generate WhatsApp message
    const catalogueUrl = product.pdfUrl || product.category.catalogueUrl;
    
    let messageText = `Hello ${customer.name},\n\nThank you for your enquiry regarding the ${product.category.name} model ${product.modelNumber}.`;
    
    if (catalogueUrl) {
      messageText += `\n\nHere is the catalogue you requested:\n${catalogueUrl}`;
    }

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
