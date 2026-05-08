import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
// Vite is imported dynamically in dev mode
import path from "path";
import { v4 as uuidv4 } from "uuid";
// Types duplicated from src/types.ts for backend consistency without runtime imports
export type Gender = 'Male' | 'Female' | 'Other' | 'Non-binary' | 'Prefer not to say';

export interface User {
  id: string;
  nickname: string;
  gender?: Gender;
  interests: string[];
  ip: string;
  bannedUntil?: number;
  reports: Set<string>;
  blockedUsers: Set<string>;
  isDND: boolean;
  currentRoom?: string;
  lastMessageTime: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderGender?: Gender;
  content: string;
  timestamp: number;
  roomId?: string;
  recipientId?: string;
  type: 'public' | 'private' | 'system';
}

export interface Room {
  id: string;
  name: string;
  description: string;
  userCount: number;
}

export interface ServerToClientEvents {
  'room:message': (message: ChatMessage) => void;
  'private:message': (message: ChatMessage) => void;
  'user:joined': (user: { id: string; nickname: string; gender?: Gender; currentRoom?: string; isDND?: boolean }) => void;
  'user:left': (userId: string) => void;
  'users:list': (users: { id: string; nickname: string; gender?: Gender; currentRoom?: string; isDND?: boolean }[]) => void;
  'error': (msg: string) => void;
  'ban': (durationHours: number) => void;
  'status:update': (data: { userId: string; isDND: boolean }) => void;
  'restriction:update': (data: { byUserId: string; status: 'restricted' | 'unrestricted' }) => void;
  'user:reported': (data: { totalReports: number }) => void;
  'match:found': (data: { peerId: string; peerNickname: string; peerGender?: Gender }) => void;
  'match:left': () => void;
  'registration:success': (data: { userId: string }) => void;
}

export interface ClientToServerEvents {
  'join:room': (roomId: string) => void;
  'send:message': (data: { roomId: string; content: string }) => void;
  'send:private': (data: { recipientId: string; content: string }) => void;
  'report:user': (userId: string) => void;
  'block:user': (userId: string) => void;
  'unblock:user': (userId: string) => void;
  'toggle:dnd': (isDND: boolean) => void;
  'match:find': () => void;
  'match:cancel': () => void;
  'match:leave': () => void;
  'register': (data: { nickname: string; gender?: Gender; interests?: string[] }) => void;
}

const PORT = Number(process.env.PORT) || 3000;

// In-memory Stores
const users = new Map<string, User>();
const sessions = new Map<string, string>(); // socketId -> userId
const userTimers = new Map<string, NodeJS.Timeout>();

// --- DUMMY USER MANAGEMENT (SERVER-SIDE SOURCE OF TRUTH) ---
const TARGET_MIN_DUMMIES = 186;
const TARGET_MAX_DUMMIES = 222;
const MALE_PROBABILITY = 0.85;
const CYCLE_INTERVAL_MS = (2 * 60 * 60 * 1000) / TARGET_MIN_DUMMIES;
const TRAFFIC_SIMULATION_INTERVAL_MS = 15000;

const ROOM_DATA = [
  { id: 'lobby', weight: 40, names: 'indian' },
  { id: 'mumbai', weight: 15, names: 'indian' },
  { id: 'delhi', weight: 12, names: 'indian' },
  { id: 'bangalore', weight: 10, names: 'indian' },
  { id: 'usa', weight: 5, names: 'western' },
  { id: 'uk', weight: 3, names: 'western' },
  { id: 'canada', weight: 2, names: 'western' },
  { id: 'australia', weight: 1, names: 'western' },
  { id: 'uae', weight: 2, names: 'arabic' },
  { id: 'singapore', weight: 1, names: 'east_asian' },
  { id: 'germany', weight: 1, names: 'western' },
  { id: 'saudi', weight: 1, names: 'arabic' },
  { id: 'japan', weight: 1, names: 'east_asian' },
  { id: 'hyderabad', weight: 4, names: 'indian' },
  { id: 'chennai', weight: 3, names: 'indian' },
  { id: 'kolkata', weight: 3, names: 'indian' },
  { id: 'lucknow', weight: 2, names: 'indian' },
  { id: 'jaipur', weight: 1, names: 'indian' },
  { id: 'chandigarh', weight: 1, names: 'indian' },
];

