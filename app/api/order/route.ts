import { getSession } from "@/lib/auth/session";
import { OrderStatus, type Prisma } from "@/lib/generated/prisma/browser";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const orderSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "ข้อมูลสินค้าไม่ถูกต้อง"),
        quantity: z.number().int().positive("ข้อมูลสินค้าไม่ถูกต้อง"),
      }),
    )
    .min(1, "กรุณาเลือกสินค้า"),
});

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const result = orderSchema.safeParse(payload);
  const session = await getSession();

  // Allow guest checkout, but if user is logged in, we can associate the order with their account.
  // if (!session) {
  //   return Response.json(
  //     { message: "Unauthorized" },
  //     { status: 401 },
  //   );
  // }

  if (!result.success) {
    return Response.json(
      { message: result.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" },
      { status: 400 },
    );
  }

  const body = result.data;
  const items = body.items; // [ { productId: "01", quantity: 1 }, { productId: "02", quantity: 1 } ]
  // get unit price of each product
  const productIds = items.map((item) => item.productId); // ["01", "02"]
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
    },
  }); // select * from product where id in ("01", "02")
  //   const products =
  //     await prisma.$queryRaw`SELECT * from products WHERE id IN (${productIds.join(",")})`;

  const productById = new Map(products.map((product) => [product.id, product]));
  const orderItems: Prisma.OrderItemUncheckedCreateWithoutOrderInput[] =
    items.flatMap((item) => {
      const product = productById.get(item.productId);

      if (!product) {
        return [];
      }

      const orderItem = {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
      } satisfies Prisma.OrderItemUncheckedCreateWithoutOrderInput;

      return [orderItem];
    });

  if (orderItems.length !== items.length) {
    return Response.json(
      { message: "มีสินค้าบางรายการที่ไม่มีอยู่ในระบบ" },
      { status: 400 },
    );
  }

  const order = await prisma.order.create({
    data: {
      userId: session?.userId,//can be null if user is not logged in, but we still want to allow guest checkout
      name: body.name ?? "",
      address: body.address ?? "",
      status: OrderStatus.PENDING,
      items: {
        create: orderItems,
      },
    },
    include: { items: true }, // join order_items
  }); // insert into order (userId, name, address, status) values (...) => orderId = 123
  // insert into order_items (orderId, productId, quantity, unitPrice) values (123, "01", 1, 10), (123, "02", 1, 20)
  // select * from order join order_items on order.id = order_items.orderId where order.id = 123
  return Response.json(order);
}


// import { OrderStatus } from "@/lib/generated/prisma/browser";
// import { prisma } from "@/lib/prisma";


// type ItemInput = {
//   productId: string;
//   quantity: number;
// };

// export async function POST(request: Request) {
//   const body = (await request.json()) as {
//     userId?: string;
//     name?: string;
//     address?: string;
//     items?: ItemInput[]; // [ { productId: "01", quantity: 1 }, { productId: "02", quantity: 1 } ]
//   };
//   // get price of each product
//   const productIds = body.items?.map((item) => item.productId) || []; // ["01", "02"]
//   const products = await prisma.product.findMany({
//     where: {
//       id: { in: productIds },
//     },
//   }); // select * from product where id in ("01", "02")
//   //   const products =
//   //     await prisma.$queryRaw`SELECT * from products WHERE id IN (${productIds.join(",")})`;

//   const order = await prisma.order.create({
//     data: {
//       userId: body.userId,
//       name: body.name ?? "", // => ?? = null, undefined => ""
//       address: body.address || "", // || = null, undefined, "", 0 => ""
//       status: OrderStatus.PENDING,
//       items: {
//         create:
//           body.items?.map((item) => {
//             const product = products.find((p) => p.id === item.productId);
//             return {
//               productId: item.productId,
//               quantity: item.quantity,
//               unitPrice: product ? product.price : 0,
//             };
//           }) || [],
//       },
//     },
//     include: { items: true }, // join order_items
//   }); // insert into order (userId, name, address, status) values (...) => orderId = 123
//   // insert into order_items (orderId, productId, quantity, unitPrice) values (123, "01", 1, 10), (123, "02", 1, 20)
//   // select * from order join order_items on order.id = order_items.orderId where order.id = 123
//   return Response.json(order);
// }