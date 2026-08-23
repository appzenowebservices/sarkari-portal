import { NextResponse } from "next/server";
import { createPrivacyRequest } from "@/lib/privacy-requests";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      fullName: string;
      email: string;
      mobile?: string;
      accountId?: string;
      requestType: string;
      subject: string;
      description: string;
      requestedDataCategories?: string[];
      currentInformation?: string;
      correctInformation?: string;
      correctionReason?: string;
      deletionScope?: string[];
      consentCategories?: string[];
      communicationPreferences?: string[];
      complaintCategory?: string;
      incidentDate?: string;
      relatedUrl?: string;
      attachment?: string;
      verificationMethod?: string;
    };

    if (!body.fullName || !body.email || !body.requestType || !body.subject || !body.description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const privacyRequest = await createPrivacyRequest({
      userId: null,
      fullName: body.fullName.trim(),
      email: body.email.trim().toLowerCase(),
      mobile: body.mobile?.trim() || "",
      accountId: body.accountId?.trim() || "",
      requestType: body.requestType,
      subject: body.subject.trim(),
      description: body.description.trim(),
      requestedDataCategories: body.requestedDataCategories || [],
      currentInformation: body.currentInformation || "",
      correctInformation: body.correctInformation || "",
      correctionReason: body.correctionReason || "",
      deletionScope: body.deletionScope || [],
      consentCategories: body.consentCategories || [],
      communicationPreferences: body.communicationPreferences || [],
      complaintCategory: body.complaintCategory || "",
      incidentDate: body.incidentDate || "",
      relatedUrl: body.relatedUrl || "",
      attachment: body.attachment || "",
      verificationMethod: body.verificationMethod || "email",
      verificationStatus: "pending",
      status: "RECEIVED",
      priority: "normal",
      assignedTo: "",
      internalNotes: "",
      reply: "",
      resolution: "",
      rejectionReason: "",
    });

    return NextResponse.json({ ok: true, request: privacyRequest });
  } catch {
    return NextResponse.json({ error: "Failed to submit privacy request" }, { status: 500 });
  }
}