const NAME_POOLS: Record<string, { male: string[], female: string[] }> = {
  indian: {
    male: ['Arjun', 'Ayaan', 'Advait', 'Kabir', 'Rohan', 'Ishaan', 'Aarav', 'Vihaan', 'Aryan', 'Krishna', 'Abhishek', 'Akash', 'Aman', 'Aniket', 'Ankit', 'Gaurav', 'Hardik', 'Kunal', 'Mohit', 'Nikhil', 'Parth', 'Pranav', 'Raghav', 'Rajat', 'Sahil', 'Sanket', 'Shubham', 'Sumit', 'Suraj', 'Vaibhav', 'Vikas', 'Vishal', 'Yuvraj', 'Aditya', 'Vikram', 'Sanjay', 'Rahul', 'Varun', 'Siddharth', 'Kartik', 'Yash', 'Dev', 'Anish', 'Rishi', 'Karan', 'Sameer', 'Amit', 'Prakash', 'Rajesh', 'Manish', 'Suresh', 'Deepak', 'Vijay', 'Sunil', 'Anil', 'Pankaj', 'Abhay', 'Arpit', 'Ashish', 'Bhavin', 'Chaitanya', 'Chirag', 'Darshan', 'Dhaval', 'Harshal', 'Hemant', 'Inder', 'Jatin', 'Jay', 'Jignesh', 'Kailash', 'Kalpesh', 'Lalit', 'Mahesh', 'Mayur', 'Milan', 'Nakul', 'Naman', 'Navin', 'Nihar', 'Nirav', 'Nishant', 'Pranay', 'Prateek', 'Punit', 'Rakesh', 'Rishabh', 'Ritvik', 'Sagar', 'Sarthak', 'Satish', 'Shailesh', 'Shakti', 'Shantanu', 'Sohan', 'Sourabh', 'Tejas', 'Tushar', 'Umesh', 'Utkarsh', 'Vinay', 'Vineet', 'Vipul', 'Yogesh', 'Reyansh', 'Vivaan', 'Atharv', 'Shaurya', 'Aayush', 'Zayan', 'Saif', 'Hrithik', 'Ranbir', 'Ayushmaan', 'Om', 'Shiv', 'Hari', 'Bhuvan', 'Dhruv', 'Swaroop', 'Prasoon', 'Keshav', 'Madhav', 'Gopal', 'Gautam', 'Kashyap', 'Raghu', 'Murthy', 'Samba', 'Venkatesh', 'Rami', 'Kiran', 'Tarun', 'Harsha', 'Anant', 'Eshan', 'Ishir', 'Jairaj', 'Kovid', 'Lakshey', 'Mihir', 'Naveen', 'Ojas', 'Pallav', 'Qadir', 'Ranveer', 'Sohail', 'Tanmay', 'Udbhav', 'Vatsal', 'Wajid'],
    female: ['Ananya', 'Diya', 'Ishani', 'Kiara', 'Myra', 'Navya', 'Pari', 'Riya', 'Saisha', 'Vanya', 'Zoya', 'Aditi', 'Ishika', 'Kavya', 'Meera', 'Sara', 'Anjali', 'Ankita', 'Deepali', 'Disha', 'Kajal', 'Komal', 'Neha', 'Pooja', 'Priyanka', 'Sakshi', 'Sanjana', 'Sneha', 'Tanvi', 'Shruti', 'Shweta', 'Priya', 'Tanya', 'Avni', 'Gia', 'Ira', 'Khushi', 'Nora', 'Prisha', 'Siya', 'Aadhya', 'Anika', 'Aarohi', 'Amoli', 'Bhavna', 'Chitra', 'Divya', 'Esha', 'Aarti', 'Aashna', 'Akshara', 'Alka', 'Amita', 'Anshika', 'Archana', 'Asha', 'Asmita', 'Bela', 'Bhakti', 'Binal', 'Dhara', 'Dipti', 'Gauri', 'Hansa', 'Harsha', 'Hetal', 'Indira', 'Jagriti', 'Janvi', 'Jaya', 'Jyoti', 'Kalpana', 'Kamini', 'Kanchan', 'Karishma', 'Kruti', 'Latika', 'Leela', 'Madhu', 'Mamta', 'Manasi', 'Manita', 'Mansi', 'Maya', 'Megha', 'Mona', 'Monica', 'Namrata', 'Nandini', 'Nayana', 'Neelam', 'Neeta', 'Nidhi', 'Nikita', 'Nilam', 'Nirali', 'Nisha', 'Padmini', 'Pallavi', 'Payal', 'Poonam', 'Prachi', 'Pragati', 'Pratibha', 'Preeti', 'Prerna', 'Priyal', 'Puja', 'Radha', 'Ragini', 'Raksha', 'Rashmi', 'Raveena', 'Reena', 'Rekha', 'Renuka', 'Rina', 'Ritu', 'Roshni', 'Rupal', 'Saloni', 'Sandhya', 'Sangita', 'Sapna', 'Sarika', 'Savita', 'Seema', 'Shalu', 'Shanti', 'Sheetal', 'Shikha', 'Shilpa', 'Shivani', 'Shraddha', 'Shreya', 'Sonal', 'Sonali', 'Sonia', 'Sudha', 'Sujata', 'Sunita', 'Sushma', 'Swati', 'Trisha', 'Tulsi', 'Urvashi', 'Usha', 'Vaishali', 'Varsha', 'Vidya', 'Vinita', 'Yamini']
  },
  western: {
    male: ['James', 'Robert', 'John', 'Michael', 'David', 'William', 'Richard', 'Joseph', 'Thomas', 'Christopher', 'Charles', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Kevin', 'Brian', 'George', 'Timothy', 'Ronald', 'Edward', 'Jason', 'Jeffrey', 'Ryan', 'Jacob', 'Gary', 'Nicholas', 'Eric', 'Stephen', 'Adam', 'Alan', 'Austin', 'Benjamin', 'Brandon', 'Bryan', 'Carl', 'Chad', 'Christian', 'Cody', 'Connor', 'Corey', 'Craig', 'Derek', 'Dominic', 'Dustin', 'Dylan', 'Ethan', 'Evan', 'Frank', 'Gabriel', 'Gregory', 'Ian', 'Isaac', 'Jack', 'Jerry', 'Jesse', 'Joe', 'Jordan', 'Justin', 'Keith', 'Kenneth', 'Kyle', 'Larry', 'Lawrence', 'Logan', 'Lucas', 'Luke', 'Marcus', 'Nathan', 'Noah', 'Owen', 'Patrick', 'Peter', 'Philip', 'Raymond', 'Samuel', 'Scott', 'Sean', 'Seth', 'Shane', 'Shawn', 'Timothy', 'Todd', 'Travis', 'Trent', 'Tyler', 'Victor', 'Vincent', 'Walter', 'Wayne', 'Zachary'],
    female: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Lisa', 'Nancy', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle', 'Dorothy', 'Carol', 'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Sharon', 'Laura', 'Abigail', 'Alice', 'Amy', 'Angela', 'Ann', 'Anna', 'Annie', 'Audrey', 'Beverly', 'Brenda', 'Brittany', 'Catherine', 'Cheryl', 'Christina', 'Christine', 'Cindy', 'Claire', 'Courtney', 'Crystal', 'Cynthia', 'Danielle', 'Dawn', 'Denise', 'Diana', 'Diane', 'Erica', 'Erin', 'Evelyn', 'Felicia', 'Florence', 'Gloria', 'Grace', 'Hannah', 'Hazel', 'Heather', 'Helen', 'Holly', 'Irene', 'Iris', 'Isabella', 'Jackie', 'Jacqueline', 'Jane', 'Janet', 'Janice', 'Jean', 'Jill', 'Joan', 'Joanne', 'Joy', 'Joyce', 'Judith', 'Judy', 'Julia', 'Julie', 'June', 'Katherine', 'Kathleen', 'Kathryn', 'Kathy', 'Katie', 'Kayla', 'Kelly', 'Kendra', 'Kerry', 'Kristin', 'Kristina', 'Lauren', 'Laurie', 'Leslie', 'Lillian', 'Lily', 'Lois', 'Lori', 'Louise', 'Lucy', 'Lydia', 'Lynn', 'Mabel', 'Madeline', 'Madison', 'Mae', 'Marie', 'Marilyn', 'Marion', 'Marjorie', 'Martha', 'Maureen', 'Maxine', 'Megan', 'Melanie', 'Melinda', 'Meredith', 'Mildred', 'Molly', 'Monica', 'Muriel', 'Myra', 'Myrtle', 'Nadine', 'Nanette', 'Naomi', 'Natalie', 'Nellie', 'Nettie', 'Nicole', 'Nina', 'Nora', 'Norma', 'Olive', 'Olivia', 'Pamela', 'Paula', 'Pearl', 'Peggy', 'Penny', 'Phyllis', 'Priscilla', 'Rachel', 'Ramona', 'Renee', 'Rhonda', 'Rita', 'Roberta', 'Rose', 'Rosemary', 'Ruby', 'Ruth', 'Sally', 'Samantha', 'Sara', 'Sarah', 'Savannah', 'Selma', 'Shannon', 'Sheila', 'Shelley', 'Sheryl', 'Shirley', 'Sonia', 'Sophia', 'Stacey', 'Stella', 'Sylvia', 'Tamara', 'Tammy', 'Tanya', 'Tara', 'Teresa', 'Thelma', 'Theresa', 'Tiffany', 'Tina', 'Toni', 'Tracey', 'Tracy', 'Valerie', 'Vanessa', 'Vera', 'Vicki', 'Victoria', 'Violet', 'Virginia', 'Vivian', 'Wanda', 'Wendy', 'Whitney', 'Yolanda', 'Yvette', 'Yvonne', 'Zoe']
  },
  arabic: {
    male: ['Ahmed', 'Mohammed', 'Omar', 'Ali', 'Hassan', 'Ibrahim', 'Mustafa', 'Youssef', 'Zaid', 'Kareem', 'Hamza', 'Fareed', 'Bilal', 'Nasir', 'Khalid', 'Sami', 'Tarik', 'Faisal', 'Abbas', 'Adel', 'Amir', 'Anwar', 'Basam', 'Fadi', 'Ghassan', 'Habib', 'Hadi', 'Ishaq', 'Jamal', 'Kamal', 'Latif', 'Mahir', 'Nabil', 'Rami', 'Sabir', 'Tariq', 'Usama', 'Waleed', 'Yasir', 'Zuhair'],
    female: ['Fatima', 'Layla', 'Aisha', 'Amira', 'Zahra', 'Noor', 'Mariam', 'Salma', 'Habiba', 'Rania', 'Dina', 'Yasmeen', 'Hana', 'Mona', 'Lina', 'Safa', 'Alia', 'Basma', 'Dalal', 'Farah', 'Ghada', 'Hoda', 'Inas', 'Jinan', 'Kholoud', 'Laila', 'Maha', 'Nada', 'Ola', 'Rasha', 'Sahar', 'Tahani', 'Ula', 'Wafa', 'Yara', 'Zainab']
  },
  east_asian: {
    male: ['Wei', 'Li', 'Min', 'Hiroshi', 'Kenji', 'Jae', 'Sang', 'Takumi', 'Yuki', 'Chen', 'Bo', 'Jun', 'Ji', 'Minsu', 'Hyun', 'Kaito', 'Sora', 'Ren', 'Akio', 'Daisuke', 'Eiji', 'Fujio', 'Goro', 'Haruo', 'Ichiro', 'Jiro', 'Kenta', 'Makoto', 'Naoki', 'Osamu', 'Ryo', 'Shin', 'Taro', 'Ukyo', 'Yoshi', 'Zenshiro'],
    female: ['Mei', 'Lin', 'Sakura', 'Hana', 'Ji-won', 'Su-bin', 'Yuna', 'Aimi', 'Xia', 'Fan', 'Ying', 'Momo', 'Rin', 'Hina', 'Seo-yeon', 'Akemi', 'Cho', 'Emi', 'Fumiko', 'Haruka', 'Itsuki', 'Junko', 'Kumi', 'Maki', 'Nana', 'Oriko', 'Reiko', 'Saki', 'Tomi', 'Ume', 'Yoko']
  }
};

