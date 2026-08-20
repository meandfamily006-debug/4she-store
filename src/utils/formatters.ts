// Iraqi Dinar Formatter
export function formatIQD(amount: number): string {
  if (isNaN(amount) || amount === undefined || amount === null) return '0 د.ع';
  return `${amount.toLocaleString('ar-IQ')} د.ع`;
}

// Iraqi Phone Number Normalizer and Formatter
export function formatIraqiPhone(phone: string): string {
  if (!phone) return '';
  const clean = phone.replace(/[\s\-\(\)\+]/g, '');
  if (clean.length === 11 && clean.startsWith('07')) {
    return `${clean.slice(0, 4)} ${clean.slice(4, 7)} ${clean.slice(7)}`;
  }
  return phone;
}

// Iraqi Governorates List
export const IRAQI_GOVERNORATES = [
  'نينوى (الموصل)',
  'بغداد',
  'أربيل',
  'البصرة',
  'كركوك',
  'السليمانية',
  'دهوك',
  'صلاح الدين',
  'الأنبار',
  'ديالى',
  'بابل',
  'كربلاء',
  'النجف',
  'واسط',
  'القادسية (الديوانية)',
  'ذي قار (الناصرية)',
  'ميسان (العمارة)',
  'المثنى (السماوة)'
];

// Popular Mosul Districts / Neighborhoods for autocomplete
export const MOSUL_DISTRICTS = [
  'حي المثنى (أسواق المثنى)',
  'حي الزهور',
  'حي المهندسين',
  'حي السكر',
  'حي البلديات',
  'حي النور',
  'حي الحدباء',
  'حي الضباط',
  'حي الوحدة',
  'حي الشرطة',
  'حي الغابات',
  'منطقة الدواسة',
  'منطقة الجوسق',
  'منطقة الطيران',
  'حي الميثاق',
  'حي الكرامة',
  'حي العربي',
  'حي المصارف',
  'حي نينوى الشرقية'
];
