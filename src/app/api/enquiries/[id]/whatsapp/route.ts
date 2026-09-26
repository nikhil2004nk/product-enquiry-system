import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyJwt } from "@/lib/jwt";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const url = new URL(request.url);
    const templateId = url.searchParams.get("templateId");

    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
      include: {
        customer: true,
        product: { include: { category: true } }
      }
    });

    if (!enquiry) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Auth
    const sessionCookie = request.cookies.get("admin_session");
    let adminName = "Sales Assistant";
    let adminMobile = "Our Business";

    if (sessionCookie?.value) {
      const payload = await verifyJwt(sessionCookie.value);
      if (payload?.id) {
        const adminUser = await (prisma as any).user.findUnique({ where: { id: payload.id as string } });
        if (adminUser) {
          adminName = adminUser.name;
          adminMobile = adminUser.mobile;
        }
      }
    }

    let templateSetting = null;
    if (templateId) {
      templateSetting = await (prisma as any).messageTemplate.findUnique({ where: { id: templateId } });
    }
    if (!templateSetting) {
      templateSetting = await (prisma as any).messageTemplate.findFirst({ where: { isDefault: true } });
    }

    const defaultTemplate = `Hello {{customer_name}},

Thank you for your interest.

As per your inquiry regarding the {{model_number}}, please find the product catalogue below for your reference and detailed information.

📄 Product Catalogue:
{{catalogue_url}}

Please feel free to contact me if you have any questions or require any further information.

Regards,
{{admin_name}}
📞 {{admin_mobile}}`;
    const template = templateSetting?.content || defaultTemplate;
    const catalogueUrl = enquiry.product.pdfUrl || enquiry.product.category.catalogueUrl || "Not available";

    const messageText = template
      .replace(/\{\{customer_name\}\}/g, enquiry.customer.name)
      .replace(/\{\{model_number\}\}/g, enquiry.product.modelNumber)
      .replace(/\{\{catalogue_url\}\}/g, catalogueUrl)
      .replace(/\{\{admin_name\}\}/g, adminName)
      .replace(/\{\{admin_mobile\}\}/g, adminMobile);

    const whatsappNumber = `91${enquiry.customer.mobile}`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageText)}`;

    return NextResponse.json({ url: whatsappUrl });
  } catch (err) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