let serverDummyUsers: any[] = [];

function getRandomRoomId() {
  const totalWeight = ROOM_DATA.reduce((acc, r) => acc + r.weight, 0);
  let random = Math.random() * totalWeight;
  for (const room of ROOM_DATA) {
    if (random < room.weight) return room.id;
    random -= room.weight;
  }
  return 'lobby';
}

const RESPONSE_POOLS = [
  ['hi', 'hii', 'hello', 'hey'],
  ['age', 'age?', 'ur age'],
  ['asl', 'asl?', 'ur asl?'],
  ['u frm', 'frm', 'from?', 'u from']
];

function getRandomProfile(gender: Gender) {
  if (gender === 'Male') return 'Lurker';
  
  const rand = Math.random() * 100;
  if (gender === 'Female') {
    if (rand < 4) return 'Quick';
    if (rand < 9) return 'Moderate';
    if (rand < 15) return 'Sluggish';
    return 'Lurker';
  }
  
  return 'Lurker';
}

function generateNickname(isMale: boolean, roomId: string, existingFullNicknames: Set<string>) {
  const roomInfo = ROOM_DATA.find(r => r.id === roomId) || ROOM_DATA[0];
  const pool = NAME_POOLS[roomInfo.names] || NAME_POOLS.indian;
  const nameList = isMale ? pool.male : pool.female;
  
  let baseName = nameList[Math.floor(Math.random() * nameList.length)];
  let nickname = baseName;
  
  if (existingFullNicknames.has(nickname)) {
    nickname = `${baseName}${Math.floor(Math.random() * 99) + 1}`;
    if (existingFullNicknames.has(nickname)) {
      nickname = `${baseName}_${Math.floor(Math.random() * 99) + 100}`;
    }
  } else {
    const rand = Math.random();
    if (rand > 0.85) {
      nickname = `${baseName}${Math.floor(Math.random() * 99) + 1}`;
    } else if (rand > 0.95) {
      nickname = `${baseName}_${Math.floor(Math.random() * 9)}`;
    }
  }
  return nickname;
}

