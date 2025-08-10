export const catColorOptions = [
  { value: 'white', label: 'สีขาว' },
  { value: 'black', label: 'สีดำ' },
  { value: 'orange', label: 'สีส้ม' },
  { value: 'gray', label: 'สีเทา' },
  { value: 'brown', label: 'สีน้ำตาล' },
  { value: 'silver', label: 'สีน้ำเงินหม่น' },
  { value: 'cream', label: 'สีครีม' },
];

export const dogColorOptions = [
  { value: 'white', label: 'ขาว' },
  { value: 'black', label: 'ดำ' },
  { value: 'brown', label: 'น้ำตาล' },
  { value: 'cream', label: 'ครีม' },
  { value: 'gray', label: 'เทา' },
  { value: 'golden', label: 'ทอง' },
  { value: 'reddish', label: 'แดง' },
  { value: 'yellow', label: 'เหลือง' },
];

export const petColorOptions = [...catColorOptions, ...dogColorOptions];

export const catBreedOptions = [
  { value: 'thai', label: 'ไทย' },
  { value: 'persian', label: 'เปอร์เซีย' },
  { value: 'siamese', label: 'สยาม' },
  { value: 'british_shorthair', label: 'บริติช ชอร์ตแฮร์' },
  { value: 'maine_coon', label: 'เมนคูน' },
  { value: 'ragdoll', label: 'แร็กดอล' },
  { value: 'bengal', label: 'เบงกอล' },
  { value: 'unknown', label: 'ไม่สามารถระบุได้' },
  { value: 'custom', label: 'อื่นๆ' },
];

export const dogBreedOptions = [
  { value: 'thai_ridgeback', label: 'ไทยหลังอาน' },
  { value: 'bangkaew', label: 'บางแก้ว' },
  { value: 'pomeranian', label: 'ปอมเมอเรเนียน' },
  { value: 'chihuahua', label: 'ชิวาวา' },
  { value: 'shih_tzu', label: 'ชิสุ' },
  { value: 'poodle', label: 'พุดเดิ้ล' },
  { value: 'bulldog', label: 'บูลด็อก' },
  { value: 'beagle', label: 'บีเกิ้ล' },
  { value: 'unknown', label: 'ไม่สามารถระบุได้' },
  { value: 'custom', label: 'อื่นๆ' },
];

export const petBreedOptions = [...catBreedOptions, ...dogBreedOptions] as const;

export const catPatternOptions = [
  { value: 'calico', label: 'สามสี (Calico)' },
  { value: 'tabby', label: 'ลายสลิด / เสือ (Tabby)' },
  { value: 'tuxedo', label: 'ลายวัว' },
  { value: 'tortoiseshell', label: 'ลายเปรอะ' },
  { value: 'points', label: 'ลายแต้ม (Points pattern)' },
  { value: 'solid', label: 'ไม่มีลาย (Solid)' },
  { value: 'other', label: 'อื่นๆ' },
];

export const dogPatternOptions = [
  { value: 'solid', label: 'สีเดียว (Solid color)' },
  { value: 'bicolor', label: 'สองสี (Bicolor / Two-tone)' },
  { value: 'tricolor', label: 'สามสี (Tricolor)' },
  { value: 'spotted', label: 'ลายจุด (Spotted)' },
  { value: 'other', label: 'อื่นๆ' },
];

export const petPatternOptions = [
  ...catPatternOptions,
  ...dogPatternOptions,
] as const;

export const petTypes = [
  { value: 'cat', label: 'แมว' },
  { value: 'dog', label: 'สุนัข' },
] as const;
