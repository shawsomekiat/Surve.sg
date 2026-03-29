import { useState, useRef, useEffect } from 'react';
import SurveyorSidebar from '../../components/SurveyorSidebar';

interface ChatMessage {
  id: string;
  company: string;
  text: string;
  time: string;
  isOwn?: boolean;
}

const COMPANIES = [
  { name: 'TechCorp SG', online: true, initials: 'TC' },
  { name: 'DataInsights Ltd', online: true, initials: 'DI' },
  { name: 'Market Research Pro', online: false, initials: 'MR' },
  { name: 'Consumer Analytics', online: true, initials: 'CA' },
];

const REPLIES: Record<string, string[]> = {
  'TechCorp SG': [
    'Sounds great! We have experience in that area.',
    'Would love to discuss further. DM us!',
    'Our team is available this week for a call.',
  ],
  'DataInsights Ltd': [
    'We can help with that. What is your target sample size?',
    'Our panel covers 50k+ Singapore respondents.',
    'Interested! What is your timeline?',
  ],
  'Consumer Analytics': [
    'Happy to collaborate on this.',
    'We specialize in consumer behavior research.',
    'Let us set up a meeting to discuss.',
  ],
  'Market Research Pro': [
    'Thanks for the interest!',
    'We will get back to you shortly.',
  ],
};

function getTime() {
  const now = new Date();
  return now.toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', hour12: false });
}

const initialMessages: ChatMessage[] = [
  { id: '1', company: 'TechCorp SG', text: 'Looking for partners for B2B survey collaboration', time: '09:14' },
  { id: '2', company: 'DataInsights Ltd', text: 'We can help! DM for details', time: '09:15' },
  { id: '3', company: 'Consumer Analytics', text: 'Anyone running healthcare surveys this quarter?', time: '09:22' },
  { id: '4', company: 'TechCorp SG', text: 'We are! Reach out to our team.', time: '09:24' },
];

const stats = [
  { label: 'Total Surveys', value: 15, icon: '📋' },
  { label: 'Active', value: 13, icon: '✅' },
  { label: 'Responses', value: 4, icon: '📊' },
  { label: 'Completed', value: 0, icon: '🏁' },
];