function initDummyUsers() {
  const initialCount = Math.floor(Math.random() * (TARGET_MAX_DUMMIES - TARGET_MIN_DUMMIES + 1)) + TARGET_MIN_DUMMIES;
  const usedNicknames = new Set<string>();
  const dummies = [];

  for (let i = 0; i < initialCount; i++) {
    const isMale = Math.random() < MALE_PROBABILITY;
    const gender: Gender = isMale ? 'Male' : 'Female';
    const roomId = getRandomRoomId();
    const nickname = generateNickname(isMale, roomId, usedNicknames);
    usedNicknames.add(nickname);
    
    dummies.push({
      id: `dummy-${i}-${Date.now()}-${Math.random()}`,
      nickname,
      gender,
      isDummy: true,
      currentRoom: roomId,
      responseProfile: getRandomProfile(gender),
      repliesCount: 0,
      usedPools: []
    });
  }
  serverDummyUsers = dummies;
}

function startDummySimulation(io: Server) {
  // Cycle existing users
  setInterval(() => {
    try {
      if (serverDummyUsers.length === 0) return;
      const indexToReplace = Math.floor(Math.random() * serverDummyUsers.length);
      const currentNicknames = new Set<string>(serverDummyUsers.map(u => u.nickname));
      
      const isMale = Math.random() < MALE_PROBABILITY;
      const gender: Gender = isMale ? 'Male' : 'Female';
      const roomId = getRandomRoomId();
      const nickname = generateNickname(isMale, roomId, currentNicknames);

      serverDummyUsers[indexToReplace] = {
        id: `dummy-cycle-${Date.now()}-${Math.random()}`,
        nickname,
        gender,
        isDummy: true,
        currentRoom: roomId,
        responseProfile: getRandomProfile(gender),
        repliesCount: 0,
        usedPools: []
      };
      
      io.emit('dummies:update' as any, serverDummyUsers);
    } catch (err) {
      console.error('Dummy cycle error:', err);
    }
  }, CYCLE_INTERVAL_MS);

  // Simulate traffic (Add/Remove users)
  setInterval(() => {
    try {
      const count = serverDummyUsers.length;
      const shouldAdd = count < TARGET_MAX_DUMMIES && (count <= TARGET_MIN_DUMMIES || Math.random() > 0.5);
      const shouldRemove = !shouldAdd && count > TARGET_MIN_DUMMIES;

      if (shouldAdd) {
        const isMale = Math.random() < MALE_PROBABILITY;
        const gender: Gender = isMale ? 'Male' : 'Female';
        const roomId = getRandomRoomId();
        const currentNicknames = new Set<string>(serverDummyUsers.map(u => u.nickname));
        const nickname = generateNickname(isMale, roomId, currentNicknames);
        
        serverDummyUsers.push({
          id: `dummy-join-${Date.now()}-${Math.random()}`,
          nickname,
          gender,
          isDummy: true,
          currentRoom: roomId,
          responseProfile: getRandomProfile(gender),
          repliesCount: 0,
          usedPools: []
        });
      } else if (shouldRemove) {
        const randomIndex = Math.floor(Math.random() * serverDummyUsers.length);
        serverDummyUsers.splice(randomIndex, 1);
      }
      
      io.emit('dummies:update' as any, serverDummyUsers);
    } catch (err) {
      console.error('Traffic simulation error:', err);
    }
  }, TRAFFIC_SIMULATION_INTERVAL_MS);
}

