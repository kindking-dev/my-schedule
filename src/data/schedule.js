import { rooms } from "./rooms";

const entries = [
  ["monday", "20:00", "20:50", "Безопасная архитектура и дизайн программного обеспечения", "Lecture", "Жумабаева А.", "C1.1.365P", "SSAD53-EN-L1"],
  ["monday", "21:00", "21:50", "Безопасная архитектура и дизайн программного обеспечения", "Lecture", "Жумабаева А.", "C1.1.365P", "SSAD53-EN-L1"],
  ["tuesday", "20:00", "20:50", "Иностранный язык (профессиональный) (C1)", "Practical", "Орманова А.Б.", "C1.1.365P", "FL(PROFESSIONAL)42-EN-P13"],
  ["tuesday", "21:00", "21:50", "Иностранный язык (профессиональный) (C1)", "Practical", "Орманова А.Б.", "C1.1.365P", "FL(PROFESSIONAL)42-EN-P13"],
  ["wednesday", "20:00", "20:50", "Психология управления", "Lecture", "Исаханова А.А.", "C1.3.370L", "PM42-RU-L3"],
  ["wednesday", "21:00", "21:50", "Психология управления", "Lecture", "Исаханова А.А.", "C1.3.370L", "PM42-RU-L3"],
  ["thursday", "19:00", "19:50", "Педагогика высшей школы", "Lecture", "Шон П.", "C1.1.326", "HEP42-EN-L6"],
  ["thursday", "20:00", "20:50", "Педагогика высшей школы", "Lecture", "Шон П.", "C1.1.326", "HEP42-EN-L6"],
  ["friday", "18:00", "18:50", "Психология управления", "Practical", "Исаханова А.А.", "C1.1.234P", "PM42-RU-P10"],
  ["friday", "19:00", "19:50", "Психология управления", "Practical", "Исаханова А.А.", "C1.1.234P", "PM42-RU-P10"],
  ["friday", "20:00", "20:50", "Педагогика высшей школы", "Practical", "Шон П.", "C1.2.230P", "HEP42-EN-P13"],
  ["friday", "21:00", "21:50", "Педагогика высшей школы", "Practical", "Шон П.", "C1.2.230P", "HEP42-EN-P13"],
  ["saturday", "12:00", "12:50", "Иностранный язык (профессиональный) (C1)", "Practical", "Орманова А.Б.", "C1.2.226P", "FL(PROFESSIONAL)42-EN-P13"],
  ["saturday", "13:05", "13:55", "Иностранный язык (профессиональный) (C1)", "Practical", "Орманова А.Б.", "C1.2.226P", "FL(PROFESSIONAL)42-EN-P13"],
  ["saturday", "14:00", "14:50", "Безопасная архитектура и дизайн программного обеспечения", "Lecture", "Жумабаева А.", "C1.2.227P", "SSAD53-EN-L1"],
  ["saturday", "15:00", "15:50", "Безопасная архитектура и дизайн программного обеспечения", "Practical", "Жумабаева А.", "C1.2.227P", "SSAD53-EN-P1"],
  ["saturday", "16:00", "16:50", "Безопасная архитектура и дизайн программного обеспечения", "Practical", "Жумабаева А.", "C1.2.227P", "SSAD53-EN-P1"]
];

export const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
export const dayLabels = { monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday", thursday: "Thursday", friday: "Friday", saturday: "Saturday", sunday: "Sunday" };
export const schedule = entries.map(([day, start, end, subject, type, teacher, room, code], index) => ({ id: `${day}-${start.replace(":", "")}-${index}`, day, start, end, subject, type, teacher, room, code, location: rooms[room] }));
