/** All 77 districts of Nepal, grouped by province, English + Nepali. */
export interface District {
  en: string;
  ne: string;
  province: string;
}

export const DISTRICTS: District[] = [
  // Koshi
  { en: 'Bhojpur', ne: 'भोजपुर', province: 'Koshi' },
  { en: 'Dhankuta', ne: 'धनकुटा', province: 'Koshi' },
  { en: 'Ilam', ne: 'इलाम', province: 'Koshi' },
  { en: 'Jhapa', ne: 'झापा', province: 'Koshi' },
  { en: 'Khotang', ne: 'खोटाङ', province: 'Koshi' },
  { en: 'Morang', ne: 'मोरङ', province: 'Koshi' },
  { en: 'Okhaldhunga', ne: 'ओखलढुङ्गा', province: 'Koshi' },
  { en: 'Panchthar', ne: 'पाँचथर', province: 'Koshi' },
  { en: 'Sankhuwasabha', ne: 'संखुवासभा', province: 'Koshi' },
  { en: 'Solukhumbu', ne: 'सोलुखुम्बु', province: 'Koshi' },
  { en: 'Sunsari', ne: 'सुनसरी', province: 'Koshi' },
  { en: 'Taplejung', ne: 'ताप्लेजुङ', province: 'Koshi' },
  { en: 'Terhathum', ne: 'तेह्रथुम', province: 'Koshi' },
  { en: 'Udayapur', ne: 'उदयपुर', province: 'Koshi' },
  // Madhesh
  { en: 'Bara', ne: 'बारा', province: 'Madhesh' },
  { en: 'Dhanusha', ne: 'धनुषा', province: 'Madhesh' },
  { en: 'Mahottari', ne: 'महोत्तरी', province: 'Madhesh' },
  { en: 'Parsa', ne: 'पर्सा', province: 'Madhesh' },
  { en: 'Rautahat', ne: 'रौतहट', province: 'Madhesh' },
  { en: 'Saptari', ne: 'सप्तरी', province: 'Madhesh' },
  { en: 'Sarlahi', ne: 'सर्लाही', province: 'Madhesh' },
  { en: 'Siraha', ne: 'सिराहा', province: 'Madhesh' },
  // Bagmati
  { en: 'Bhaktapur', ne: 'भक्तपुर', province: 'Bagmati' },
  { en: 'Chitwan', ne: 'चितवन', province: 'Bagmati' },
  { en: 'Dhading', ne: 'धादिङ', province: 'Bagmati' },
  { en: 'Dolakha', ne: 'दोलखा', province: 'Bagmati' },
  { en: 'Kathmandu', ne: 'काठमाडौँ', province: 'Bagmati' },
  { en: 'Kavrepalanchok', ne: 'काभ्रेपलाञ्चोक', province: 'Bagmati' },
  { en: 'Lalitpur', ne: 'ललितपुर', province: 'Bagmati' },
  { en: 'Makwanpur', ne: 'मकवानपुर', province: 'Bagmati' },
  { en: 'Nuwakot', ne: 'नुवाकोट', province: 'Bagmati' },
  { en: 'Ramechhap', ne: 'रामेछाप', province: 'Bagmati' },
  { en: 'Rasuwa', ne: 'रसुवा', province: 'Bagmati' },
  { en: 'Sindhuli', ne: 'सिन्धुली', province: 'Bagmati' },
  { en: 'Sindhupalchok', ne: 'सिन्धुपाल्चोक', province: 'Bagmati' },
  // Gandaki
  { en: 'Baglung', ne: 'बागलुङ', province: 'Gandaki' },
  { en: 'Gorkha', ne: 'गोरखा', province: 'Gandaki' },
  { en: 'Kaski', ne: 'कास्की', province: 'Gandaki' },
  { en: 'Lamjung', ne: 'लमजुङ', province: 'Gandaki' },
  { en: 'Manang', ne: 'मनाङ', province: 'Gandaki' },
  { en: 'Mustang', ne: 'मुस्ताङ', province: 'Gandaki' },
  { en: 'Myagdi', ne: 'म्याग्दी', province: 'Gandaki' },
  { en: 'Nawalpur', ne: 'नवलपुर', province: 'Gandaki' },
  { en: 'Parbat', ne: 'पर्वत', province: 'Gandaki' },
  { en: 'Syangja', ne: 'स्याङ्जा', province: 'Gandaki' },
  { en: 'Tanahun', ne: 'तनहुँ', province: 'Gandaki' },
  // Lumbini
  { en: 'Arghakhanchi', ne: 'अर्घाखाँची', province: 'Lumbini' },
  { en: 'Banke', ne: 'बाँके', province: 'Lumbini' },
  { en: 'Bardiya', ne: 'बर्दिया', province: 'Lumbini' },
  { en: 'Dang', ne: 'दाङ', province: 'Lumbini' },
  { en: 'Eastern Rukum', ne: 'पूर्वी रुकुम', province: 'Lumbini' },
  { en: 'Gulmi', ne: 'गुल्मी', province: 'Lumbini' },
  { en: 'Kapilvastu', ne: 'कपिलवस्तु', province: 'Lumbini' },
  { en: 'Palpa', ne: 'पाल्पा', province: 'Lumbini' },
  { en: 'Parasi', ne: 'परासी', province: 'Lumbini' },
  { en: 'Pyuthan', ne: 'प्युठान', province: 'Lumbini' },
  { en: 'Rolpa', ne: 'रोल्पा', province: 'Lumbini' },
  { en: 'Rupandehi', ne: 'रूपन्देही', province: 'Lumbini' },
  // Karnali
  { en: 'Dailekh', ne: 'दैलेख', province: 'Karnali' },
  { en: 'Dolpa', ne: 'डोल्पा', province: 'Karnali' },
  { en: 'Humla', ne: 'हुम्ला', province: 'Karnali' },
  { en: 'Jajarkot', ne: 'जाजरकोट', province: 'Karnali' },
  { en: 'Jumla', ne: 'जुम्ला', province: 'Karnali' },
  { en: 'Kalikot', ne: 'कालिकोट', province: 'Karnali' },
  { en: 'Mugu', ne: 'मुगु', province: 'Karnali' },
  { en: 'Salyan', ne: 'सल्यान', province: 'Karnali' },
  { en: 'Surkhet', ne: 'सुर्खेत', province: 'Karnali' },
  { en: 'Western Rukum', ne: 'पश्चिम रुकुम', province: 'Karnali' },
  // Sudurpashchim
  { en: 'Achham', ne: 'अछाम', province: 'Sudurpashchim' },
  { en: 'Baitadi', ne: 'बैतडी', province: 'Sudurpashchim' },
  { en: 'Bajhang', ne: 'बझाङ', province: 'Sudurpashchim' },
  { en: 'Bajura', ne: 'बाजुरा', province: 'Sudurpashchim' },
  { en: 'Dadeldhura', ne: 'डडेलधुरा', province: 'Sudurpashchim' },
  { en: 'Darchula', ne: 'दार्चुला', province: 'Sudurpashchim' },
  { en: 'Doti', ne: 'डोटी', province: 'Sudurpashchim' },
  { en: 'Kailali', ne: 'कैलाली', province: 'Sudurpashchim' },
  { en: 'Kanchanpur', ne: 'कञ्चनपुर', province: 'Sudurpashchim' },
];

/**
 * Districts are stored in the Sheet in English so both languages can filter on
 * the same value. This finds a district whatever language it was typed in.
 */
export function findDistrict(value: string): District | undefined {
  const v = value.trim().toLowerCase();
  return DISTRICTS.find((d) => d.en.toLowerCase() === v || d.ne === value.trim());
}
