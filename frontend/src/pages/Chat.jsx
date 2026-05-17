import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';

export default function Chat() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`http://localhost:8080/user-data`, {
          method:'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem('userId', data.id);
          localStorage.setItem('username', data.username);
          localStorage.setItem('email', data.email);
        }
        
        // Since user-data only returns UserDTO, we initialize with empty contacts.
        // Users can search for a contact using the search bar.
        setContacts([]);
      } catch(e) {
         console.error("Failed to load user data:", e);
      } finally {
         setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <div className={`w-full md:w-auto h-full flex-shrink-0 ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
        {!loading && <Sidebar selectedChat={selectedChat} setSelectedChat={setSelectedChat} contacts={contacts} setContacts={setContacts} />}
      </div>
      <div className={`flex-1 h-full w-full ${!selectedChat ? 'hidden md:flex' : 'flex'}`}>
        {!loading && <ChatArea chat={selectedChat} onBack={() => setSelectedChat(null)} contacts={contacts} setContacts={setContacts} />}
      </div>
    </div>
  );
}