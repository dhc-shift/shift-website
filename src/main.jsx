import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import './styles.css';
import { isSupabaseConfigured, supabase } from './supabase.js';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Activities from './pages/Activities.jsx';
import Archive from './pages/Archive.jsx';
import Board from './pages/Board.jsx';
import More from './pages/More.jsx';
import MyPage from './pages/MyPage.jsx';
import LoginPage, { UpdatePasswordPage } from './pages/LoginPage.jsx';
import AdminPage from './pages/Admin.jsx';

function App(){
  const navigate = useNavigate();
  const location = useLocation();
  const [user,setUser]=useState(null);
  const [profile,setProfile]=useState(null);
  const [newsletters,setNewsletters]=useState([]);
  const [events,setEvents]=useState([]);
  const [members,setMembers]=useState([]);
  const [notices,setNotices]=useState([]);
  const [documents,setDocuments]=useState([]);
  const [suggestions,setSuggestions]=useState([]);
  const [memberSummary,setMemberSummary]=useState(null);
  const [memberStats,setMemberStats]=useState(null);
  const [mileageHistory,setMileageHistory]=useState([]);
  const [mileageItems,setMileageItems]=useState([]);
  const [activities,setActivities]=useState([]);
  const [roster,setRoster]=useState([]);
  const [loading,setLoading]=useState(isSupabaseConfigured);
  const [loadError,setLoadError]=useState(false);

  // 기존 컴포넌트들이 쓰던 setPage(id) 인터페이스를 라우터 이동으로 연결
  const setPage = id => navigate(id === 'home' ? '/' : `/${id}`);
  const page = location.pathname === '/' ? 'home' : location.pathname.slice(1);

  const loadData=async(currentUser=user)=>{
    if(!supabase)return;
    try{
      const [{data:news},{data:eventRows},{data:noticeRows},{data:documentRows},{data:summaryRow},{data:itemRows},{data:activityRows}]=await Promise.all([
        supabase.from('newsletters').select('*').order('published_at',{ascending:false}),
        supabase.from('calendar_events').select('*').order('event_date'),
        supabase.from('notices').select('*').order('is_pinned',{ascending:false}).order('published_at',{ascending:false}),
        supabase.from('documents').select('*').order('created_at',{ascending:false}),
        supabase.from('public_member_summary').select('*').eq('id',1).maybeSingle(),
        supabase.from('mileage_items').select('*').order('base_score',{ascending:false}),
        supabase.from('activities').select('*, activity_members(id,member_name,student_id,member_role)').order('created_at',{ascending:false})
      ]);
      setNewsletters((news||[]).map(item=>({...item,file_url:supabase.storage.from('newsletters').getPublicUrl(item.file_path).data.publicUrl})));
      setEvents(eventRows||[]);
      setNotices(noticeRows||[]);
      setDocuments((documentRows||[]).map(item=>({...item,file_url:supabase.storage.from('documents').getPublicUrl(item.file_path).data.publicUrl})));
      setMemberSummary(summaryRow||null);
      setMileageItems(itemRows||[]);
      setActivities((activityRows||[]).map(item=>({...item,poster_url:item.poster_path?supabase.storage.from('posters').getPublicUrl(item.poster_path).data.publicUrl:null})));
      if(currentUser){
        const [{data:p},{data:stats},{data:history}]=await Promise.all([
          supabase.from('profiles').select('*').eq('id',currentUser.id).maybeSingle(),
          supabase.from('member_stats').select('*').ilike('email',currentUser.email).maybeSingle(),
          supabase.from('mileage_history').select('*').order('activity_date',{ascending:false})
        ]);
        setProfile(p);
        setMemberStats(stats||null);
        setMileageHistory(history||[]);
        if(p?.role==='admin'){
          const [{data:m},{data:s},{data:r}]=await Promise.all([
            supabase.from('profiles').select('*').order('created_at'),
            supabase.from('suggestions').select('*, profiles(name,email)').order('created_at',{ascending:false}),
            supabase.from('member_stats').select('student_id,name,cohort').order('name')
          ]);
          setMembers(m||[]);
          setSuggestions(s||[]);
          setRoster(r||[]);
        }
      }else{
        setProfile(null);setMemberStats(null);setMileageHistory([]);setMembers([]);setSuggestions([]);setRoster([]);
      }
      setLoadError(false);
    }catch(err){
      console.error('데이터 로딩 실패:', err);
      setLoadError(true);
    }finally{
      setLoading(false);
    }
  };

  useEffect(()=>{
    if(!isSupabaseConfigured)return;
    supabase.auth.getSession().then(({data})=>{const u=data.session?.user||null;setUser(u);loadData(u)});
    const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{const u=session?.user||null;setUser(u);if(event==='PASSWORD_RECOVERY')navigate('/reset');setTimeout(()=>loadData(u),0)});
    return()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{ window.scrollTo({ top: 0 }); },[location.pathname]);

  const signOut=async()=>{await supabase.auth.signOut();setUser(null);setProfile(null);navigate('/')};

  return <>
    <Header page={page} setPage={setPage} user={user} profile={profile} memberStats={memberStats} signOut={signOut}/>
    {loadError&&<div className="admin-notice container" role="alert">데이터를 불러오지 못했습니다. 네트워크 상태를 확인한 뒤 새로고침해주세요.</div>}
    <main>
      {loading?<div className="app-loading"><img src="/shift-header-logo.png" alt="SHIFT"/><i/></div>:
      <Routes>
        <Route path="/" element={<Home setPage={setPage} notices={notices} activities={activities} user={user}/>}/>
        <Route path="/about" element={<About summary={memberSummary}/>}/>
        <Route path="/activities" element={<Activities calendarEvents={events} user={user} activities={activities}/>}/>
        <Route path="/archive" element={<Archive activities={activities}/>}/>
        <Route path="/board" element={<Board newsletters={newsletters} notices={notices} documents={documents} user={user}/>}/>
        <Route path="/more" element={<More setPage={setPage} user={user} memberStats={memberStats} mileageHistory={mileageHistory} summary={memberSummary} mileageItems={mileageItems}/>}/>
        <Route path="/mypage" element={user?<MyPage setPage={setPage} profile={profile} memberStats={memberStats} activities={activities} refresh={()=>loadData(user)}/>:<LoginPage user={user} profile={profile} setPage={setPage}/>}/>
        <Route path="/login" element={<LoginPage user={user} profile={profile} setPage={setPage}/>}/>
        <Route path="/reset" element={<UpdatePasswordPage setPage={setPage}/>}/>
        <Route path="/admin" element={<AdminPage profile={profile} newsletters={newsletters} events={events} members={members} notices={notices} documents={documents} suggestions={suggestions} activities={activities} roster={roster} refresh={()=>loadData(user)}/>}/>
        <Route path="*" element={<NotFound setPage={setPage}/>}/>
      </Routes>}
    </main>
    <Footer setPage={setPage}/>
  </>;
}

function NotFound({ setPage }){
  return <section className="auth-page container"><div className="auth-card"><span className="eyebrow">404</span><h1>페이지를 찾을 수 없어요</h1><p>주소가 바뀌었거나 삭제된 페이지입니다.</p><button className="button" onClick={()=>setPage('home')}>홈으로 돌아가기</button></div></section>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><BrowserRouter><App/></BrowserRouter></React.StrictMode>);
