import { z } from "zod";

const phoneRegex = /^[0-9-+\s()]+$/;
const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export const FoundPetFormSchema = z.object({
  petType: z
    .string({ required_error: "กรุณาเลือกประเภทสัตว์เลี้ยง" })
    .min(1, "กรุณาเลือกประเภทสัตว์เลี้ยง"),
  foundDate: z
    .string({ required_error: "กรุณาเลือกวันที่พบ" })
    .min(1, "กรุณาเลือกวันที่พบ"),
  location: z
    .string({ required_error: "กรุณาระบุสถานที่พบ" })
    .min(1, "กรุณาระบุสถานที่พบ"),
  province: z
    .string({ required_error: "กรุณาเลือกจังหวัด" })
    .min(1, "กรุณาเลือกจังหวัด"),
  details: z.string().optional(),
  contactName: z
    .string({ required_error: "กรุณาระบุชื่อผู้แจ้ง" })
    .min(1, "กรุณาระบุชื่อผู้แจ้ง"),
  contactPhone: z
    .string()
    .min(1, "กรุณาระบุเบอร์โทรศัพท์")
    .regex(phoneRegex, "กรุณาระบุเบอร์โทรศัพท์ที่ถูกต้อง"),
  contactEmail: z
    .string()
    .min(1, "กรุณาระบุอีเมล")
    .regex(emailRegex, "กรุณาระบุอีเมลที่ถูกต้อง"),
  sex: z.string({ required_error: "กรุณาเลือกเพศ" }).min(1, "กรุณาเลือกเพศ"),
  hasCollar: z.boolean(),
  breed: z.string().optional(),
  pattern: z.string().optional(),
  colors: z.array(z.string()).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  images: z.array(z.any()).optional(),
});

export type FoundPetFormInputs = z.infer<typeof FoundPetFormSchema>;
