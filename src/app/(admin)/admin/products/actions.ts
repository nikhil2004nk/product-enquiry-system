"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  const catalogueUrl = formData.get("catalogueUrl")?.toString().trim();

  if (!name) return { error: "Category name is required" };

  try {
    await prisma.category.create({
      data: {
        name,
        catalogueUrl: catalogueUrl || null,
      },
    });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create category" };
  }
}

export async function createProduct(formData: FormData) {
  const categoryId = formData.get("categoryId")?.toString();
  const modelNumber = formData.get("modelNumber")?.toString().trim();
  const productName = formData.get("productName")?.toString().trim();
  const pdfUrl = formData.get("pdfUrl")?.toString().trim();

  if (!categoryId || !modelNumber) return { error: "Category and Model Number are required" };

  try {
    await prisma.product.create({
      data: {
        categoryId,
        modelNumber,
        productName: productName || null,
        pdfUrl: pdfUrl || null,
      },
    });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create product" };
  }
}

export async function toggleProductStatus(productId: string, currentStatus: boolean) {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: { active: !currentStatus },
    });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    return { error: "Failed to toggle status" };
  }
}

export async function editCategory(id: string, formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  const catalogueUrl = formData.get("catalogueUrl")?.toString().trim();
  if (!name) return { error: "Name is required" };

  try {
    await prisma.category.update({
      where: { id },
      data: { name, catalogueUrl: catalogueUrl || null },
    });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update category" };
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({ where: { id } });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    return { error: "Cannot delete category with existing products. Delete the products first." };
  }
}

export async function editProduct(id: string, formData: FormData) {
  const modelNumber = formData.get("modelNumber")?.toString().trim();
  const productName = formData.get("productName")?.toString().trim();
  const pdfUrl = formData.get("pdfUrl")?.toString().trim();
  const categoryId = formData.get("categoryId")?.toString().trim();

  if (!modelNumber || !categoryId) return { error: "Model Number and Category are required" };

  try {
    await prisma.product.update({
      where: { id },
      data: { modelNumber, productName: productName || null, pdfUrl: pdfUrl || null, categoryId },
    });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update product" };
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({ where: { id } });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    return { error: "Cannot delete product that has existing enquiries." };
  }
}
