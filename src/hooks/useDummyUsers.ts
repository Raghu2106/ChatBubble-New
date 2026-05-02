import { useState, useEffect, useMemo } from 'react';
import { Gender } from '../types';

interface DummyUser {
  id: string;
  nickname: string;
  gender: Gender;
  isDummy: boolean;
  currentRoom: string;
}

const MALE_NAMES = [
  'Arjun', 'Ayaan', 'Advait', 'Kabir', 'Rohan', 'Ishaan', 'Aarav', 'Vihaan', 
  'Vivaan', 'Reyansh', 'Aryan', 'Atharv', 'Krishna', 'Shaurya', 'Aayush', 
  'Zayan', 'Saif', 'Hrithik', 'Varun', 'Siddharth', 'Ranbir', 'Aditya', 
  'Kartik', 'Ayushmaan', 'Anish', 'Dev', 'Yash', 'Rishi', 'Karan', 'Sameer',
  'Rahul', 'Vikram', 'Amit', 'Sanjay', 'Prakash', 'Rajesh', 'Manish', 'Suresh',
  'Deepak', 'Vijay', 'Sunil', 'Anil', 'Pankaj', 'Om', 'Shiv', 'Hari',
  'Abhay', 'Abhishek', 'Akash', 'Aman', 'Aniket', 'Ankit', 'Arpit', 'Ashish',
  'Bhavin', 'Chaitanya', 'Chirag', 'Darshan', 'Dhaval', 'Gaurav', 'Hardik',
  'Harshal', 'Hemant', 'Inder', 'Jatin', 'Jay', 'Jignesh', 'Kailash', 'Kalpesh',
  'Kunal', 'Lalit', 'Mahesh', 'Mayur', 'Milan', 'Mohit', 'Nakul', 'Naman',
  'Navin', 'Nihar', 'Nikhil', 'Nirav', 'Nishant', 'Parth', 'Pranav', 'Pranay',
  'Prateek', 'Punit', 'Raghav', 'Rajat', 'Rakesh', 'Rishabh', 'Ritvik', 'Sagar',
  'Sahil', 'Sanket', 'Sarthak', 'Satish', 'Shailesh', 'Shakti', 'Shantanu',
  'Shubham', 'Sohan', 'Sourabh', 'Sumit', 'Suraj', 'Tejas', 'Tushar', 'Umesh',
  'Utkarsh', 'Vaibhav', 'Vikas', 'Vinay', 'Vineet', 'Vipul', 'Vishal', 'Yogesh',
  'Yuvraj'
];

const FEMALE_NAMES = [
  'Ananya', 'Diya', 'Ishani', 'Kiara', 'Myra', 'Navya', 'Pari', 'Riya', 
  'Saisha', 'Vanya', 'Zoya', 'Aditi', 'Ishika', 'Kavya', 'Meera', 'Sara',
  'Tanya', 'Avni', 'Gia', 'Ira', 'Khushi', 'Nora', 'Prisha', 'Siya',
  'Aadhya', 'Anika', 'Aarohi', 'Amoli', 'Bhavna', 'Chitra', 'Divya', 'Esha',
  'Aarti', 'Aashna', 'Akshara', 'Alka', 'Amita', 'Anjali', 'Ankita', 'Anshika',
  'Archana', 'Asha', 'Asmita', 'Bela', 'Bhakti', 'Binal', 'Deepali', 'Dhara',
  'Dipti', 'Disha', 'Gauri', 'Hansa', 'Harsha', 'Hetal', 'Indira', 'Jagriti',
  'Janvi', 'Jaya', 'Jyoti', 'Kajal', 'Kalpana', 'Kamini', 'Kanchan', 'Karishma',
  'Komal', 'Kruti', 'Latika', 'Leela', 'Madhu', 'Mamta', 'Manasi', 'Manita',
  'Mansi', 'Maya', 'Megha', 'Mona', 'Monica', 'Namrata', 'Nandini', 'Nayana',
  'Neelam', 'Neeta', 'Neha', 'Nidhi', 'Nikita', 'Nilam', 'Nirali', 'Nisha',
  'Padmini', 'Pallavi', 'Payal', 'Pooja', 'Poonam', 'Prachi', 'Pragati', 'Pratibha',
  'Preeti', 'Prerna', 'Priyal', 'Priyanka', 'Puja', 'Radha', 'Ragini', 'Raksha',
  'Rashmi', 'Raveena', 'Reena', 'Rekha', 'Renuka', 'Rina', 'Ritu', 'Roshni',
  'Rupal', 'Sakshi', 'Saloni', 'Sandhya', 'Sangita', 'Sanjana', 'Sapna', 'Sarika',
  'Savita', 'Seema', 'Shalu', 'Shanti', 'Sheetal', 'Shikha', 'Shilpa', 'Shivani',
  'Shraddha', 'Shreya', 'Shruti', 'Shweta', 'Sneha', 'Sonal', 'Sonali', 'Sonia',
  'Sudha', 'Sujata', 'Sunita', 'Sushma', 'Swati', 'Tanvi', 'Trisha', 'Tulsi',
  'Urvashi', 'Usha', 'Vaishali', 'Varsha', 'Vidya', 'Vinita', 'Yamini'
];