function handleDummyResponses(io: Server, roomId: string, senderId: string) {
  // Only respond to real users
  if (senderId.startsWith('dummy-')) return;

  // Optimized selection: O(n) filtering instead of O(n log n) sorting
  const candidates: any[] = [];
  for (const d of serverDummyUsers) {
    if (d.currentRoom === roomId && d.responseProfile !== 'Lurker' && d.repliesCount < 2) {
      candidates.push(d);
    }
  }
  
  if (candidates.length === 0) return;

  // Pick 1-2 random dummies from the candidates
  const countToPick = Math.random() > 0.7 ? 2 : 1;
  const selected: any[] = [];
  for (let i = 0; i < countToPick && candidates.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * candidates.length);
    selected.push(candidates.splice(randomIndex, 1)[0]);
  }

  selected.forEach(dummy => {
    let delay = 0;
    if (dummy.responseProfile === 'Quick') delay = Math.random() * 5000 + 5000; // 5-10s
    else if (dummy.responseProfile === 'Moderate') delay = Math.random() * 30000 + 30000; // 30-60s
    else if (dummy.responseProfile === 'Sluggish') delay = 120000; // 2 minutes

    if (delay > 0) {
      setTimeout(() => {
        // Verify dummy state again after the async delay
        const stillExists = serverDummyUsers.find(d => d.id === dummy.id && d.currentRoom === roomId);
        if (stillExists && stillExists.repliesCount < 2) {
          let availablePoolIndices: number[] = [];
          
          if (stillExists.repliesCount === 0) {
            // First reply can use any pool (0, 1, 2, 3)
            availablePoolIndices = [0, 1, 2, 3];
          } else if (stillExists.repliesCount === 1) {
            // Second reply can use pools 1, 2, 3 (index 1, 2, 3) EXCLUDING the one already used
            // Index 0 (Pool 1) is strictly for first reply
            availablePoolIndices = [1, 2, 3].filter(idx => !stillExists.usedPools.includes(idx));
          }

          if (availablePoolIndices.length === 0) return;

          const poolIndex = availablePoolIndices[Math.floor(Math.random() * availablePoolIndices.length)];
          const pool = RESPONSE_POOLS[poolIndex];
          const content = pool[Math.floor(Math.random() * pool.length)];

          const message: ChatMessage = {
            id: uuidv4(),
            senderId: dummy.id,
            senderName: dummy.nickname,
            senderGender: dummy.gender,
            content,
            timestamp: Date.now(),
            roomId,
            type: 'public'
          };

          io.to(roomId).emit('room:message', message);
          stillExists.repliesCount++;
          stillExists.usedPools.push(poolIndex);
        }
      }, delay);
    }
  });
}

