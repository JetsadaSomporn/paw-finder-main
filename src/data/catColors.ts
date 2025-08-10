export const catColors = [
  { value: "white", label: "สีขาว" },
  { value: "black", label: "สีดำ" },
  { value: "orange", label: "สีส้ม" },
  { value: "gray", label: "สีเทา" },
  { value: "brown", label: "สีน้ำตาล" },
  { value: "calico", label: "สามสี (Calico)" },
  { value: "tabby", label: "ลายแทบบี้" },
  { value: "tuxedo", label: "ขาว-ดำ (Tuxedo)" },
  { value: "tortoiseshell", label: "ลายกระ (Tortoiseshell)" },
  { value: "siamese-point", label: "จุดซีแอม (Siamese Point)" },
  { value: "other", label: "อื่นๆ" },
] as const;

export type CatColor = (typeof catColors)[number]["value"];
