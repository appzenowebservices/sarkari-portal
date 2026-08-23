import { getActiveAdTypes } from "./ad-types";
import { getActivePlacements } from "./placements";
import { getActiveDurationPlans } from "./duration-plans";
import { getPaymentSettings } from "./payment-settings";

export async function getAdPricingData() {
  const [adTypes, placements, durationPlans, paymentSettings] = await Promise.all([
    getActiveAdTypes(),
    getActivePlacements(),
    getActiveDurationPlans(),
    getPaymentSettings(),
  ]);

  return {
    adTypes,
    placements,
    durationPlans,
    paymentSettings: paymentSettings || {
      upiEnabled: false,
      upiId: "",
      payeeName: "",
      merchantName: "",
      paymentInstructions: "",
      gstPercent: 0,
      whatsappNumber: "",
    },
  };
}