const rooms: Room[] = [
  { id: 'lobby', name: 'General Lobby', description: 'A place for open, respectful conversations.', userCount: 0 },
  // Indian Cities
  { id: 'mumbai', name: 'Mumbai', description: 'Chat with folks in the City of Dreams.', userCount: 0 },
  { id: 'delhi', name: 'Delhi', description: 'The heart of India. Conversations and chai.', userCount: 0 },
  { id: 'bangalore', name: 'Bangalore', description: 'Silicon Valley of India.', userCount: 0 },
  { id: 'hyderabad', name: 'Hyderabad', description: 'City of Pearls and Biryani.', userCount: 0 },
  { id: 'chennai', name: 'Chennai', description: 'Gateway to South India.', userCount: 0 },
  { id: 'kolkata', name: 'Kolkata', description: 'City of Joy.', userCount: 0 },
  { id: 'pune', name: 'Pune', description: 'The Oxford of the East.', userCount: 0 },
  { id: 'ahmedabad', name: 'Ahmedabad', description: 'Manchester of the East.', userCount: 0 },
  { id: 'thiruvananthapuram', name: 'Thiruvananthapuram', description: 'Capital of Kerala - God\'s Own Country.', userCount: 0 },
  { id: 'lucknow', name: 'Lucknow', description: 'City of Nawabs.', userCount: 0 },
  { id: 'jaipur', name: 'Jaipur', description: 'The Pink City.', userCount: 0 },
  { id: 'chandigarh', name: 'Chandigarh', description: 'The Beautiful City.', userCount: 0 },
  // Global / Asia / GCC
  { id: 'usa', name: 'USA', description: 'Connect with people across the United States.', userCount: 0 },
  { id: 'uk', name: 'United Kingdom', description: 'British vibes and banter.', userCount: 0 },
  { id: 'canada', name: 'Canada', description: 'O Canada! Friendly chats from the Great White North.', userCount: 0 },
  { id: 'australia', name: 'Australia', description: 'G\'day mate! Australian connections.', userCount: 0 },
  { id: 'germany', name: 'Germany', description: 'Chat with folks from Deutschland.', userCount: 0 },
  { id: 'france', name: 'France', description: 'Bonjour! French connections.', userCount: 0 },
  { id: 'uae', name: 'UAE', description: 'Connecting Dubai, Abu Dhabi, and beyond.', userCount: 0 },
  { id: 'saudi', name: 'Saudi Arabia', description: 'Middle East vibes and conversations.', userCount: 0 },
  { id: 'qatar', name: 'Qatar', description: 'Connect with folks in Doha and beyond.', userCount: 0 },
  { id: 'singapore', name: 'Singapore', description: 'The Lion City.', userCount: 0 },
  { id: 'japan', name: 'Japan', description: 'Connect with the Land of the Rising Sun.', userCount: 0 },
  { id: 'south_korea', name: 'South Korea', description: 'Chat with folks in the land of K-culture.', userCount: 0 },
  { id: 'thailand', name: 'Thailand', description: 'Vibrant chats from the Land of Smiles.', userCount: 0 },
  { id: 'philippines', name: 'Philippines', description: 'Connecting across the Pearl of the Orient Seas.', userCount: 0 },
  { id: 'malaysia', name: 'Malaysia', description: 'Truly Asia! Connect with Malaysian vibes.', userCount: 0 },
  { id: 'bahrain', name: 'Bahrain', description: 'Connecting folks in the heart of the Gulf.', userCount: 0 },
];

const bannedIps = new Map<string, number>(); // ip -> unbanTime
const bannedNicknames = new Map<string, number>(); // nickname -> unbanTime
const matchingQueue: string[] = []; // socket IDs

