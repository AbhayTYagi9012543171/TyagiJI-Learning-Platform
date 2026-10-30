import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, BookOpen, Bookmark, CheckCircle2, CircleDashed, GraduationCap, Trophy, RefreshCw, ArrowRight } from 'lucide-react';
import { api } from '../../services/api.js';

const definitions = [
  { id:'first-lesson', title:'First Step', description:'Complete your first lesson.', icon:BookOpen, goal:1, metric:'lessons', points:10 },
  { id:'lesson-learner', title:'Knowledge Builder', description:'Complete 10 lessons.', icon:GraduationCap, goal:10, metric:'lessons', points:30 },
  { id:'course-explorer', title:'Course Explorer', description:'Start your first course.', icon:CompassIcon, goal:1, metric:'courses', points:15 },
  { id:'quiz-practice', title:'Quiz Practitioner', description:'Complete 5 quiz attempts.', icon:CheckCircle2, goal:5, metric:'quizzes', points:25 },
  { id:'resource-saver', title:'Knowledge Seeker', description:'Save 5 learning bookmarks.', icon:Bookmark, goal:5, metric:'bookmarks', points:20 },
];
function CompassIcon(props){ return <Trophy {...props}/>; }

export default function AchievementsPage(){
  const [dashboard,setDashboard]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const load=async()=>{setLoading(true);setError('');try{const response=await api('/users/me/dashboard');setDashboard(response.dashboard||{});}catch(e){setError(e.message||'Unable to load achievement progress.');}finally{setLoading(false);}};
  useEffect(()=>{load();},[]);
  const courses=dashboard?.courses||[];
  const metrics={lessons:Number(dashboard?.completedLessons||0),courses:courses.length,quizzes:Number(dashboard?.quizAttempts||0),bookmarks:Number(dashboard?.bookmarks||0)};
  const earned=definitions.filter(item=>metrics[item.metric]>=item.goal);
  const points=earned.reduce((sum,item)=>sum+item.points,0);
  return <main className="page shell v9-achievements">
    <header className="intro"><span className="eyebrow">YOUR LEARNING MILESTONES</span><h1>Achievements that reflect your progress.</h1><p>Milestones are calculated from the learning activity currently recorded in your account.</p></header>
    {error&&<div className="notice error-notice" role="alert">{error}<button className="btn quiet" onClick={load}><RefreshCw size={14}/> Retry</button></div>}
    {loading?<div className="loading-state">Loading your learning milestones…</div>:<>
      <section className="v9-achievement-summary"><div className="v9-achievement-score"><span className="v9-achievement-icon"><Trophy/></span><div><small>UNLOCKED MILESTONES</small><strong>{earned.length}<span> / {definitions.length}</span></strong><p>{points} milestone points earned</p></div></div><div className="v9-achievement-stat"><small>Lessons completed</small><strong>{metrics.lessons}</strong></div><div className="v9-achievement-stat"><small>Courses started</small><strong>{metrics.courses}</strong></div><div className="v9-achievement-stat"><small>Quiz attempts</small><strong>{metrics.quizzes}</strong></div></section>
      <div className="section-head v9-achievement-heading"><div><span className="eyebrow">BADGE COLLECTION</span><h2>Your milestones</h2></div><Link className="text-link" to="/progress">Detailed progress <ArrowRight size={15}/></Link></div>
      <section className="v9-badge-grid">{definitions.map(item=>{const Icon=item.icon;const value=metrics[item.metric];const unlocked=value>=item.goal;const progress=Math.min(100,Math.round(value/item.goal*100));return <article className={`v9-badge-card ${unlocked?'is-unlocked':''}`} key={item.id}><div className="v9-badge-top"><span className="v9-badge-icon"><Icon/></span><span className={`v9-badge-status ${unlocked?'earned':''}`}>{unlocked?'Unlocked':'In progress'}</span></div><h3>{item.title}</h3><p>{item.description}</p><div className="v9-badge-progress"><div><span>{value} / {item.goal}</span><b>{progress}%</b></div><span className="v9-progress-track"><i style={{width:`${progress}%`}}/></span></div><small>+{item.points} points</small></article>})}</section>
      <div className="v9-achievement-note"><Award/><p><strong>About these milestones</strong><br/>This release derives milestone status from your saved dashboard counters. Permanent badge records, configurable admin rules and certificate issuance require a separate persistent achievement service and are not claimed as active in this page.</p></div>
    </>}
  </main>;
}
