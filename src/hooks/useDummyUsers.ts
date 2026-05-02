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

const TOTAL_DUMMIES = 45;
const MALE_PROBABILITY = 0.85;
const CYCLE_INTERVAL_MS = (2 * 60 * 60 * 1000) / TOTAL_DUMMIES; // Total 2 hours divided by 45 users

export const useDummyUsers = () => {
  const [activeDummies, setActiveDummies] = useState<DummyUser[]>([]);

  const generateNickname = (isMale: boolean, existingNames: Set<string>) => {
    const namePool = isMale ? MALE_NAMES : FEMALE_NAMES;
    let baseName = '';
    let nickname = '';
    let attempts = 0;

    // Try to find a base name that isn't already used in the current batch
    do {
      baseName = namePool[Math.floor(Math.random() * namePool.length)];
      attempts++;
    } while (existingNames.has(baseName) && attempts < 20);

    const rand = Math.random();
    if (rand < 0.7) {
      // 70% pure name
      nickname = baseName;
    } else if (rand < 0.85) {
      // 15% name with simple number
      const num = Math.floor(Math.random() * 99) + 1;
      nickname = `${baseName}${num}`;
    } else if (rand < 0.95) {
      // 10% name with underscore and number
      const num = Math.floor(Math.random() * 999);
      nickname = `${baseName}_${num}`;
    } else {
      // 5% with "cool" suffix
      const suffixes = ['_vibe', '_king', '_heart', '_rocks', '_star', '007', '_bot'];
      const suf = suffixes[Math.floor(Math.random() * suffixes.length)];
      nickname = `${baseName}${suf}`;
    }

    return nickname;
  };
  
  // Initialize or maintain dummy pool
  useEffect(() => {
    const generateInitialDummies = () => {
      const dummies: DummyUser[] = [];
      const usedBaseNames = new Set<string>();

      for (let i = 0; i < TOTAL_DUMMIES; i++) {
        const isMale = Math.random() < MALE_PROBABILITY;
        const nickname = generateNickname(isMale, usedBaseNames);
        
        // Extract base name to track it
        const baseName = nickname.split(/[0-9_]/)[0];
        usedBaseNames.add(baseName);
        
        dummies.push({
          id: `dummy-${i}-${Date.now()}`,
          nickname,
          gender: isMale ? 'Male' : 'Female',
          isDummy: true,
          currentRoom: 'lobby'
        });
      }
      return dummies;
    };

    setActiveDummies(generateInitialDummies());
  }, []);

  // Cycling mechanism
  useEffect(() => {
    if (activeDummies.length === 0) return;

    const interval = setInterval(() => {
      setActiveDummies(prev => {
        const next = [...prev];
        const indexToReplace = Math.floor(Math.random() * next.length);
        
        // Track currently used base names to avoid duplicates
        const currentBaseNames = new Set(next.map(u => u.nickname.split(/[0-9_]/)[0]));
        
        const isMale = Math.random() < MALE_PROBABILITY;
        const nickname = generateNickname(isMale, currentBaseNames);

        next[indexToReplace] = {
          id: `dummy-${Date.now()}-${Math.random()}`,
          nickname,
          gender: isMale ? 'Male' : 'Female',
          isDummy: true,
          currentRoom: 'lobby'
        };
        
        return next;
      });
    }, CYCLE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [activeDummies.length]);

  return activeDummies;
};
