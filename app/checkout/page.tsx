"use client";

import { cartAtom } from "@/lib/cart";
import { useMutation } from "@tanstack/react-query";
import { useAtom } from "jotai/react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";


type  CheckoutFormData = {
  name: string;
  email: string;
  address: string;
  phone: string;
};

const CheckoutPage = () => {
  const [carts] = useAtom(cartAtom);
  const total = carts.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

const { mutateAsync } = useMutation({
    mutationFn: (data: CheckoutFormData) =>
      fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...data, items: carts }),
      }).then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      }),
  });


  const { register
    , handleSubmit,
     formState: { errors, isSubmitting

      } } = useForm<CheckoutFormData>();

  const onSubmit = async (data: CheckoutFormData) => {
    console.log("Form data:", data);
    try{
        await mutateAsync(data);
        toast.success("Order created successfully!");
    } catch (error) {
        console.error("Error creating order:", error);
        //alert("Failed to create order.");
        toast.error("Failed to create order.");
    }
  };

  return (
    <div className="p-10">
      <h1 className="mb-6 text-2xl font-bold">Checkout</h1>

      {/* order summary */}
      <div className="mb-6 rounded border p-4">
        <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
        {carts.map((item) => (
          <div key={item.productId} className="mb-2 flex justify-between">
            <span>
              {item.name} x {item.quantity}
            </span>
            <span>{(item.price * item.quantity).toFixed(2)} THB</span>
          </div>
        ))}
      </div>

      {/* form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="mb-2 block font-medium">Name</label>
          <input
            className="w-full rounded border p-2"
            {...register("name", { required: "กรุณากรอกชื่อ" })}
          />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        </div>
        <div>
          <label className="mb-2 block font-medium">Email</label>
          <input
            className="w-full rounded border p-2"
            {...register("email", { required: "กรุณากรอกอีเมล" })}
          />
          {errors.email && <p className="text-red-500">{errors.email.message}</p>}
        </div>
        <div>
          <label className="mb-2 block font-medium">Address</label>
          <textarea
            className="w-full rounded border p-2"
            {...register("address", { required: "กรุณากรอกที่อยู่" })}
          />
          {errors.address && <p className="text-red-500">{errors.address.message}</p>}
        </div>
        <div>
          <label className="mb-2 block font-medium">Phone</label>
          <input
            className="w-full rounded border p-2"
            {...register("phone",)}
          />
          {errors.phone && <p className="text-red-500">{errors.phone.message}</p>}
        </div>
        <button          
        type="submit"
        disabled={isSubmitting}
          className="mt-4 w-full rounded bg-blue-600 py-3 text-white"
        >
        {isSubmitting ? "กำลังประมวลผล..." : "สั่งซื้อ"}
        </button>

      </form>

      <p>Total: {total.toFixed(2)} THB</p>
    </div>
  );
};

export default CheckoutPage;