async function startServer() {
  console.log(`Starting server in ${process.env.NODE_ENV || 'development'} mode...`);
  const app = express();
  const httpServer = createServer(app);
  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: { origin: "*" },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Initialize and start dummy simulation
  initDummyUsers();
  startDummySimulation(io);

  // Admin middleware or routes can go here
  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

  io.on("connection", (socket) => {
    const ip = socket.handshake.address;

    // Send initial dummy list immediately on connection
    socket.emit('dummies:update' as any, serverDummyUsers);

    // Check if IP is banned
    const banTime = bannedIps.get(ip);
    if (banTime && banTime > Date.now()) {
      socket.emit('error', 'You are currently banned from this platform.');
      socket.disconnect();
      return;
    }

    // Handle Registration
    socket.on('dummies:get' as any, () => {
      socket.emit('dummies:update' as any, serverDummyUsers);
    });

    socket.on('register', (data) => {
      console.log(`Registration attempt for: ${data?.nickname}`);
      try {
        if (!data) {
          socket.emit('error', 'Invalid registration data.');
          return;
        }

        const cleanNickname = (data.nickname || '').trim();
        
        if (!cleanNickname) {
          socket.emit('error', 'Nickname cannot be empty.');
          return;
        }

        // Check if nickname is already taken across all users
        const allUsers = Array.from(users.values());
        const existingUser = allUsers.find(u => 
          (u.nickname || '').trim().toLowerCase() === cleanNickname.toLowerCase()
        );

        if (existingUser) {
          socket.emit('error', 'This nickname is already in use. Please choose another one.');
          return;
        }

        // Check if socket is already registered
        if (sessions.has(socket.id)) {
          socket.emit('error', 'You are already registered.');
          return;
        }

        // Check if nickname is banned
        const nickBanTime = bannedNicknames.get(cleanNickname.toLowerCase());
        if (nickBanTime && nickBanTime > Date.now()) {
          const remaining = Math.ceil((nickBanTime - Date.now()) / 60000);
          socket.emit('error', `This nickname is temporarily banned. Try again in ${remaining} minutes.`);
          return;
        }

        const userId = uuidv4();
        const newUser: User = {
          id: userId,
          nickname: cleanNickname,
          gender: data.gender,
          interests: data.interests || [],
          ip: ip,
          reports: new Set(),
          blockedUsers: new Set(),
          isDND: false,
          lastMessageTime: 0
        } as any;

        users.set(userId, newUser);
        sessions.set(socket.id, userId);
        
        socket.emit('registration:success', { userId });
        console.log(`User ${newUser.nickname} registered successfully. (Total users: ${users.size})`);
      } catch (err) {
        console.error('Registration system error:', err);
        socket.emit('error', 'A system error occurred. Please refresh and try again.');
      }
    });

    socket.on('join:room', (roomId) => {
      joinRoom(socket, roomId);
    });

    socket.on('send:message', (data) => {
      const userId = sessions.get(socket.id);
      if (!userId) return;
      const user = users.get(userId);
      if (!user) return;

      // Rate limit removed by user request
      const now = Date.now();
      const message: ChatMessage = {
        id: uuidv4(),
        senderId: user.id,
        senderName: user.nickname,
        senderGender: user.gender,
        content: data.content.substring(0, 500), // Max length
        timestamp: now,
        roomId: data.roomId,
        type: 'public'
      };

      io.to(data.roomId).emit('room:message', message);
      
      // Trigger dummy responses
      handleDummyResponses(io, data.roomId, userId);
    });

    socket.on('send:private', (data) => {
      const userId = sessions.get(socket.id);
      if (!userId) return;
      const user = users.get(userId);
      if (!user) return;

      const recipient = users.get(data.recipientId);
      if (!recipient) {
        console.log(`Private send failed: Recipient ${data.recipientId} not found`);
        socket.emit('error', 'User is no longer online.');
        return;
      }

      if (recipient.isDND) {
        console.log(`Private send failed: Recipient ${recipient.nickname} has DND on`);
        socket.emit('error', 'User has DND enabled.');
        return;
      }

      if (recipient.blockedUsers.has(user.id)) {
        console.log(`Private send blocked by recipient: ${recipient.nickname} blocked ${user.nickname}`);
        // Silent fail as per spec "Silent (no notification to blocked user)"
        return;
      }

      const message: ChatMessage = {
        id: uuidv4(),
        senderId: user.id,
        senderName: user.nickname,
        senderGender: user.gender,
        content: data.content.substring(0, 500),
        timestamp: Date.now(),
        recipientId: data.recipientId,
        type: 'private'
      };

      // Find recipient socket
      const recipientSocketId = Array.from(sessions.entries())
        .find(([sid, uid]) => uid === data.recipientId)?.[0];

      if (recipientSocketId) {
        io.to(recipientSocketId).emit('private:message', message);
      }
      // Always send back to sender for their DM UI as long as recipient exists in system
      socket.emit('private:message', message);
    });

    socket.on('toggle:dnd', (isDND) => {
      const userId = sessions.get(socket.id);
      if (!userId) return;
      const user = users.get(userId);
      if (user) {
        user.isDND = isDND;
        io.emit('status:update', { userId: user.id, isDND });
      }
    });

    socket.on('report:user', (targetUserId) => {
      const reporterId = sessions.get(socket.id);
      if (!reporterId || reporterId === targetUserId) return;

      const targetUser = users.get(targetUserId);
      if (!targetUser) return;

      // Unique reporters only
      if (!targetUser.reports.has(reporterId)) {
        targetUser.reports.add(reporterId);

        // Notify the reported user
        const targetSocketId = Array.from(sessions.entries())
          .find(([sid, uid]) => uid === targetUserId)?.[0];
        
        if (targetSocketId) {
          io.to(targetSocketId).emit('user:reported', { totalReports: targetUser.reports.size });
        }

        // 5 reports -> 30 minute ban
        if (targetUser.reports.size >= 5) {
          const unbanTime = Date.now() + (30 * 60 * 1000);
          bannedIps.set(targetUser.ip, unbanTime);
          bannedNicknames.set(targetUser.nickname.toLowerCase(), unbanTime);
          
          // Disconnect the banned user
          const bannedSocketId = Array.from(sessions.entries())
            .find(([sid, uid]) => uid === targetUserId)?.[0];
          
          if (bannedSocketId) {
            const bannedSocket = io.sockets.sockets.get(bannedSocketId);
            if (bannedSocket) {
              bannedSocket.emit('ban', 0.5); // 0.5 hours = 30 mins
              // Small delay to ensure the event is sent before disconnection
              setTimeout(() => {
                bannedSocket.disconnect();
              }, 1000);
            }
          }
        }
      }
    });

    socket.on('block:user', (targetUserId) => {
      const userId = sessions.get(socket.id);
      if (!userId) return;
      const user = users.get(userId);
      if (user) {
        user.blockedUsers.add(targetUserId);
        
        // Notify the target user that they've been restricted
        const targetSocketId = Array.from(sessions.entries())
          .find(([sid, uid]) => uid === targetUserId)?.[0];
        if (targetSocketId) {
          io.to(targetSocketId).emit('restriction:update', { byUserId: userId, status: 'restricted' });
        }
      }
    });

    socket.on('unblock:user', (targetUserId) => {
      const userId = sessions.get(socket.id);
      if (!userId) return;
      const user = users.get(userId);
      if (user) {
        user.blockedUsers.delete(targetUserId);

        // Notify the target user that they've been unrestricted
        const targetSocketId = Array.from(sessions.entries())
          .find(([sid, uid]) => uid === targetUserId)?.[0];
        if (targetSocketId) {
          io.to(targetSocketId).emit('restriction:update', { byUserId: userId, status: 'unrestricted' });
        }
      }
    });

    socket.on('match:find', () => {
      const userId = sessions.get(socket.id);
      if (!userId) return;

      if (matchingQueue.includes(socket.id)) return;

      const user = users.get(userId);
      if (!user) return;

      // Try to find a peer with common interests
      const peerSocketId = matchingQueue.find(sid => {
        const peerUid = sessions.get(sid);
        const peer = users.get(peerUid || '');
        if (!peer) return false;
        
        // Simple overlap check
        const overlap = (user as any).interests?.some((i: string) => (peer as any).interests?.includes(i));
        return overlap || matchingQueue.length > 5; // Match anyway if queue is too long
      });

      if (peerSocketId && io.sockets.sockets.has(peerSocketId)) {
        const idx = matchingQueue.indexOf(peerSocketId);
        if (idx > -1) matchingQueue.splice(idx, 1);

        const peerUserId = sessions.get(peerSocketId);
        const peerUser = users.get(peerUserId || '');

        if (peerUser) {
          socket.emit('match:found', { peerId: peerUser.id, peerNickname: peerUser.nickname, peerGender: peerUser.gender });
          io.to(peerSocketId).emit('match:found', { peerId: user.id, peerNickname: user.nickname, peerGender: user.gender });
        }
      } else {
        matchingQueue.push(socket.id);
      }
    });

    socket.on('match:cancel', () => {
      const idx = matchingQueue.indexOf(socket.id);
      if (idx > -1) matchingQueue.splice(idx, 1);
    });

    socket.on("disconnect", () => {
      const idx = matchingQueue.indexOf(socket.id);
      if (idx > -1) matchingQueue.splice(idx, 1);
      
      const userId = sessions.get(socket.id);
      if (userId) {
        const user = users.get(userId);
        if (user) {
          sessions.delete(socket.id);
          
          // Immediate removal
          if (user.currentRoom) {
            const roomObj = rooms.find(rm => rm.id === user.currentRoom);
            if (roomObj) {
              roomObj.userCount = Math.max(0, roomObj.userCount - 1);
              io.emit('rooms:updated' as any, rooms);
            }
          }
          
          io.emit('user:left', user.id);
          users.delete(userId);
          console.log(`User ${user.nickname} removed immediately on disconnect.`);
        }
      }
    });
  });

  function joinRoom(socket: any, roomId: string) {
    const userId = sessions.get(socket.id);
    if (!userId) {
      console.log(`JoinRoom failed: No session for socket ${socket.id}`);
      return;
    }
    const user = users.get(userId);
    if (!user) {
      console.log(`JoinRoom failed: No user for userId ${userId}`);
      return;
    }

    // Leave previous room (using user state instead of socket state to handle resumes)
    const previousRoomId = user.currentRoom;
    if (previousRoomId) {
      socket.leave(previousRoomId);
      const roomObj = rooms.find(rm => rm.id === previousRoomId);
      if (roomObj) {
        roomObj.userCount = Math.max(0, roomObj.userCount - 1);
      }
    }

    socket.join(roomId);
    user.currentRoom = roomId;
    const targetRoom = rooms.find(rm => rm.id === roomId);
    if (targetRoom) targetRoom.userCount++;

    console.log(`User ${user.nickname} joined room ${roomId}. New count: ${targetRoom?.userCount}`);

    // Notify all about room counts immediately to reflect changes accurately
    io.emit('rooms:updated' as any, rooms);

    // Notify others in the room
    socket.to(roomId).emit('user:joined', { 
      id: user.id, 
      nickname: user.nickname, 
      gender: user.gender, 
      currentRoom: user.currentRoom,
      isDND: user.isDND
    });
    
    // Get all members IDs in the room from adapter
    const roomMemberSocketIds = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
    
    // Map to ensure absolute uniqueness by userId (prevents clones during refresh/reconnect)
    const membersMap = new Map<string, any>();
    
    roomMemberSocketIds.forEach(sid => {
      const uid = sessions.get(sid);
      const u = users.get(uid || '');
      if (u && !membersMap.has(u.id)) {
        membersMap.set(u.id, { 
          id: u.id, 
          nickname: u.nickname, 
          gender: u.gender, 
          currentRoom: u.currentRoom,
          isDND: u.isDND
        });
      }
    });
    
    const members = Array.from(membersMap.values());
    
    console.log(`Room ${roomId} members list generated: ${members.length} unique users`);
    socket.emit('users:list', members as any);
    
    // Notify all about room counts
    io.emit('rooms:updated' as any, rooms);
  }

  // Vite + Express setup
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`ChatBubble server running on http://localhost:${PORT}`);
  });
}

startServer();