export default function Hub() {
  const [activeTab, setActiveTab] = useState<'public' | 'dm'>('public');
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [selectedDmCompany, setSelectedDmCompany] = useState<string | null>(null);
  const [dmMessages, setDmMessages] = useState<ChatMessage[]>([]);
  const [dmInput, setDmInput] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const dmBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    dmBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [dmMessages]);

  const sendPublicMessage = () => {
    if (!inputText.trim()) return;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      company: 'Acne Tech',
      text: inputText.trim(),
      time: getTime(),
      isOwn: true,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    const replyCompanies = COMPANIES.filter((c) => c.online && c.name !== 'Acne Tech');
    const replyFrom = replyCompanies[Math.floor(Math.random() * replyCompanies.length)];
    const replyPool = REPLIES[replyFrom.name] || ['Noted!'];
    const replyText = replyPool[Math.floor(Math.random() * replyPool.length)];

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), company: replyFrom.name, text: replyText, time: getTime() },
      ]);
    }, 1500);
  };

  const sendDmMessage = () => {
    if (!dmInput.trim() || !selectedDmCompany) return;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      company: 'Acne Tech',
      text: dmInput.trim(),
      time: getTime(),
      isOwn: true,
    };
    setDmMessages((prev) => [...prev, newMsg]);
    setDmInput('');

    const replyPool = REPLIES[selectedDmCompany] || ['Got it, thanks!'];
    const replyText = replyPool[Math.floor(Math.random() * replyPool.length)];
    setTimeout(() => {
      setDmMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), company: selectedDmCompany, text: replyText, time: getTime() },
      ]);
    }, 1500);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f2f0' }}>
      <SurveyorSidebar />

      <div style={{ flex: 1, padding: '32px', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header */}
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0d1117' }}>Collaboration Hub</h1>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {stats.map((stat) => (
            <div key={stat.label} style={{
              background: '#fff', borderRadius: '12px', padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{stat.icon}</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#0d1117', marginBottom: '4px' }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Company Network Header */}
        <div style={{
          background: '#fff', borderRadius: '14px', padding: '20px 24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0d1117' }}>Company Network</h2>
            <span style={{
              background: '#dcfce7', color: '#166534', fontSize: '11px',
              fontWeight: 700, padding: '2px 10px', borderRadius: '20px',
            }}>
              3 online
            </span>
          </div>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#2d7a4f' }}>
            View All
          </button>
        </div>

        {/* Main Chat Area */}
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '20px', flex: 1 }}>
          {/* Company List */}
          <div style={{ background: '#fff', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #f3f4f6' }}>
              {(['public', 'dm'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); if (tab === 'public') setSelectedDmCompany(null); }}
                  style={{
                    flex: 1, padding: '12px 8px', border: 'none', cursor: 'pointer',
                    fontSize: '12px', fontWeight: 600, textTransform: 'capitalize',
                    background: activeTab === tab ? '#f0fdf4' : '#fff',
                    color: activeTab === tab ? '#2d7a4f' : '#9ca3af',
                    borderBottom: activeTab === tab ? '2px solid #2d7a4f' : '2px solid transparent',
                  }}
                >
                  {tab === 'public' ? 'Public Chat' : 'Direct Messages'}
                </button>
              ))}
            </div>

            {/* Company items */}
            <div style={{ padding: '8px' }}>
              {COMPANIES.map((company) => (
                <div
                  key={company.name}
                  onClick={() => { if (activeTab === 'dm') { setSelectedDmCompany(company.name); } }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 12px', borderRadius: '10px', cursor: activeTab === 'dm' ? 'pointer' : 'default',
                    background: selectedDmCompany === company.name ? '#f0fdf4' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab === 'dm') (e.currentTarget as HTMLDivElement).style.background = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.background = selectedDmCompany === company.name ? '#f0fdf4' : 'transparent';
                  }}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: '#0d1117', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: '#fff', fontSize: '11px',
                    fontWeight: 700, flexShrink: 0,
                  }}>
                    {company.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#0d1117', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {company.name}
                    </div>
                    <div style={{ fontSize: '11px', color: company.online ? '#22c55e' : '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: company.online ? '#22c55e' : '#d1d5db', display: 'inline-block' }} />
                      {company.online ? 'Online' : 'Offline'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Feed */}
          <div style={{
            background: '#fff', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            {/* Chat header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#0d1117' }}>
                {activeTab === 'public' ? '# Public Chat' : selectedDmCompany ? `💬 ${selectedDmCompany}` : 'Select a company to message'}
              </div>
              {activeTab === 'public' && (
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>All companies can see this</div>
              )}
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px', minHeight: '300px', maxHeight: '400px' }}>
              {activeTab === 'public' ? (
                messages.map((msg) => (
                  <div key={msg.id} style={{ display: 'flex', gap: '10px', flexDirection: msg.isOwn ? 'row-reverse' : 'row' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      background: msg.isOwn ? '#2d7a4f' : '#0d1117',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: '10px', fontWeight: 700, flexShrink: 0,
                    }}>
                      {msg.isOwn ? 'AT' : (COMPANIES.find((c) => c.name === msg.company)?.initials || msg.company.slice(0, 2).toUpperCase())}
                    </div>
                    <div style={{ maxWidth: '70%' }}>
                      <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px', textAlign: msg.isOwn ? 'right' : 'left' }}>
                        {msg.company} · {msg.time}
                      </div>
                      <div style={{
                        padding: '10px 14px', borderRadius: msg.isOwn ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                        background: msg.isOwn ? '#2d7a4f' : '#f3f4f6',
                        color: msg.isOwn ? '#fff' : '#374151',
                        fontSize: '13px', lineHeight: '1.5',
                      }}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                ))
              ) : selectedDmCompany ? (
                dmMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#9ca3af', padding: '32px', fontSize: '14px' }}>
                    Start a conversation with {selectedDmCompany}
                  </div>
                ) : (
                  dmMessages.map((msg) => (
                    <div key={msg.id} style={{ display: 'flex', gap: '10px', flexDirection: msg.isOwn ? 'row-reverse' : 'row' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: msg.isOwn ? '#2d7a4f' : '#0d1117',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: '10px', fontWeight: 700, flexShrink: 0,
                      }}>
                        {msg.isOwn ? 'AT' : (COMPANIES.find((c) => c.name === msg.company)?.initials || msg.company.slice(0, 2).toUpperCase())}
                      </div>
                      <div style={{ maxWidth: '70%' }}>
                        <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px', textAlign: msg.isOwn ? 'right' : 'left' }}>
                          {msg.company} · {msg.time}
                        </div>
                        <div style={{
                          padding: '10px 14px', borderRadius: msg.isOwn ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                          background: msg.isOwn ? '#2d7a4f' : '#f3f4f6',
                          color: msg.isOwn ? '#fff' : '#374151',
                          fontSize: '13px', lineHeight: '1.5',
                        }}>
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  ))
                )
              ) : (
                <div style={{ textAlign: 'center', color: '#9ca3af', padding: '32px', fontSize: '14px' }}>
                  Select a company from the list to start a direct message
                </div>
              )}
              <div ref={activeTab === 'public' ? chatBottomRef : dmBottomRef} />
            </div>

            {/* Input */}
            {(activeTab === 'public' || (activeTab === 'dm' && selectedDmCompany)) && (
              <div style={{ padding: '16px 20px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={activeTab === 'public' ? inputText : dmInput}
                  onChange={(e) => activeTab === 'public' ? setInputText(e.target.value) : setDmInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') activeTab === 'public' ? sendPublicMessage() : sendDmMessage();
                  }}
                  placeholder={activeTab === 'public' ? 'Type a message to the network...' : `Message ${selectedDmCompany}...`}
                  style={{
                    flex: 1, padding: '10px 14px', borderRadius: '10px',
                    border: '1.5px solid #e5e7eb', fontSize: '13px',
                    fontFamily: 'Inter, sans-serif', outline: 'none',
                  }}
                />
                <button
                  onClick={activeTab === 'public' ? sendPublicMessage : sendDmMessage}
                  style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: '#2d7a4f', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', color: '#fff',
                  }}
                >
                  ➤
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}