const TOTAL_DUMMIES = 123;
const MALE_PROBABILITY = 0.85;
const CYCLE_INTERVAL_MS = (2 * 60 * 60 * 1000) / TOTAL_DUMMIES;

const ROOM_DATA = [
  { id: 'lobby', weight: 15, names: 'indian' },
  { id: 'mumbai', weight: 18, names: 'indian' },
  { id: 'delhi', weight: 16, names: 'indian' },
  { id: 'bangalore', weight: 12, names: 'indian' },
  { id: 'usa', weight: 14, names: 'western' },
  { id: 'uk', weight: 10, names: 'western' },
  { id: 'canada', weight: 6, names: 'western' },
  { id: 'australia', weight: 5, names: 'western' },
  { id: 'uae', weight: 4, names: 'arabic' },
  { id: 'singapore', weight: 3, names: 'east_asian' },
  { id: 'germany', weight: 3, names: 'western' },
  { id: 'saudi', weight: 3, names: 'arabic' },
  { id: 'japan', weight: 2, names: 'east_asian' },
  { id: 'hyderabad', weight: 4, names: 'indian' },
  { id: 'chennai', weight: 3, names: 'indian' },
  { id: 'kolkata', weight: 3, names: 'indian' },
  { id: 'lucknow', weight: 2, names: 'indian' },
];

const NAME_POOLS: Record<string, { male: string[], female: string[] }> = {
  indian: {
    male: ['Arjun', 'Ayaan', 'Advait', 'Kabir', 'Rohan', 'Ishaan', 'Aarav', 'Vihaan', 'Aryan', 'Krishna', 'Abhishek', 'Akash', 'Aman', 'Aniket', 'Ankit', 'Gaurav', 'Hardik', 'Kunal', 'Mohit', 'Nikhil', 'Parth', 'Pranav', 'Raghav', 'Rajat', 'Sahil', 'Sanket', 'Shubham', 'Sumit', 'Suraj', 'Vaibhav', 'Vikas', 'Vishal', 'Yuvraj', 'Aditya', 'Vikram', 'Sanjay', 'Rahul', 'Varun', 'Siddharth', 'Kartik'],
    female: ['Ananya', 'Diya', 'Ishani', 'Kiara', 'Myra', 'Navya', 'Pari', 'Riya', 'Saisha', 'Vanya', 'Zoya', 'Aditi', 'Ishika', 'Kavya', 'Meera', 'Sara', 'Anjali', 'Ankita', 'Deepali', 'Disha', 'Kajal', 'Komal', 'Neha', 'Pooja', 'Priyanka', 'Sakshi', 'Sanjana', 'Sneha', 'Tanvi', 'Shruti', 'Shweta', 'Priya']
  },
  western: {
    male: ['James', 'Robert', 'John', 'Michael', 'David', 'William', 'Richard', 'Joseph', 'Thomas', 'Christopher', 'Charles', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Kevin', 'Brian', 'George', 'Timothy', 'Ronald', 'Edward', 'Jason', 'Jeffrey', 'Ryan', 'Jacob', 'Gary', 'Nicholas', 'Eric', 'Stephen'],
    female: ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen', 'Lisa', 'Nancy', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle', 'Dorothy', 'Carol', 'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Sharon', 'Laura']
  },
  arabic: {
    male: ['Ahmed', 'Mohammed', 'Omar', 'Ali', 'Hassan', 'Ibrahim', 'Mustafa', 'Youssef', 'Zaid', 'Kareem', 'Hamza', 'Fareed', 'Bilal', 'Nasir', 'Khalid', 'Sami', 'Tarik', 'Faisal'],
    female: ['Fatima', 'Layla', 'Aisha', 'Amira', 'Zahra', 'Noor', 'Mariam', 'Salma', 'Habiba', 'Rania', 'Dina', 'Yasmeen', 'Hana', 'Mona', 'Lina', 'Safa']
  },
  east_asian: {
    male: ['Wei', 'Li', 'Min', 'Hiroshi', 'Kenji', 'Jae', 'Sang', 'Takumi', 'Yuki', 'Chen', 'Bo', 'Jun', 'Ji', 'Minsu', 'Hyun', 'Kaito', 'Sora', 'Ren'],
    female: ['Mei', 'Lin', 'Sakura', 'Hana', 'Ji-won', 'Su-bin', 'Yuna', 'Aimi', 'Xia', 'Fan', 'Ying', 'Momo', 'Rin', 'Hina', 'Seo-yeon']
  }
};

