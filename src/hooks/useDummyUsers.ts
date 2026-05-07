import { useState, useEffect } from 'react';
import { Gender, ResponseProfile } from '../types';

interface DummyUser {
  id: string;
  nickname: string;
  gender: Gender;
  isDummy: boolean;
  currentRoom: string;
  responseProfile: ResponseProfile;
}

const TARGET_MIN_DUMMIES = 186;
const TARGET_MAX_DUMMIES = 222;
const MALE_PROBABILITY = 0.85;
const CYCLE_INTERVAL_MS = (2 * 60 * 60 * 1000) / TARGET_MIN_DUMMIES;
const TRAFFIC_SIMULATION_INTERVAL_MS = 15000; // Check every 15s to make it feel more active

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
];

const NAME_POOLS: Record<string, { male: string[], female: string[] }> = {
  indian: {
    male: [
      'Arjun', 'Ayaan', 'Advait', 'Kabir', 'Rohan', 'Ishaan', 'Aarav', 'Vihaan', 'Aryan', 'Krishna', 
      'Abhishek', 'Akash', 'Aman', 'Aniket', 'Ankit', 'Gaurav', 'Hardik', 'Kunal', 'Mohit', 'Nikhil', 
      'Parth', 'Pranav', 'Raghav', 'Rajat', 'Sahil', 'Sanket', 'Shubham', 'Sumit', 'Suraj', 'Vaibhav', 
      'Vikas', 'Vishal', 'Yuvraj', 'Aditya', 'Vikram', 'Sanjay', 'Rahul', 'Varun', 'Siddharth', 'Kartik',
      'Yash', 'Dev', 'Anish', 'Rishi', 'Karan', 'Sameer', 'Amit', 'Prakash', 'Rajesh', 'Manish', 'Suresh',
      'Deepak', 'Vijay', 'Sunil', 'Anil', 'Pankaj', 'Abhay', 'Arpit', 'Ashish', 'Bhavin', 'Chaitanya',
      'Chirag', 'Darshan', 'Dhaval', 'Harshal', 'Hemant', 'Inder', 'Jatin', 'Jay', 'Jignesh', 'Kailash',
      'Kalpesh', 'Lalit', 'Mahesh', 'Mayur', 'Milan', 'Nakul', 'Naman', 'Navin', 'Nihar', 'Nirav',
      'Nishant', 'Pranay', 'Prateek', 'Punit', 'Rakesh', 'Rishabh', 'Ritvik', 'Sagar', 'Sarthak', 'Satish',
      'Shailesh', 'Shakti', 'Shantanu', 'Sohan', 'Sourabh', 'Tejas', 'Tushar', 'Umesh', 'Utkarsh', 'Vinay',
      'Vineet', 'Vipul', 'Yogesh', 'Reyansh', 'Vivaan', 'Atharv', 'Shaurya', 'Aayush', 'Zayan', 'Saif',
      'Hrithik', 'Ranbir', 'Ayushmaan', 'Om', 'Shiv', 'Hari', 'Bhuvan', 'Dhruv', 'Swaroop', 'Prasoon',
      'Keshav', 'Madhav', 'Gopal', 'Gautam', 'Kashyap', 'Raghu', 'Murthy', 'Samba', 'Venkatesh', 'Rami',
      'Kiran', 'Tarun', 'Harsha', 'Anant', 'Eshan', 'Ishir', 'Jairaj', 'Kovid', 'Lakshey', 'Mihir',
      'Naveen', 'Ojas', 'Pallav', 'Qadir', 'Ranveer', 'Sohail', 'Tanmay', 'Udbhav', 'Vatsal', 'Wajid'
    ],
    female: [
      'Ananya', 'Diya', 'Ishani', 'Kiara', 'Myra', 'Navya', 'Pari', 'Riya', 'Saisha', 'Vanya', 
      'Zoya', 'Aditi', 'Ishika', 'Kavya', 'Meera', 'Sara', 'Anjali', 'Ankita', 'Deepali', 'Disha', 
      'Kajal', 'Komal', 'Neha', 'Pooja', 'Priyanka', 'Sakshi', 'Sanjana', 'Sneha', 'Tanvi', 'Shruti', 
      'Shweta', 'Priya', 'Tanya', 'Avni', 'Gia', 'Ira', 'Khushi', 'Nora', 'Prisha', 'Siya', 'Aadhya',
      'Anika', 'Aarohi', 'Amoli', 'Bhavna', 'Chitra', 'Divya', 'Esha', 'Aarti', 'Aashna', 'Akshara',
      'Alka', 'Amita', 'Anshika', 'Archana', 'Asha', 'Asmita', 'Bela', 'Bhakti', 'Binal', 'Dhara',
      'Dipti', 'Gauri', 'Hansa', 'Harsha', 'Hetal', 'Indira', 'Jagriti', 'Janvi', 'Jaya', 'Jyoti',
      'Kalpana', 'Kamini', 'Kanchan', 'Karishma', 'Kruti', 'Latika', 'Leela', 'Madhu', 'Mamta',
      'Manasi', 'Manita', 'Mansi', 'Maya', 'Megha', 'Mona', 'Monica', 'Namrata', 'Nandini', 'Nayana',
      'Neelam', 'Neeta', 'Nidhi', 'Nikita', 'Nilam', 'Nirali', 'Nisha', 'Padmini', 'Pallavi', 'Payal',
      'Poonam', 'Prachi', 'Pragati', 'Pratibha', 'Preeti', 'Prerna', 'Priyal', 'Puja', 'Radha', 'Ragini',
      'Raksha', 'Rashmi', 'Raveena', 'Reena', 'Rekha', 'Renuka', 'Rina', 'Ritu', 'Roshni', 'Rupal',
      'Saloni', 'Sandhya', 'Sangita', 'Sapna', 'Sarika', 'Savita', 'Seema', 'Shalu', 'Shanti', 'Sheetal',
      'Shikha', 'Shilpa', 'Shivani', 'Shraddha', 'Shreya', 'Sonal', 'Sonali', 'Sonia', 'Sudha', 'Sujata',
      'Sunita', 'Sushma', 'Swati', 'Trisha', 'Tulsi', 'Urvashi', 'Usha', 'Vaishali', 'Varsha', 'Vidya',
      'Vinita', 'Yamini'
    ]
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

  const getRandomProfile = (gender: Gender): ResponseProfile => {
    // Distribution requested: 
    // Female: 5% Quick, 40% Moderate, 10% Sluggish, 45% Lurker
    const rand = Math.random() * 100;
    
    if (gender === 'Female') {
      if (rand < 5) return 'Quick';
      if (rand < 45) return 'Moderate';
      if (rand < 55) return 'Sluggish';
      return 'Lurker';
    } else {
      // For males, we can keep a similar but slightly different distribution 
      // or same if not specified, but let's stick to requested for consistency 
      // where specified and maybe more active for others.
      if (rand < 10) return 'Quick';
      if (rand < 50) return 'Moderate';
      if (rand < 70) return 'Sluggish';
      return 'Lurker';
    }
  };

  const generateNickname = (isMale: boolean, roomId: string, existingFullNicknames: Set<string>) => {
    const roomInfo = ROOM_DATA.find(r => r.id === roomId) || ROOM_DATA[0];
    const pool = NAME_POOLS[roomInfo.names] || NAME_POOLS.indian;
    const nameList = isMale ? pool.male : pool.female;
    
    let baseName = nameList[Math.floor(Math.random() * nameList.length)];
    let nickname = baseName;
    
    // Check if baseName is already taken
    if (existingFullNicknames.has(nickname)) {
      // Force append a number if cloned
      nickname = `${baseName}${Math.floor(Math.random() * 99) + 1}`;
      
      // If still taken, try with underscore
      if (existingFullNicknames.has(nickname)) {
        nickname = `${baseName}_${Math.floor(Math.random() * 99) + 100}`;
      }
    } else {
      // Small chance to add a number even if not taken, for variety
      const rand = Math.random();
      if (rand > 0.85) {
        nickname = `${baseName}${Math.floor(Math.random() * 99) + 1}`;
      } else if (rand > 0.95) {
        nickname = `${baseName}_${Math.floor(Math.random() * 9)}`;
      }
    }

    return nickname;
  };
  
  useEffect(() => {
    const generateInitialDummies = () => {
      const initialCount = Math.floor(Math.random() * (TARGET_MAX_DUMMIES - TARGET_MIN_DUMMIES + 1)) + TARGET_MIN_DUMMIES;
      const dummies: DummyUser[] = [];
      const usedNicknames = new Set<string>();

      for (let i = 0; i < initialCount; i++) {
        const isMale = Math.random() < MALE_PROBABILITY;
        const gender: Gender = isMale ? 'Male' : 'Female';
        const roomId = getRandomRoomId();
        const nickname = generateNickname(isMale, roomId, usedNicknames);
        usedNicknames.add(nickname);
        
        dummies.push({
          id: `dummy-${i}-${Date.now()}`,
          nickname,
          gender,
          isDummy: true,
          currentRoom: roomId,
          responseProfile: getRandomProfile(gender)
        });
      }
      return dummies;
    };

    setActiveDummies(generateInitialDummies());
  }, []);

  useEffect(() => {
    if (activeDummies.length === 0) return;

    // Cycle existing users
    const cycleInterval = setInterval(() => {
      setActiveDummies(prev => {
        if (prev.length === 0) return prev;
        const next = [...prev];
        const indexToReplace = Math.floor(Math.random() * next.length);
        const currentNicknames = new Set<string>(next.map(u => u.nickname));
        
        const isMale = Math.random() < MALE_PROBABILITY;
        const gender: Gender = isMale ? 'Male' : 'Female';
        const roomId = getRandomRoomId();
        const nickname = generateNickname(isMale, roomId, currentNicknames);

        next[indexToReplace] = {
          id: `dummy-${Date.now()}-${Math.random()}`,
          nickname,
          gender,
          isDummy: true,
          currentRoom: roomId,
          responseProfile: getRandomProfile(gender)
        };
        
        return next;
      });
    }, CYCLE_INTERVAL_MS);

    // Simulate traffic (Add/Remove users)
    const trafficInterval = setInterval(() => {
      setActiveDummies(prev => {
        const count = prev.length;
        // Bias towards adding if near min, bias towards removing if near max
        const shouldAdd = count < TARGET_MAX_DUMMIES && (count <= TARGET_MIN_DUMMIES || Math.random() > 0.5);
        const shouldRemove = !shouldAdd && count > TARGET_MIN_DUMMIES;

        if (shouldAdd) {
          const isMale = Math.random() < MALE_PROBABILITY;
          const gender: Gender = isMale ? 'Male' : 'Female';
          const roomId = getRandomRoomId();
          const currentNicknames = new Set<string>(prev.map(u => u.nickname));
          const nickname = generateNickname(isMale, roomId, currentNicknames);
          
          return [...prev, {
            id: `dummy-join-${Date.now()}-${Math.random()}`,
            nickname,
            gender,
            isDummy: true,
            currentRoom: roomId,
            responseProfile: getRandomProfile(gender)
          }];
        } else if (shouldRemove) {
          const randomIndex = Math.floor(Math.random() * prev.length);
          return prev.filter((_, i) => i !== randomIndex);
        }

        return prev;
      });
    }, TRAFFIC_SIMULATION_INTERVAL_MS);

    return () => {
      clearInterval(cycleInterval);
      clearInterval(trafficInterval);
    };
  }, [activeDummies.length]);

  return activeDummies;
};
