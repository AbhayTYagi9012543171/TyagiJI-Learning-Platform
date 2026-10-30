import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Code2, Compass, GraduationCap, Target, Users, Rocket, ShieldCheck } from 'lucide-react';

const pillars = [
  { icon: BookOpen, title: 'Learn with structure', text: 'Follow organized courses, focused lessons and clear learning outcomes instead of jumping between disconnected tutorials.' },
  { icon: Code2, title: 'Practice with purpose', text: 'Reinforce concepts with quizzes, examples, cheatsheets and guided exercises.' },
  { icon: Rocket, title: 'Build real projects', text: 'Turn knowledge into working applications through practical project briefs and implementation steps.' },
];
const stages = ['Programming fundamentals', 'HTML, CSS and JavaScript', 'React and modern frontend', 'Node.js, Express and databases', 'Full-stack applications', 'Portfolio-ready projects'];

export default function AboutPage() {
  return <main className="page shell v9-about">
    <section className="v9-about-hero">
      <span className="eyebrow">ABOUT TYAGIJI LEARNING PLATFORM</span>
      <h1>Learning should lead to <em>making.</em></h1>
      <p>TyagiJI Learning Platform brings structured software-development learning, practical references and project-based practice together in one place.</p>
      <div className="hero-actions"><Link className="btn primary big" to="/courses">Explore courses <ArrowRight size={17}/></Link><Link className="btn outline big" to="/projects">Explore projects</Link></div>
    </section>
    <section className="v9-about-mission">
      <div><span className="eyebrow">OUR MISSION</span><h2>Make technical learning clear, practical and progressive.</h2></div>
      <p>We believe learners make stronger progress when concepts are explained clearly, practiced regularly and applied in projects. The platform is designed to support that complete journey—from the first lesson to a finished build.</p>
    </section>
    <section className="section v9-about-section"><div className="section-head"><div><span className="eyebrow">HOW LEARNING WORKS</span><h2>Understand. Practice. Build.</h2></div><p>Three connected parts of one learning experience.</p></div>
      <div className="v9-pillar-grid">{pillars.map(({icon:Icon,title,text},i)=><article className="v9-pillar" key={title}><span className="v9-pillar-number">0{i+1}</span><div className="feature-icon"><Icon/></div><h3>{title}</h3><p>{text}</p></article>)}</div>
    </section>
    <section className="v9-roadmap"><div><span className="eyebrow">A PROGRESSIVE PATH</span><h2>From fundamentals to full-stack confidence.</h2><p>Build knowledge in a sensible order and apply each stage through practical work.</p><Link className="text-link" to="/courses">Browse learning paths <ArrowRight size={15}/></Link></div><ol>{stages.map((stage,i)=><li key={stage}><span>{String(i+1).padStart(2,'0')}</span>{stage}</li>)}</ol></section>
    <section className="v9-about-values"><article><Target/><h3>Clear outcomes</h3><p>Know what each learning activity is designed to teach.</p></article><article><Compass/><h3>Guided discovery</h3><p>Move from concepts to relevant resources and practice.</p></article><article><ShieldCheck/><h3>Progress you can see</h3><p>Use saved progress and learning history to understand your journey.</p></article><article><Users/><h3>Learner-focused</h3><p>Keep the experience organized around your next useful step.</p></article></section>
    <section className="v9-about-cta"><div><span className="eyebrow">YOUR NEXT STEP STARTS HERE</span><h2>Choose a skill. Start building.</h2><p>Explore courses, find a reference or take on a practical project.</p></div><Link className="btn primary big" to="/courses">Start learning <ArrowRight size={17}/></Link></section>
  </main>;
}
