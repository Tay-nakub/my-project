import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  await prisma.product.update({
    where: {id},
    data: { deletedAt: new Date() }
  });
  return Response.json({ message: "Product deleted successfully" });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: {
      id,
    },
  });
  if (!product) {
    return Response.json({ message: "Product not found" }, { status: 404 });
  }
  return Response.json(product);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const data = await request.json();
  const updatedProduct = await prisma.product.update({
    where: {
      id,
    },
    data,
  });
  return Response.json(updatedProduct);
}

// import { prisma } from "@/lib/prisma";

// export async function DELETE(
//   request: Request,
//   { params }: { params: { id: string } },
// ) {
//     console.log("Deleting product with id:", params.id);

//   const { id } = await params;
//   await prisma.product.delete({
//     where: {
//       id,
//     },
//   });
//   return Response.json({ message: "Product deleted successfully" });
// }
// export async function GET(
//   request: Request,
//   { params }: { params: Promise<{ id: string }> },
// ) {
//   const { id } = await params;
//   const product = await prisma.product.findUnique({
//     where: {
//       id,
//     },
//   });
//   if (!product) {
//     return Response.json({ message: "Product not found" }, { status: 404 });
//   }
//   return Response.json(product);
// }