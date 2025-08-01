export const translations = {
  en: {
    title: "AI Graphics Generator",
    selectType: "Select Type",
    customizeStyle: "Customize Style",
    description: "Description",
    descriptionPlaceholder: "Describe what you want to create...",
    primaryColors: "Primary Colors",
    customColor: "Custom color",
    artStyle: "Art Style",
    generatedResults: {
      stickers: "Generated Stickers",
      icons: "Generated Icons",
      emojis: "Generated Emojis"
    },
    types: {
      stickers: "Stickers",
      icons: "Icons",
      emojis: "Emojis",
      stickerDesc: "4 custom stickers",
      iconDesc: "8 custom icons",
      emojiDesc: "8 custom emojis"
    },
    styles: {
      cartoon: "Cartoon",
      realistic: "Realistic",
      minimalist: "Minimalist",
      retro: "Retro"
    },
    actions: {
      startCreating: "Start Creating",
      generateNew: "Generate New Set",
      downloadAll: "Download All",
      upgrade: "Upgrade"
    },
    states: {
      generating: "Generating your graphics...",
      generatingDesc: "This may take a few moments",
      readyToCreate: "Ready to Create",
      readyDesc: "Configure your settings and hit generate to create amazing graphics with AI"
    },
    usage: {
      title: "Usage This Month",
      subtitle: "Track your generation activity",
      of: "of",
      generations: "generations"
    },
    history: {
      title: "Recent Generations",
      noRecent: "No recent generations"
    },
    errors: {
      descriptionRequired: "Description Required",
      descriptionRequiredDesc: "Please enter a description for your graphics",
      generationFailed: "Generation Failed",
      downloadFailed: "Download Failed",
      downloadFailedDesc: "Could not download the image"
    },
    success: {
      generationComplete: "Generation Complete!",
      generationCompleteDesc: "Successfully generated"
    },
    colors: {
      secondary: "Secondary Colors",
      coral: "Coral",
      teal: "Teal", 
      indigo: "Indigo",
      gold: "Gold",
      mint: "Mint",
      lavender: "Lavender",
      crimson: "Crimson",
      turquoise: "Turquoise",
      salmon: "Salmon",
      lime: "Lime",
      navy: "Navy",
      rose: "Rose"
    },
    aiProvider: {
      title: "AI Provider",
      openai: "OpenAI DALL-E",
      gemini: "Google Gemini",
      description: "Choose your preferred AI model"
    }
  },
  th: {
    title: "เครื่องมือสร้างกราฟิกด้วย AI",
    selectType: "เลือกประเภท",
    customizeStyle: "ปรับแต่งสไตล์",
    description: "คำอธิบาย",
    descriptionPlaceholder: "อธิบายสิ่งที่คุณต้องการสร้าง...",
    primaryColors: "สีหลัก",
    customColor: "สีกำหนดเอง",
    artStyle: "สไตล์ศิลปะ",
    generatedResults: {
      stickers: "สติกเกอร์ที่สร้างแล้ว",
      icons: "ไอคอนที่สร้างแล้ว",
      emojis: "อีโมจิที่สร้างแล้ว"
    },
    types: {
      stickers: "สติกเกอร์",
      icons: "ไอคอน",
      emojis: "อีโมจิ",
      stickerDesc: "สติกเกอร์ 4 ชิ้น",
      iconDesc: "ไอคอน 8 ชิ้น",
      emojiDesc: "อีโมจิ 8 ชิ้น"
    },
    styles: {
      cartoon: "การ์ตูน",
      realistic: "เหมือนจริง",
      minimalist: "มินิมอล",
      retro: "เรโทร"
    },
    actions: {
      startCreating: "เริ่มสร้าง",
      generateNew: "สร้างชุดใหม่",
      downloadAll: "ดาวน์โหลดทั้งหมด",
      upgrade: "อัพเกรด"
    },
    states: {
      generating: "กำลังสร้างกราฟิกของคุณ...",
      generatingDesc: "อาจใช้เวลาสักครู่",
      readyToCreate: "พร้อมสร้าง",
      readyDesc: "ตั้งค่าและกดสร้างเพื่อสร้างกราฟิกสุดเจ๋งด้วย AI"
    },
    usage: {
      title: "การใช้งานเดือนนี้",
      subtitle: "ติดตามกิจกรรมการสร้าง",
      of: "จาก",
      generations: "การสร้าง"
    },
    history: {
      title: "การสร้างล่าสุด",
      noRecent: "ไม่มีการสร้างล่าสุด"
    },
    errors: {
      descriptionRequired: "ต้องมีคำอธิบาย",
      descriptionRequiredDesc: "กรุณาใส่คำอธิบายสำหรับกราฟิกของคุณ",
      generationFailed: "การสร้างล้มเหลว",
      downloadFailed: "ดาวน์โหลดล้มเหลว",
      downloadFailedDesc: "ไม่สามารถดาวน์โหลดรูปภาพได้"
    },
    success: {
      generationComplete: "สร้างเสร็จแล้ว!",
      generationCompleteDesc: "สร้างสำเร็จแล้ว"
    },
    colors: {
      secondary: "สีรอง",
      coral: "ปะการัง",
      teal: "เขียวอมฟ้า",
      indigo: "คราม",
      gold: "ทอง",
      mint: "มิ้นท์",
      lavender: "ลาเวนเดอร์",
      crimson: "แดงเข้ม",
      turquoise: "เทอร์ควอยส์",
      salmon: "แซลมอน",
      lime: "เลม่อน",
      navy: "กรมท่า",
      rose: "กุหลาบ"
    },
    aiProvider: {
      title: "ผู้ให้บริการ AI",
      openai: "OpenAI DALL-E",
      gemini: "Google Gemini",
      description: "เลือก AI ที่คุณต้องการ"
    }
  }
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;

export function getTranslation(lang: Language, key: string): string {
  const keys = key.split('.');
  let result: any = translations[lang];
  
  for (const k of keys) {
    result = result?.[k];
  }
  
  return result || key;
}