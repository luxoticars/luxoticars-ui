/*
  Story cases shared by the Astro stories (stories/ui/) and the Skin story
  (stories/skin/), so both are shown, and checked, with the same inputs.
  Framework-free: it imports no component.
*/
import type { ProgressStepperOrientation, ProgressStepperStep } from "../src/types";

export interface ProgressStepperCase {
  steps: ProgressStepperStep[];
  current?: number;
  orientation?: ProgressStepperOrientation;
  label?: string;
  statusLabels?: Partial<Record<"complete" | "current" | "upcoming" | "loading" | "error", string>>;
  dir?: "rtl" | "ltr";
  style?: string;
}

const checkout: ProgressStepperStep[] = [
  { label: "Vehicle" },
  { label: "Your details" },
  { label: "Payment" },
  { label: "Confirmation" },
];

const described: ProgressStepperStep[] = [
  { label: "Choose a vehicle", description: "Pick the model and trim." },
  { label: "Your details", description: "Name, phone number and licence." },
  { label: "Payment", description: "Deposit and financing." },
  { label: "Confirmation", description: "Review and book your viewing." },
];

/* Arabic, a right-to-left language the same steps read in. */
const arabic: ProgressStepperStep[] = [
  { label: "المركبة" },
  { label: "بياناتك" },
  { label: "الدفع" },
  { label: "التأكيد" },
];
const arabicStatus = { complete: "مكتملة", current: "الخطوة الحالية", upcoming: "قادمة", loading: "جارٍ التحميل", error: "خطأ" };

export const cases = {
  Horizontal: { steps: checkout, current: 1 },
  Vertical: { steps: described, current: 1, orientation: "vertical" },
  /* Nothing done yet: the first step is current and every other one is upcoming. */
  VerticalUpcoming: { steps: described, current: 0, orientation: "vertical" },
  Rtl: { steps: arabic, current: 1, label: "التقدم", statusLabels: arabicStatus, dir: "rtl" },
  VerticalRtl: {
    steps: arabic.map((step, index) => ({ ...step, description: ["اختر الطراز", "الاسم والهاتف", "العربون", "راجع واحجز"][index] })),
    current: 1,
    orientation: "vertical",
    label: "التقدم",
    statusLabels: arabicStatus,
    dir: "rtl",
  },
  Error: {
    steps: [
      { label: "Vehicle" },
      { label: "Your details" },
      { label: "Payment", state: "error", description: "Your card was declined. Try another card." },
      { label: "Confirmation" },
    ],
    current: 2,
  },
  Loading: {
    steps: [{ label: "Vehicle" }, { label: "Your details" }, { label: "Payment", state: "loading" }, { label: "Confirmation" }],
    current: 2,
  },
  Complete: { steps: checkout, current: 4 },
  /* A 20rem container: the row stacks by itself, as it does on a phone. */
  SmallViewport: { steps: described, current: 1, style: "max-width:20rem" },
} satisfies Record<string, ProgressStepperCase>;