export const useDummyUsers = () => {
  const [activeDummies, setActiveDummies] = useState<DummyUser[]>([]);

  const getRandomRoomId = () => {
    const totalWeight = ROOM_DATA.reduce((acc, r) => acc + r.weight, 0);
    let random = Math.random() * totalWeight;
    for (const room of ROOM_DATA) {
      if (random < room.weight) return room.id;
      random -= room.weight;
    }
    return 'lobby';
  };

  const generateNickname = (isMale: boolean, roomId: string, existingNames: Set<string>) => {
    const roomInfo = ROOM_DATA.find(r => r.id === roomId) || ROOM_DATA[0];
    const pool = NAME_POOLS[roomInfo.names] || NAME_POOLS.indian;
    const nameList = isMale ? pool.male : pool.female;
    
    let baseName = '';
    let nickname = '';
    let attempts = 0;

    do {
      baseName = nameList[Math.floor(Math.random() * nameList.length)];
      attempts++;
    } while (existingNames.has(baseName) && attempts < 20);

    const rand = Math.random();
    if (rand < 0.75) {
      nickname = baseName;
    } else if (rand < 0.9) {
      nickname = `${baseName}${Math.floor(Math.random() * 99) + 1}`;
    } else {
      nickname = `${baseName}_${Math.floor(Math.random() * 9)}`;
    }

    return nickname;
  };
  
  useEffect(() => {
    const generateInitialDummies = () => {
      const dummies: DummyUser[] = [];
      const usedBaseNames = new Set<string>();

      for (let i = 0; i < TOTAL_DUMMIES; i++) {
        const isMale = Math.random() < MALE_PROBABILITY;
        const roomId = getRandomRoomId();
        const nickname = generateNickname(isMale, roomId, usedBaseNames);
        const baseName = nickname.split(/[0-9_]/)[0];
        usedBaseNames.add(baseName);
        
        dummies.push({
          id: `dummy-${i}-${Date.now()}`,
          nickname,
          gender: isMale ? 'Male' : 'Female',
          isDummy: true,
          currentRoom: roomId
        });
      }
      return dummies;
    };

    setActiveDummies(generateInitialDummies());
  }, []);

  useEffect(() => {
    if (activeDummies.length === 0) return;

    const interval = setInterval(() => {
      setActiveDummies(prev => {
        const next = [...prev];
        const indexToReplace = Math.floor(Math.random() * next.length);
        const currentBaseNames = new Set(next.map(u => u.nickname.split(/[0-9_]/)[0]));
        
        const isMale = Math.random() < MALE_PROBABILITY;
        const roomId = getRandomRoomId();
        const nickname = generateNickname(isMale, roomId, currentBaseNames);

        next[indexToReplace] = {
          id: `dummy-${Date.now()}-${Math.random()}`,
          nickname,
          gender: isMale ? 'Male' : 'Female',
          isDummy: true,
          currentRoom: roomId
        };
        
        return next;
      });
    }, CYCLE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [activeDummies.length]);

  return activeDummies;
};
