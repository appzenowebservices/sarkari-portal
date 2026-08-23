import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { getJobsCollection } from "@/db";
import { slugify } from "@/lib/utils";
import { saveCompany } from "@/lib/data";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const jobs = await getJobsCollection();

    const slug = slugify(body.titleEn || body.titleHi || `draft-${Date.now()}`);
    const existing = await jobs.findOne({ slug });

    // Save company data if it's a new company (private job)
    if (body.jobType === "private" && body.companyName) {
      const companyName = String(body.companyName).trim();
      if (companyName.length >= 3) {
        await saveCompany({
          name: companyName,
          website: String(body.companyWebsite || "").trim(),
          industry: String(body.companyIndustry || "").trim(),
          size: String(body.companySize || "").trim(),
          location: String(body.companyLocation || "").trim(),
          recruiterName: String(body.recruiterName || "").trim(),
          recruiterEmail: String(body.recruiterEmail || "").trim(),
          recruiterPhone: String(body.recruiterPhone || "").trim(),
        }).catch(() => {});
      }
    }

    if (existing) {
      const patch: Record<string, unknown> = {
        titleHi: body.titleHi || body.titleEn || "",
        titleEn: body.titleEn || body.titleHi || "",
        blocks: body.blocks || [],
        updatedAt: new Date(),
      };

      // Private job fields
      if (body.jobType === "private") {
        patch.jobType = "private";
        patch.companyNameEn = body.companyName || "";
        patch.companyNameHi = body.companyName || "";
        patch.companyLogo = body.companyLogo || "";
        patch.companyWebsite = body.companyWebsite || "";
        patch.companyIndustry = body.companyIndustry || "";
        patch.companySize = body.companySize || "";
        patch.companyLocation = body.companyLocation || "";
        patch.recruiterName = body.recruiterName || "";
        patch.recruiterEmail = body.recruiterEmail || "";
        patch.recruiterPhone = body.recruiterPhone || "";
        patch.employmentType = body.employmentType || "";
        patch.workMode = body.workMode || "";
        patch.vacancies = body.vacancies;
        patch.experienceFrom = body.experienceFrom;
        patch.experienceTo = body.experienceTo;
        patch.qualifications = body.qualifications || [];
        patch.salaryType = body.salaryType || "";
        patch.salaryMin = body.salaryMin;
        patch.salaryMax = body.salaryMax;
        patch.salaryPeriod = body.salaryPeriod || "";
        patch.salaryNotDisclose = body.salaryNotDisclose === true;
        patch.salaryNegotiable = body.salaryNegotiable === true;
        patch.incentives = body.incentives || "";
        patch.benefits = body.benefits || [];
        patch.applyMethod = body.applyMethod || "";
        patch.externalUrl = body.externalUrl || "";
        patch.applicationEmail = body.applicationEmail || "";
        patch.applicationInstructions = body.applicationInstructions || "";
      } else {
        patch.jobType = String(body.jobType ?? "government").trim();
        patch.organizationNameHi = body.organization || "";
        patch.organizationNameEn = body.organization || "";
        patch.organizationId = body.organizationId || undefined;
        patch.categoryId = body.categoryId || undefined;
        patch.categoryNameHi = body.categoryName || "";
        patch.categoryNameEn = body.categoryName || "";
        patch.totalVacancies = body.totalVacancies;
        patch.minimumAge = body.minimumAge;
        patch.maximumAge = body.maximumAge;
        patch.applicationFeeGeneral = body.applicationFeeGeneral;
        patch.applicationFeeOBC = body.applicationFeeOBC;
        patch.applicationFeeSC = body.applicationFeeSC;
        patch.applicationFeeST = body.applicationFeeST;
        patch.state = body.state || "";
        patch.locationNames = body.locationNames || [];
        patch.applicationStartDate = body.applicationStartDate || "";
        patch.applicationLastDate = body.applicationLastDate || "";
        patch.applyUrl = body.applyUrl || "";
        patch.notificationUrl = body.notificationUrl || "";
      }

      await jobs.updateOne({ _id: existing._id }, { $set: patch });
    } else {
      const doc: Record<string, unknown> = {
        slug,
        titleHi: body.titleHi || body.titleEn || "",
        titleEn: body.titleEn || body.titleHi || "",
        blocks: body.blocks || [],
        status: "draft",
        isActive: false,
        viewCount: 0,
        applyClickCount: 0,
        notificationClickCount: 0,
        websiteClickCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      doc.jobType = String(body.jobType ?? "government").trim();

      if (doc.jobType === "private") {
        doc.companyNameEn = body.companyName || "";
        doc.companyNameHi = body.companyName || "";
        doc.companyLogo = body.companyLogo || "";
        doc.companyWebsite = body.companyWebsite || "";
        doc.companyIndustry = body.companyIndustry || "";
        doc.companySize = body.companySize || "";
        doc.companyLocation = body.companyLocation || "";
        doc.recruiterName = body.recruiterName || "";
        doc.recruiterEmail = body.recruiterEmail || "";
        doc.recruiterPhone = body.recruiterPhone || "";
        doc.employmentType = body.employmentType || "";
        doc.workMode = body.workMode || "";
        doc.vacancies = body.vacancies;
        doc.experienceFrom = body.experienceFrom;
        doc.experienceTo = body.experienceTo;
        doc.qualifications = body.qualifications || [];
        doc.salaryType = body.salaryType || "";
        doc.salaryMin = body.salaryMin;
        doc.salaryMax = body.salaryMax;
        doc.salaryPeriod = body.salaryPeriod || "";
        doc.salaryNotDisclose = body.salaryNotDisclose === true;
        doc.salaryNegotiable = body.salaryNegotiable === true;
        doc.incentives = body.incentives || "";
        doc.benefits = body.benefits || [];
        doc.applyMethod = body.applyMethod || "";
        doc.externalUrl = body.externalUrl || "";
        doc.applicationEmail = body.applicationEmail || "";
        doc.applicationInstructions = body.applicationInstructions || "";
      }

      await jobs.insertOne(doc);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Autosave failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
