"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { BookingFormData } from "@/types/booking";
import { getTierMultiplier, SERVICE_TIERS } from "@/config/service-tiers";
import { bookingsApi, servicesApi } from "@/lib/api";
import { getSubServiceById } from "@/config/sub-services";
import { storage } from "@/lib/storage";
import { useAuth } from "@/contexts/auth-context";
import { ServiceOptionsCard } from "./service-options-card";
import { AddressCard } from "./address-card";
import { PriceDetailsCard } from "./price-details-card";
import { PaymentMethodCard } from "./payment-method-card";

const bookingSchema = z.object({
  serviceId: z.string(),
  areaSize: z.string().min(1, "Area size is required"),
  tier: z.enum(["standard", "premium", "deluxe"], {
    message: "Please select a service type",
  }),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  area: z.string().min(1, "Area is required"),
  city: z.string().min(1, "City is required"),
  division: z.string().min(1, "Please select a division"),
  postalCode: z.string().min(4, "Valid postal code required"),
  additionalInfo: z.string().optional(),
  paymentMethod: z.enum(["ONLINE", "COD"], {
    message: "Please select a payment method",
  }),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerPhone: z.string().optional(),
});

// Serializable service data (no icon function)
interface ServiceData {
  id: string;
  name: string;
  price: number;
}

interface BookingFormProps {
  service: ServiceData;
  catalogOnly?: boolean;
}

export function BookingForm({ service, catalogOnly = false }: BookingFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceId: service.id,
      tier: "standard",
      areaSize: "",
      date: "",
      time: "",
      area: "",
      city: "",
      division: "",
      postalCode: "",
      additionalInfo: "",
      paymentMethod: "COD",
      customerName: user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : "",
      customerEmail: user?.email || "",
      customerPhone: "",
    },
  });

  const selectedTier = watch("tier");
  const selectedPaymentMethod = watch("paymentMethod");
  const multiplier = getTierMultiplier(selectedTier);
  const totalPrice = service.price * multiplier;
  const tierName = SERVICE_TIERS.find((t) => t.id === selectedTier)?.name || "Standard";

  const onSubmit = async (data: BookingFormData) => {
    try {
      setSubmitError(null);
      const token = storage.getAccessToken();
      if (!token) {
        // Redirect to login if not authenticated
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
        router.push(`/login?redirect=${returnUrl}`);
        return;
      }

      // For online payment, ensure customer info is provided
      if (data.paymentMethod === "ONLINE") {
        if (!data.customerName || !data.customerEmail || !data.customerPhone) {
          // Use user info from auth context
          data.customerName = data.customerName || (user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : "Customer");
          data.customerEmail = data.customerEmail || user?.email || "";
          data.customerPhone = data.customerPhone || "";
        }
      }

      // Static catalog IDs are not database UUIDs. Resolve the live service at submit time.
      let bookingData = data;
      if (catalogOnly) {
        const catalog = getSubServiceById(service.id);
        if (!catalog) throw new Error("Service not found in catalog.");
        let live;
        try {
          live = await servicesApi.getServiceBySlug(catalog.categoryId, catalog.slug);
        } catch {
          throw new Error("Booking service is temporarily unavailable. No request has been placed and no payment was taken.");
        }
        if (!live?.isActive || !(Number(live.basePrice) > 0)) {
          throw new Error("This service is not yet activated for bookings. No request has been placed.");
        }
        bookingData = {...data, serviceId: live.id};
      }
      const response = await bookingsApi.create(bookingData, token);
      const booking = response.data;

      // If online payment and gatewayUrl is provided, redirect to payment gateway
      if (data.paymentMethod === "ONLINE" && booking.gatewayUrl) {
        // Redirect to SSLCOMMERZ payment gateway
        window.location.href = booking.gatewayUrl;
        return;
      }

      // Never claim checkout has completed when gateway initiation failed.
      if (data.paymentMethod === "ONLINE" && !booking.gatewayUrl) {
        router.push(`/book/error?type=server&message=${encodeURIComponent("Booking was saved as pending but online checkout is unavailable. Do not pay again until your booking status has been checked.")}&serviceId=${encodeURIComponent(service.id)}`);
        return;
      }

      // If online payment but no gateway URL, payment initiation failed
      // Still create booking but mark payment as pending
      const paymentStatus = data.paymentMethod === "ONLINE" && !booking.gatewayUrl
        ? "PENDING"
        : booking.paymentStatus || "PENDING";

      // For COD or if no gateway URL, redirect to success page
      const params = new URLSearchParams({
        bookingId: booking.bookingId,
        service: booking.serviceName,
        tier: booking.tierName,
        price: booking.totalPrice.toString(),
        date: booking.date,
        time: booking.time,
        address: booking.address,
        status: booking.status,
        paymentMethod: booking.paymentMethod,
        paymentStatus: paymentStatus,
      });

      router.push(`/book/success?${params.toString()}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to submit booking. No payment has been taken.");
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {submitError && <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 font-medium text-red-800">{submitError}</div>}
      <input type="hidden" {...register("serviceId")} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* First Card: Service Options & Schedule */}
        <ServiceOptionsCard register={register} errors={errors} />

        {/* Second Card: Address & Additional Info */}
        <AddressCard register={register} errors={errors} />

        {/* Third Card: Payment Method */}
        <div className="space-y-6">
          <PaymentMethodCard
            register={register}
            errors={errors}
            selectedMethod={selectedPaymentMethod}
          />

          {/* Customer Info for Online Payment */}
          {selectedPaymentMethod === "ONLINE" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
              <p className="text-sm text-gray-500 mb-4">Required for payment processing</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    {...register("customerName")}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    {...register("customerEmail")}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    {...register("customerPhone")}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="01XXXXXXXXX"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fourth Card: Price Details */}
        <PriceDetailsCard
          totalPrice={totalPrice}
          basePrice={service.price}
          tierName={tierName}
          serviceName={service.name}
          isSubmitting={isSubmitting}
          onCancel={handleCancel}
          paymentMethod={selectedPaymentMethod}
        />
      </div>
    </form>
  );
}
