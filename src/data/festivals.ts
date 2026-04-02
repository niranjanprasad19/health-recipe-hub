export interface Festival {
  id: string;
  name: string;
  nameKey: string;
  date: string; // MM-DD format (approximate)
  endDate?: string;
  region: string;
  cuisine: string[];
  suggestedDishes: string[];
  emoji: string;
  color: string;
}

export const festivals: Festival[] = [
  // Indian Festivals
  { id: "makar-sankranti", name: "Makar Sankranti", nameKey: "festival.makarSankranti", date: "01-14", region: "India", cuisine: ["Indian"], suggestedDishes: ["Til Ladoo", "Puran Poli", "Undhiyu", "Pongal Rice", "Khichdi"], emoji: "🪁", color: "hsl(38, 92%, 50%)" },
  { id: "pongal", name: "Pongal", nameKey: "festival.pongal", date: "01-15", region: "South India", cuisine: ["South Indian"], suggestedDishes: ["Sweet Pongal", "Ven Pongal", "Medu Vada", "Payasam", "Sakkarai Pongal"], emoji: "🍚", color: "hsl(142, 76%, 36%)" },
  { id: "republic-day", name: "Republic Day", nameKey: "festival.republicDay", date: "01-26", region: "India", cuisine: ["Indian"], suggestedDishes: ["Tricolor Pulao", "Tiranga Sandwich", "Tricolor Kheer"], emoji: "🇮🇳", color: "hsl(24, 100%, 50%)" },
  { id: "vasant-panchami", name: "Vasant Panchami", nameKey: "festival.vasantPanchami", date: "02-02", region: "India", cuisine: ["Indian"], suggestedDishes: ["Kesar Halwa", "Boondi Ladoo", "Meethi Chawal"], emoji: "🌼", color: "hsl(50, 100%, 50%)" },
  { id: "maha-shivaratri", name: "Maha Shivaratri", nameKey: "festival.mahaShivaratri", date: "03-01", region: "India", cuisine: ["Indian"], suggestedDishes: ["Thandai", "Sabudana Khichdi", "Fruit Chaat", "Makhana Kheer"], emoji: "🕉️", color: "hsl(262, 60%, 50%)" },
  { id: "holi", name: "Holi", nameKey: "festival.holi", date: "03-14", region: "India", cuisine: ["North Indian"], suggestedDishes: ["Gujiya", "Thandai", "Dahi Bhalla", "Malpua", "Puran Poli"], emoji: "🎨", color: "hsl(330, 80%, 55%)" },
  { id: "ugadi", name: "Ugadi / Gudi Padwa", nameKey: "festival.ugadi", date: "03-22", region: "South India", cuisine: ["South Indian"], suggestedDishes: ["Ugadi Pachadi", "Holige", "Obbattu", "Pulihora"], emoji: "🌿", color: "hsl(120, 60%, 40%)" },
  { id: "ram-navami", name: "Ram Navami", nameKey: "festival.ramNavami", date: "04-06", region: "India", cuisine: ["Indian"], suggestedDishes: ["Panakam", "Neer Mor", "Kosambari", "Sundal"], emoji: "🏹", color: "hsl(30, 90%, 55%)" },
  { id: "baisakhi", name: "Baisakhi", nameKey: "festival.baisakhi", date: "04-13", region: "Punjab", cuisine: ["Punjabi"], suggestedDishes: ["Makki di Roti", "Sarson da Saag", "Lassi", "Chole Bhature", "Pinni"], emoji: "🌾", color: "hsl(45, 100%, 50%)" },
  { id: "eid-ul-fitr", name: "Eid ul-Fitr", nameKey: "festival.eidUlFitr", date: "04-10", region: "Global", cuisine: ["Mughlai", "Middle Eastern"], suggestedDishes: ["Biryani", "Sheer Khurma", "Kebabs", "Haleem", "Seviyan"], emoji: "🌙", color: "hsl(152, 58%, 42%)" },
  { id: "buddha-purnima", name: "Buddha Purnima", nameKey: "festival.buddhaPurnima", date: "05-12", region: "India", cuisine: ["Indian"], suggestedDishes: ["Kheer", "Fruit Salad", "Sattu Drink", "Khichdi"], emoji: "☸️", color: "hsl(45, 80%, 50%)" },
  { id: "raksha-bandhan", name: "Raksha Bandhan", nameKey: "festival.rakshaBandhan", date: "08-09", region: "India", cuisine: ["Indian"], suggestedDishes: ["Ghewar", "Coconut Barfi", "Kaju Katli", "Peda"], emoji: "🪢", color: "hsl(350, 80%, 55%)" },
  { id: "janmashtami", name: "Krishna Janmashtami", nameKey: "festival.janmashtami", date: "08-16", region: "India", cuisine: ["Indian"], suggestedDishes: ["Makhan Mishri", "Panjiri", "Gopalkala", "Dhaniya Panjiri", "Panchamrit"], emoji: "🦚", color: "hsl(210, 80%, 50%)" },
  { id: "ganesh-chaturthi", name: "Ganesh Chaturthi", nameKey: "festival.ganeshChaturthi", date: "08-27", region: "Maharashtra", cuisine: ["Maharashtrian"], suggestedDishes: ["Modak", "Puran Poli", "Ukdiche Modak", "Karanji", "Shrikhand"], emoji: "🐘", color: "hsl(15, 90%, 55%)" },
  { id: "onam", name: "Onam", nameKey: "festival.onam", date: "09-05", region: "Kerala", cuisine: ["Kerala"], suggestedDishes: ["Onam Sadya", "Payasam", "Avial", "Olan", "Thoran"], emoji: "🛶", color: "hsl(45, 100%, 50%)" },
  { id: "navratri", name: "Navratri", nameKey: "festival.navratri", date: "10-02", endDate: "10-11", region: "India", cuisine: ["Gujarati", "Indian"], suggestedDishes: ["Sabudana Khichdi", "Kuttu Puri", "Singhare ka Halwa", "Rajgira Chikki", "Samak Rice"], emoji: "🪔", color: "hsl(350, 80%, 50%)" },
  { id: "dussehra", name: "Dussehra", nameKey: "festival.dussehra", date: "10-12", region: "India", cuisine: ["Indian"], suggestedDishes: ["Jalebi", "Fafda", "Kheer", "Poha"], emoji: "🏹", color: "hsl(25, 100%, 50%)" },
  { id: "karva-chauth", name: "Karva Chauth", nameKey: "festival.karvaChauth", date: "10-20", region: "North India", cuisine: ["North Indian"], suggestedDishes: ["Sargi Thali", "Meethi Seviyan", "Mathri", "Feni"], emoji: "🌕", color: "hsl(40, 90%, 50%)" },
  { id: "diwali", name: "Diwali", nameKey: "festival.diwali", date: "10-20", region: "India", cuisine: ["Indian"], suggestedDishes: ["Gulab Jamun", "Kaju Katli", "Chakli", "Namak Pare", "Besan Ladoo", "Soan Papdi"], emoji: "🪔", color: "hsl(45, 100%, 50%)" },
  { id: "chhath-puja", name: "Chhath Puja", nameKey: "festival.chhathPuja", date: "11-07", region: "Bihar", cuisine: ["Bihari"], suggestedDishes: ["Thekua", "Kheer", "Kaddu Bhaat", "Puri Sabzi"], emoji: "☀️", color: "hsl(35, 100%, 50%)" },
  
  // Global Festivals
  { id: "chinese-new-year", name: "Chinese New Year", nameKey: "festival.chineseNewYear", date: "01-29", region: "China", cuisine: ["Chinese"], suggestedDishes: ["Dumplings", "Spring Rolls", "Noodles", "Sticky Rice Cake", "Fish"], emoji: "🧧", color: "hsl(0, 80%, 50%)" },
  { id: "valentines", name: "Valentine's Day", nameKey: "festival.valentines", date: "02-14", region: "Global", cuisine: ["Italian", "French"], suggestedDishes: ["Chocolate Fondue", "Heart-shaped Pasta", "Tiramisu", "Red Velvet Cake"], emoji: "❤️", color: "hsl(350, 80%, 50%)" },
  { id: "easter", name: "Easter", nameKey: "festival.easter", date: "04-20", region: "Global", cuisine: ["European"], suggestedDishes: ["Hot Cross Buns", "Lamb Roast", "Easter Eggs", "Carrot Cake"], emoji: "🐣", color: "hsl(270, 60%, 60%)" },
  { id: "thanksgiving", name: "Thanksgiving", nameKey: "festival.thanksgiving", date: "11-27", region: "USA", cuisine: ["American"], suggestedDishes: ["Roast Turkey", "Pumpkin Pie", "Cranberry Sauce", "Mashed Potatoes", "Sweet Potato Casserole"], emoji: "🦃", color: "hsl(25, 80%, 45%)" },
  { id: "christmas", name: "Christmas", nameKey: "festival.christmas", date: "12-25", region: "Global", cuisine: ["European", "American"], suggestedDishes: ["Gingerbread Cookies", "Yule Log Cake", "Roast Chicken", "Plum Cake", "Eggnog"], emoji: "🎄", color: "hsl(0, 80%, 40%)" },
  { id: "new-year", name: "New Year's Eve", nameKey: "festival.newYear", date: "12-31", region: "Global", cuisine: ["Global"], suggestedDishes: ["Black-eyed Peas", "Champagne Cake", "Appetizer Platter", "Fruit Tart"], emoji: "🎆", color: "hsl(262, 80%, 55%)" },
];

export function getUpcomingFestivals(count = 5): Festival[] {
  const now = new Date();
  const currentMD = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  
  const sorted = [...festivals].sort((a, b) => {
    const aDate = a.date >= currentMD ? a.date : `Z${a.date}`;
    const bDate = b.date >= currentMD ? b.date : `Z${b.date}`;
    return aDate.localeCompare(bDate);
  });
  
  return sorted.slice(0, count);
}

export function getCurrentFestival(): Festival | null {
  const now = new Date();
  const currentMD = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  
  return festivals.find(f => {
    if (f.endDate) {
      return currentMD >= f.date && currentMD <= f.endDate;
    }
    const festDate = new Date(now.getFullYear(), parseInt(f.date.split("-")[0]) - 1, parseInt(f.date.split("-")[1]));
    const diff = Math.abs(now.getTime() - festDate.getTime());
    return diff <= 2 * 24 * 60 * 60 * 1000; // within 2 days
  }) || null;
}
