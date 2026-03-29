import { useState, useRef, useEffect } from 'react';
import SurveyorSidebar from '../../components/SurveyorSidebar';

interface ChatMessage {
  id: string;
  company: string;
  text: string;
  time: string;
  isOwn?: boolean;
}

interface CollabPost {
  id: string;
  company: string;
  initials: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  posted: string;
  connected: boolean;
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

const COLLAB_CATEGORIES = ['All', 'Data Sharing', 'Joint Research', 'Co-Branding', 'Revenue Share', 'Tech Partnership'];

const initialCollabPosts: CollabPost[] = [
  {
    id: '1',
    company: 'TechCorp SG',
    initials: 'TC',
    title: 'Looking for survey data partners — AI & Tech adoption study',
    description: 'We are building an AI-powered analytics product and need survey data on tech adoption in Singapore. Open to data-sharing agreements with relevant research firms.',
    tags: ['Data Sharing', 'AI/ML', 'Tech'],
    category: 'Data Sharing',
    posted: '2h ago',
    connected: false,
  },
  {
    id: '2',
    company: 'DataInsights Ltd',
    initials: 'DI',
    title: 'Joint research project — Consumer behaviour post-2024',
    description: 'Seeking a co-researcher for a 6-month longitudinal study on Singaporean consumer behaviour. We will split costs and co-publish findings. Strong preference for firms with FMCG panels.',
    tags: ['Joint Research', 'Consumer', 'FMCG'],
    category: 'Joint Research',
    posted: '5h ago',
    connected: false,
  },
  {
    id: '3',
    company: 'Market Research Pro',
    initials: 'MR',
    title: 'Co-branding opportunity — Quarterly F&B dining habits report',
    description: 'Looking for F&B brands or research agencies to co-brand our quarterly Singapore Dining Habits Report. Estimated reach: 12,000 industry readers.',
    tags: ['Co-Branding', 'F&B', 'Report'],
    category: 'Co-Branding',
    posted: '1d ago',
    connected: false,
  },
  {
    id: '4',
    company: 'Consumer Analytics',
    initials: 'CA',
    title: 'Revenue share model for niche demographic surveys',
    description: 'Proposing a 60/40 revenue share arrangement for specialty surveys targeting Gen Z and senior demographics. We provide the distribution, you provide the questions.',
    tags: ['Revenue Share', 'Gen Z', 'Demographics'],
    category: 'Revenue Share',
    posted: '2d ago',
    connected: false,
  },
  {
    id: '5',
    company: 'DataInsights Ltd',
    initials: 'DI',
    title: 'API integration partner for real-time survey data feeds',
    description: 'We are building a real-time dashboard product and looking for a tech partner to integrate survey data streams. Equity or revenue-share structure negotiable.',
    tags: ['Tech Partnership', 'API', 'SaaS'],
    category: 'Tech Partnership',
    posted: '3d ago',
    connected: false,
  },
];

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
  const [activeTab, setActiveTab] = useState<'public' | 'dm' | 'startup'>('public');
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [selectedDmCompany, setSelectedDmCompany] = useState<string | null>(null);
  const [dmMessages, setDmMessages] = useState<ChatMessage[]>([]);
  const [dmInput, setDmInput] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const dmBottomRef = useRef<HTMLDivElement>(null);

