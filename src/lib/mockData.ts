export type Channel = "whatsapp" | "instagram" | "facebook";

export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  channel: Channel;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  mode: "ai" | "human";
}

export interface Message {
  id: string;
  text: string;
  sender: "me" | "them";
  time: string;
  status?: "sent" | "delivered" | "read";
}

export interface Customer {
  name: string;
  phone: string;
  email: string;
  address: string;
  dob: string;
  gender: string;
  lastBooking: string;
  services: string[];
  lastPaymentStatus: "Cash" | "UPI" | "Online";
  totalSpend: string;
  tags: string[];
}

export const conversations: Conversation[] = [
  { id: "1", name: "Aarav Sharma", avatar: "AS", channel: "whatsapp", lastMessage: "Thanks! See you tomorrow at 3pm.", time: "2m", unread: 2, online: true, mode: "human" },
  { id: "2", name: "Priya Mehta", avatar: "PM", channel: "instagram", lastMessage: "Do you have availability this weekend?", time: "12m", unread: 0, online: true, mode: "ai" },
  { id: "3", name: "Rohan Kapoor", avatar: "RK", channel: "facebook", lastMessage: "Perfect, I'll book it now.", time: "1h", unread: 0, online: false, mode: "human" },
  { id: "4", name: "Sneha Iyer", avatar: "SI", channel: "whatsapp", lastMessage: "Could you send the price list?", time: "3h", unread: 1, online: false, mode: "ai" },
  { id: "5", name: "Vikram Singh", avatar: "VS", channel: "instagram", lastMessage: "Loved the service yesterday 🙌", time: "5h", unread: 0, online: false, mode: "human" },
  { id: "6", name: "Ananya Roy", avatar: "AR", channel: "facebook", lastMessage: "Is the offer still valid?", time: "1d", unread: 0, online: false, mode: "ai" },
  { id: "7", name: "Karan Patel", avatar: "KP", channel: "whatsapp", lastMessage: "Booked. Thanks a lot!", time: "1d", unread: 0, online: true, mode: "human" },
  { id: "8", name: "Meera Das", avatar: "MD", channel: "instagram", lastMessage: "Following up on my last message.", time: "2d", unread: 3, online: false, mode: "human" },
];

export const messagesByConversation: Record<string, Message[]> = {
  "1": [
    { id: "m1", text: "Hi! I'd like to book a haircut.", sender: "them", time: "10:02" },
    { id: "m2", text: "Sure! What day works for you?", sender: "me", time: "10:03", status: "read" },
    { id: "m3", text: "Tomorrow afternoon if possible.", sender: "them", time: "10:05" },
    { id: "m4", text: "We have 3pm or 4:30pm available.", sender: "me", time: "10:06", status: "read" },
    { id: "m5", text: "3pm sounds great.", sender: "them", time: "10:08" },
    { id: "m6", text: "Booked! See you tomorrow ✨", sender: "me", time: "10:09", status: "delivered" },
    { id: "m7", text: "Thanks! See you tomorrow at 3pm.", sender: "them", time: "10:10" },
  ],
};

export const customerByConversation: Record<string, Customer> = {
  "1": {
    name: "Aarav Sharma",
    phone: "+91 98765 43210",
    email: "aarav.s@gmail.com",
    address: "Bandra West, Mumbai",
    dob: "1992-04-18",
    gender: "Male",
    lastBooking: "2024-12-04",
    services: ["Haircut", "Beard Trim", "Hair Spa"],
    lastPaymentStatus: "UPI",
    totalSpend: "₹14,200",
    tags: ["VIP", "Regular"],
  },
};

export const dashboardStats = {
  sent: 12480,
  received: 9821,
  responseRate: 87.4,
  activeChats: 142,
};

export const monthlySeries = [
  { name: "Jan", sent: 820, received: 640 },
  { name: "Feb", sent: 932, received: 720 },
  { name: "Mar", sent: 1101, received: 880 },
  { name: "Apr", sent: 1290, received: 990 },
  { name: "May", sent: 1430, received: 1120 },
  { name: "Jun", sent: 1580, received: 1240 },
  { name: "Jul", sent: 1720, received: 1380 },
  { name: "Aug", sent: 1890, received: 1490 },
  { name: "Sep", sent: 2050, received: 1620 },
  { name: "Oct", sent: 2240, received: 1780 },
  { name: "Nov", sent: 2410, received: 1920 },
  { name: "Dec", sent: 2620, received: 2080 },
];

export const channelSplit = [
  { name: "WhatsApp", value: 58, color: "hsl(var(--whatsapp))" },
  { name: "Instagram", value: 27, color: "hsl(var(--instagram))" },
  { name: "Facebook", value: 15, color: "hsl(var(--facebook))" },
];

export const responseRateSeries = [
  { name: "Mon", rate: 82 },
  { name: "Tue", rate: 85 },
  { name: "Wed", rate: 88 },
  { name: "Thu", rate: 86 },
  { name: "Fri", rate: 91 },
  { name: "Sat", rate: 89 },
  { name: "Sun", rate: 87 },
];

export const contacts = Array.from({ length: 18 }).map((_, i) => ({
  id: String(i + 1),
  name: ["Aarav Sharma","Priya Mehta","Rohan Kapoor","Sneha Iyer","Vikram Singh","Ananya Roy","Karan Patel","Meera Das","Ishaan Joshi","Diya Nair","Aditya Rao","Kavya Pillai","Arjun Reddy","Riya Shah","Nikhil Bose","Tara Menon","Yash Gupta","Zara Khan"][i],
  phone: `+91 9${Math.floor(100000000 + Math.random()*899999999)}`,
  gender: i % 2 ? "Female" : "Male",
  tags: [["VIP"],["Regular"],["New"],["Lead"],["Churned"]][i % 5],
  address: ["Mumbai","Delhi","Bangalore","Pune","Chennai","Hyderabad"][i % 6],
}));

export const campaigns = [
  { id: "c1", name: "Diwali Offer 25% Off", template: "diwali_promo_v2", status: "Live", sent: 3240, delivered: 3180, read: 2410 },
  { id: "c2", name: "Weekend Slot Reminder", template: "weekend_reminder", status: "Scheduled", sent: 0, delivered: 0, read: 0 },
  { id: "c3", name: "Birthday Wishes", template: "birthday_v1", status: "Live", sent: 142, delivered: 140, read: 118 },
  { id: "c4", name: "Win-back Campaign", template: "winback_v3", status: "Draft", sent: 0, delivered: 0, read: 0 },
  { id: "c5", name: "New Service Launch", template: "service_launch", status: "Completed", sent: 5820, delivered: 5740, read: 4120 },
];

export const clients = [
  { id: "t1", name: "Bloom Salon", plan: "Pro", users: 8, messages: 24820, status: "Active" },
  { id: "t2", name: "Urban Spa Co.", plan: "Growth", users: 4, messages: 12410, status: "Active" },
  { id: "t3", name: "Style Studio", plan: "Starter", users: 2, messages: 3120, status: "Trial" },
  { id: "t4", name: "Wellness Hub", plan: "Pro", users: 12, messages: 41280, status: "Active" },
  { id: "t5", name: "Glow Clinic", plan: "Growth", users: 6, messages: 8920, status: "Suspended" },
];
