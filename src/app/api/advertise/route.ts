import { NextResponse } from "next/server";
import { createAdvertisement } from "@/lib/advertisements";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      advertiserName,
      contactPerson,
      email,
      mobile,
      websiteUrl,
      businessCategory,
      adTypeCode,
      placementCode,
      durationDays,
      startDate,
      targetPage,
      adTitle,
      shortDescription,
      ctaText,
      destinationUrl,
      creativeType,
      imageUrl,
      bannerImageUrl,
      logoUrl,
      altText,
      basePrice,
      placementMultiplier,
      grossAmount,
      discountPercent,
      discountAmount,
      subtotal,
      gstPercent,
      gstAmount,
      totalAmount,
    } = body;

    if (!advertiserName || !contactPerson || !email || !mobile || !adTypeCode || !placementCode || !durationDays || !adTitle || !destinationUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const requestId = "ADD-ADS-" + String(new Date().getFullYear()) + "-" + String(Math.floor(Math.random() * 900000 + 100000));

    const advertisement = await createAdvertisement({
      requestId,
      advertiserName: advertiserName.trim(),
      contactPerson: contactPerson.trim(),
      email: email.trim().toLowerCase(),
      mobile: mobile.trim(),
      websiteUrl: websiteUrl?.trim() || "",
      businessCategory: businessCategory?.trim() || "",
      adTypeCode: adTypeCode.trim(),
      placementCode: placementCode.trim(),
      durationDays: Number(durationDays),
      startDate: startDate || new Date().toISOString().split("T")[0],
      targetPage: targetPage?.trim() || "",
      adTitle: adTitle.trim(),
      shortDescription: shortDescription?.trim() || "",
      ctaText: ctaText?.trim() || "",
      destinationUrl: destinationUrl.trim(),
      creativeType: creativeType?.trim() || "link",
      imageUrl: imageUrl?.trim() || "",
      bannerImageUrl: bannerImageUrl?.trim() || "",
      logoUrl: logoUrl?.trim() || "",
      altText: altText?.trim() || "",
      basePrice: Number(basePrice) || 0,
      placementMultiplier: Number(placementMultiplier) || 1,
      grossAmount: Number(grossAmount) || 0,
      discountPercent: Number(discountPercent) || 0,
      discountAmount: Number(discountAmount) || 0,
      subtotal: Number(subtotal) || 0,
      gstPercent: Number(gstPercent) || 0,
      gstAmount: Number(gstAmount) || 0,
      totalAmount: Number(totalAmount) || 0,
      status: "PAYMENT_PENDING",
      paymentStatus: "PENDING",
      paymentMethod: "",
      utrNumber: "",
      paymentScreenshot: "",
      paymentDate: "",
      paymentTime: "",
      adminReply: "",
      internalNotes: "",
      rejectionReason: "",
      approvedAt: null,
      scheduledAt: null,
      publishedAt: null,
      expiredAt: null,
    });

    return NextResponse.json({ ok: true, request: { requestId: advertisement.requestId } });
  } catch {
    return NextResponse.json({ error: "Failed to submit advertisement request" }, { status: 500 });
  }
}
