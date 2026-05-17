export const currentUser = {
  id: 'u1',
  name: 'Alex Johnson',
  avatar: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
  status: 'online'
};

export const contacts = [
  { id: 'c1', name: 'Sarah Miller', avatar: 'https://cdn-icons-png.flaticon.com/512/149/149071.png', status: 'online', unread: 2, lastMessage: 'See you tomorrow!', time: '10:30 AM' },
  { id: 'c2', name: 'David Smith', avatar: 'https://cdn-icons-png.flaticon.com/512/149/149071.png', status: 'offline', unread: 0, lastMessage: 'The new design looks great.', time: 'Yesterday' },
  { id: 'c3', name: 'Design Team', avatar: 'https://cdn-icons-png.flaticon.com/512/149/149071.png', status: 'online', unread: 5, lastMessage: 'Can someone review the PR?', time: '09:15 AM' },
  { id: 'c4', name: 'Emma Wilson', avatar: 'https://cdn-icons-png.flaticon.com/512/149/149071.png', status: 'offline', unread: 0, lastMessage: 'Thanks!', time: 'Tuesday' }
];

export const messages = {
  'c1': [
    { id: 'm1', senderId: 'c1', text: 'Hey Alex, are we still on for the meeting?', timestamp: '10:00 AM' },
    { id: 'm2', senderId: 'u1', text: 'Yes! Let\'s meet at 11.', timestamp: '10:15 AM' },
    { id: 'm3', senderId: 'c1', text: 'Perfect. See you tomorrow!', timestamp: '10:30 AM' }
  ],
  'c2': [
    { id: 'm4', senderId: 'c2', text: 'Checking out the new update.', timestamp: 'Yesterday' },
    { id: 'm5', senderId: 'u1', text: 'What do you think?', timestamp: 'Yesterday' },
    { id: 'm6', senderId: 'c2', text: 'The new design looks great.', timestamp: 'Yesterday' }
  ]
};