  // Startup collab state
  const [collabPosts, setCollabPosts] = useState<CollabPost[]>(initialCollabPosts);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showPostForm, setShowPostForm] = useState(false);
  const [postForm, setPostForm] = useState({ title: '', description: '', category: 'Data Sharing', tags: '' });
  const [postError, setPostError] = useState('');

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

  const handleConnect = (postId: string) => {
    setCollabPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, connected: !p.connected } : p))
    );
  };

  const handlePostSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault();
    setPostError('');
    if (!postForm.title.trim() || !postForm.description.trim()) {
      setPostError('Please fill in a title and description.');
      return;
    }
    const tags = postForm.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const newPost: CollabPost = {
      id: Date.now().toString(),
      company: 'Acne Tech',
      initials: 'AT',
      title: postForm.title.trim(),
      description: postForm.description.trim(),
      tags: tags.length ? tags : [postForm.category],
      category: postForm.category,
      posted: 'Just now',
      connected: false,
    };
    setCollabPosts((prev) => [newPost, ...prev]);
    setPostForm({ title: '', description: '', category: 'Data Sharing', tags: '' });
    setShowPostForm(false);
    setSelectedCategory('All');
  };

  const filteredPosts = selectedCategory === 'All'
    ? collabPosts
    : collabPosts.filter((p) => p.category === selectedCategory);

  const tagColors: Record<string, string> = {
    'Data Sharing': '#dbeafe',
    'Joint Research': '#fef9c3',
    'Co-Branding': '#fce7f3',
    'Revenue Share': '#dcfce7',
    'Tech Partnership': '#ede9fe',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1.5px solid #e5e7eb',
    fontSize: '13px',
    fontFamily: 'Inter, sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
    color: '#0d1117',
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

        {/* Main Area */}
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '20px', flex: 1 }}>
          {/* Left Panel — Tabs + company list */}
          <div style={{ background: '#fff', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid #f3f4f6' }}>
              {([
                { key: 'public', label: 'Public Chat' },
                { key: 'dm', label: 'Direct Messages' },
                { key: 'startup', label: 'Startup Collab' },
              ] as const).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    if (tab.key !== 'dm') setSelectedDmCompany(null);
                  }}
                  style={{
                    padding: '11px 14px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600,
                    textAlign: 'left',
                    background: activeTab === tab.key ? '#f0fdf4' : '#fff',
                    color: activeTab === tab.key ? '#2d7a4f' : '#9ca3af',
                    borderLeft: activeTab === tab.key ? '3px solid #2d7a4f' : '3px solid transparent',
                    fontFamily: 'Inter, sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '14px' }}>
                    {tab.key === 'public' ? '💬' : tab.key === 'dm' ? '✉️' : '🚀'}
                  </span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Company list (shown for public + dm tabs) */}
            {activeTab !== 'startup' && (
              <div style={{ padding: '8px', flex: 1, overflow: 'auto' }}>
                {COMPANIES.map((company) => (
                  <div
                    key={company.name}
                    onClick={() => { if (activeTab === 'dm') setSelectedDmCompany(company.name); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 12px', borderRadius: '10px',
                      cursor: activeTab === 'dm' ? 'pointer' : 'default',
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
            )}

            {/* Category filters (shown for startup tab) */}
            {activeTab === 'startup' && (
              <div style={{ padding: '8px', flex: 1, overflow: 'auto' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', padding: '8px 12px 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Filter by Type
                </p>
                {COLLAB_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '9px 12px',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: selectedCategory === cat ? '#f0fdf4' : 'transparent',
                      color: selectedCategory === cat ? '#2d7a4f' : '#6b7280',
                      fontFamily: 'Inter, sans-serif',
                      marginBottom: '2px',
                    }}
                  >
                    {cat}
                    {cat !== 'All' && (
                      <span style={{ float: 'right', fontSize: '11px', color: '#9ca3af', fontWeight: 400 }}>
                        {collabPosts.filter((p) => p.category === cat).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel */}
          {activeTab !== 'startup' ? (
            /* Chat Feed */
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
                    placeholder={activeTab === 'public' ? 'Type a public message to all companies...' : `Message ${selectedDmCompany}...`}
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
          ) : (
            /* Startup Collaboration Panel */
            <div style={{
              background: '#fff', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}>
              {/* Header */}
              <div style={{
                padding: '16px 20px', borderBottom: '1px solid #f3f4f6',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#0d1117' }}>
                    🚀 Startup Collaboration Board
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                    {filteredPosts.length} opportunit{filteredPosts.length === 1 ? 'y' : 'ies'} · Connect with research startups
                  </div>
                </div>
                <button
                  onClick={() => setShowPostForm((v) => !v)}
                  style={{
                    background: showPostForm ? '#f3f4f6' : '#2d7a4f',
                    color: showPostForm ? '#374151' : '#fff',
                    border: 'none', borderRadius: '9px',
                    padding: '8px 16px', fontSize: '13px', fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {showPostForm ? '✕ Cancel' : '+ Post Opportunity'}
                </button>
              </div>

              <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Post Opportunity Form */}
                {showPostForm && (
                  <div style={{
                    border: '1.5px dashed #2d7a4f', borderRadius: '12px',
                    padding: '20px', background: '#f0fdf4',
                  }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0d1117', marginBottom: '16px' }}>
                      Post a Collaboration Opportunity
                    </h3>
                    <form onSubmit={handlePostSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                          Title
                        </label>
                        <input
                          type="text"
                          value={postForm.title}
                          onChange={(e) => setPostForm((f) => ({ ...f, title: e.target.value }))}
                          placeholder="e.g. Looking for a co-research partner in healthcare"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                          Description
                        </label>
                        <textarea
                          value={postForm.description}
                          onChange={(e) => setPostForm((f) => ({ ...f, description: e.target.value }))}
                          placeholder="Describe the collaboration opportunity, what you need, and what you offer..."
                          rows={3}
                          style={{ ...inputStyle, resize: 'vertical' }}
                        />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                            Category
                          </label>
                          <select
                            value={postForm.category}
                            onChange={(e) => setPostForm((f) => ({ ...f, category: e.target.value }))}
                            style={{ ...inputStyle, background: '#fff' }}
                          >
                            {COLLAB_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '5px' }}>
                            Tags (comma-separated)
                          </label>
                          <input
                            type="text"
                            value={postForm.tags}
                            onChange={(e) => setPostForm((f) => ({ ...f, tags: e.target.value }))}
                            placeholder="e.g. AI, Healthcare, B2B"
                            style={inputStyle}
                          />
                        </div>
                      </div>
                      {postError && (
                        <p style={{ color: '#ef4444', fontSize: '12px', fontWeight: 500, margin: 0 }}>{postError}</p>
                      )}
                      <button
                        type="submit"
                        style={{
                          background: '#2d7a4f', color: '#fff', border: 'none',
                          borderRadius: '9px', padding: '10px 18px',
                          fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                          alignSelf: 'flex-start', fontFamily: 'Inter, sans-serif',
                        }}
                      >
                        Publish Opportunity →
                      </button>
                    </form>
                  </div>
                )}

                {/* Opportunity Cards */}
                {filteredPosts.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#9ca3af', padding: '48px', fontSize: '14px' }}>
                    No opportunities in this category yet.
                  </div>
                ) : (
                  filteredPosts.map((post) => (
                    <div
                      key={post.id}
                      style={{
                        border: '1.5px solid #f3f4f6',
                        borderRadius: '12px',
                        padding: '18px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        transition: 'border-color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#d1fae5')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#f3f4f6')}
                    >
                      {/* Company row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '34px', height: '34px', borderRadius: '9px',
                            background: post.company === 'Acne Tech' ? '#2d7a4f' : '#0d1117',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: '11px', fontWeight: 700,
                          }}>
                            {post.initials}
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0d1117' }}>{post.company}</div>
                            <div style={{ fontSize: '11px', color: '#9ca3af' }}>{post.posted}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleConnect(post.id)}
                          style={{
                            background: post.connected ? '#dcfce7' : '#0d1117',
                            color: post.connected ? '#166534' : '#fff',
                            border: 'none', borderRadius: '8px',
                            padding: '7px 16px', fontSize: '12px', fontWeight: 600,
                            cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                            transition: 'all 0.15s',
                          }}
                        >
                          {post.connected ? '✓ Connected' : 'Connect'}
                        </button>
                      </div>

                      {/* Title + description */}
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0d1117', marginBottom: '6px', lineHeight: '1.4' }}>
                          {post.title}
                        </div>
                        <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.6' }}>
                          {post.description}
                        </div>
                      </div>

                      {/* Tags */}
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            style={{
                              background: tagColors[tag] || '#f3f4f6',
                              color: '#374151',
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '3px 10px',
                              borderRadius: '20px',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
