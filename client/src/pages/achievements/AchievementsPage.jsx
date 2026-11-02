
import { useEffect, useMemo, useState } from 'react';
import {
  Award, Trophy, Medal, Target, Flame, Star, Lock, Search,
  CheckCircle2, Clock3, Sparkles, ChevronRight, Filter,
  BookOpen, Code2, Zap, Crown, RefreshCw, AlertCircle,
  ArrowUpRight, ShieldCheck, X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import '../../styles/pages/achievements-premium.css';

const CATEGORIES = ['All', 'Learning', 'Coding', 'Projects', 'Consistency', 'Special'];

const FALLBACK_ACHIEVEMENTS = [
  {
    _id: 'first-course',
    title: 'First Steps',
    description: 'Complete your first learning course.',
    category: 'Learning',
    icon: 'book',
    points: 100,
    progress: 100,
    requirement: 'Complete 1 course',
    earned: true
  },
  {
    _id: 'code-starter',
    title: 'Code Starter',
    description: 'Write your first coding solution.',
    category: 'Coding',
    icon: 'code',
    points: 150,
    progress: 100,
    requirement: 'Submit your first solution',
    earned: true
  },
  {
    _id: 'project-builder',
    title: 'Project Builder',
    description: 'Build and submit your first project.',
    category: 'Projects',
    icon: 'target',
    points: 250,
    progress: 65,
    requirement: 'Complete your first project',
    earned: false
  },
  {
    _id: 'seven-day-streak',
    title: 'Consistency Champion',
    description: 'Maintain a seven-day learning streak.',
    category: 'Consistency',
    icon: 'flame',
    points: 200,
    progress: 43,
    requirement: 'Learn for 7 consecutive days',
    earned: false
  },
  {
    _id: 'knowledge-seeker',
    title: 'Knowledge Seeker',
    description: 'Explore five different learning topics.',
    category: 'Learning',
    icon: 'star',
    points: 175,
    progress: 60,
    requirement: 'Explore 5 topics',
    earned: false
  },
  {
    _id: 'fast-learner',
    title: 'Fast Learner',
    description: 'Complete ten lessons.',
    category: 'Learning',
    icon: 'zap',
    points: 300,
    progress: 80,
    requirement: 'Complete 10 lessons',
    earned: false
  },
  {
    _id: 'master-builder',
    title: 'Master Builder',
    description: 'Complete five practical projects.',
    category: 'Projects',
    icon: 'crown',
    points: 500,
    progress: 20,
    requirement: 'Complete 5 projects',
    earned: false
  },
  {
    _id: 'perfect-score',
    title: 'Perfect Score',
    description: 'Achieve a perfect quiz score.',
    category: 'Special',
    icon: 'trophy',
    points: 350,
    progress: 0,
    requirement: 'Score 100% in a quiz',
    earned: false
  }
];

const ICONS = {
  book: BookOpen,
  code: Code2,
  target: Target,
  flame: Flame,
  star: Star,
  zap: Zap,
  crown: Crown,
  trophy: Trophy,
  award: Award,
  medal: Medal
};

function normalizeAchievement(item, index) {
  const progress = Math.min(100, Math.max(0, Number(item.progress ?? 0)));
  return {
    ...item,
    _id: item._id || item.id || `achievement-${index}`,
    title: item.title || item.name || 'Achievement',
    description: item.description || item.summary || 'Keep learning to unlock this achievement.',
    category: item.category || 'Special',
    points: Number(item.points ?? item.xp ?? 0),
    progress,
    earned: Boolean(item.earned ?? item.isEarned ?? item.unlocked ?? false),
    requirement: item.requirement || item.criteria || 'Complete the required activity',
    icon: item.icon || 'award'
  };
}

function getIcon(name) {
  return ICONS[String(name || '').toLowerCase()] || Award;
}

function AchievementCard({ item, onDetails }) {
  const Icon = getIcon(item.icon);
  const earned = item.earned;

  return (
    <article className={`achievement-card ${earned ? 'is-earned' : 'is-locked'}`}>
      <div className="achievement-card-top">
        <div className={`achievement-icon ${earned ? 'earned-icon' : ''}`}>
          <Icon size={25} strokeWidth={1.8} />
          {!earned && <span className="achievement-lock"><Lock size={12} /></span>}
        </div>
        <span className={`achievement-status ${earned ? 'status-earned' : 'status-locked'}`}>
          {earned ? <><CheckCircle2 size={13} /> Earned</> : <><Lock size={12} /> Locked</>}
        </span>
      </div>

      <div className="achievement-card-content">
        <span className="achievement-category">{item.category}</span>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>

      <div className="achievement-card-progress">
        <div className="achievement-progress-label">
          <span>{earned ? 'Completed' : 'Your progress'}</span>
          <strong>{earned ? '100%' : `${item.progress}%`}</strong>
        </div>
        <div
          className="achievement-progress-track"
          role="progressbar"
          aria-valuenow={earned ? 100 : item.progress}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label={`${item.title} progress`}
        >
          <span style={{ width: `${earned ? 100 : item.progress}%` }} />
        </div>
      </div>

      <div className="achievement-card-footer">
        <span className="achievement-points"><Sparkles size={14} /> {item.points} XP</span>
        <button type="button" className="achievement-detail-btn" onClick={() => onDetails(item)}>
          Details <ChevronRight size={15} />
        </button>
      </div>
    </article>
  );
}

function AchievementDetails({ item, onClose }) {
  if (!item) return null;
  const Icon = getIcon(item.icon);

  return (
    <div className="achievement-modal-backdrop" onClick={onClose}>
      <section
        className="achievement-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="achievement-modal-title"
        onClick={event => event.stopPropagation()}
      >
        <button className="achievement-modal-close" onClick={onClose} aria-label="Close details">
          <X size={19} />
        </button>
        <div className={`achievement-modal-icon ${item.earned ? 'earned-icon' : ''}`}>
          <Icon size={34} />
        </div>
        <span className="achievement-category">{item.category}</span>
        <h2 id="achievement-modal-title">{item.title}</h2>
        <p>{item.description}</p>

        <div className="achievement-modal-requirement">
          <span>Requirement</span>
          <strong>{item.requirement}</strong>
        </div>

        <div className="achievement-modal-progress">
          <div className="achievement-progress-label">
            <span>Achievement progress</span>
            <strong>{item.earned ? 100 : item.progress}%</strong>
          </div>
          <div className="achievement-progress-track">
            <span style={{ width: `${item.earned ? 100 : item.progress}%` }} />
          </div>
        </div>

        <div className="achievement-modal-reward">
          <Sparkles size={18} />
          <span>Reward</span>
          <strong>{item.points} XP</strong>
        </div>

        <button className="achievement-primary-btn" onClick={onClose}>Got it</button>
      </section>
    </div>
  );
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState([]);
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAchievements = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/achievements');
      const payload = response?.data?.data ?? response?.data;
      const rows = Array.isArray(payload)
        ? payload
        : payload?.achievements || payload?.items || [];

      setAchievements(rows.map(normalizeAchievement));
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        'Achievements could not be loaded from the server.'
      );
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAchievements();
  }, []);

  const stats = useMemo(() => {
    const earned = achievements.filter(item => item.earned);
    const totalXP = earned.reduce((sum, item) => sum + item.points, 0);
    return {
      total: achievements.length,
      earned: earned.length,
      locked: achievements.length - earned.length,
      xp: totalXP,
      percentage: achievements.length
        ? Math.round((earned.length / achievements.length) * 100)
        : 0
    };
  }, [achievements]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return achievements.filter(item => {
      const categoryMatch = category === 'All' || item.category.toLowerCase() === category.toLowerCase();
      const statusMatch =
        status === 'all' ||
        (status === 'earned' && item.earned) ||
        (status === 'locked' && !item.earned);

      const searchMatch = !query ||
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      return categoryMatch && statusMatch && searchMatch;
    });
  }, [achievements, category, status, search]);

  return (
    <main className="achievements-page">
      <div className="achievements-shell">
        <div className="achievement-breadcrumb">
          <Link to="/">Home</Link><ChevronRight size={14} /><span>Achievements</span>
        </div>

        <section className="achievements-hero">
          <div className="achievements-hero-copy">
            <span className="achievements-eyebrow"><Sparkles size={14} /> YOUR LEARNING MILESTONES</span>
            <h1>Every milestone tells <span>a story.</span></h1>
            <p>
              Celebrate your progress, unlock new rewards and keep building
              the skills that move your developer journey forward.
            </p>
            <div className="achievements-hero-actions">
              <a href="#achievement-list" className="achievement-primary-btn">
                Explore achievements <ArrowUpRight size={16} />
              </a>
              <Link to="/courses" className="achievement-secondary-btn">
                Continue learning
              </Link>
            </div>
          </div>

          <div className="achievements-hero-art" aria-hidden="true">
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />
            <div className="hero-trophy-glow">
              <Trophy size={76} strokeWidth={1.2} />
            </div>
            <div className="hero-floating-badge badge-one"><Medal size={22} /></div>
            <div className="hero-floating-badge badge-two"><Star size={19} /></div>
            <div className="hero-floating-badge badge-three"><Zap size={20} /></div>
          </div>
        </section>

        <section className="achievement-stats-grid" aria-label="Achievement statistics">
          <div className="achievement-stat-card">
            <div className="achievement-stat-icon violet"><Award size={21} /></div>
            <div><span>Total achievements</span><strong>{loading ? '—' : stats.total}</strong><small>Available milestones</small></div>
          </div>
          <div className="achievement-stat-card">
            <div className="achievement-stat-icon green"><CheckCircle2 size={21} /></div>
            <div><span>Achievements earned</span><strong>{loading ? '—' : stats.earned}</strong><small>Milestones unlocked</small></div>
          </div>
          <div className="achievement-stat-card">
            <div className="achievement-stat-icon cyan"><Lock size={20} /></div>
            <div><span>Still to unlock</span><strong>{loading ? '—' : stats.locked}</strong><small>Your next challenges</small></div>
          </div>
          <div className="achievement-stat-card">
            <div className="achievement-stat-icon amber"><Sparkles size={21} /></div>
            <div><span>XP collected</span><strong>{loading ? '—' : stats.xp.toLocaleString()}</strong><small>From earned rewards</small></div>
          </div>
        </section>

        <section className="achievement-overview">
          <div className="achievement-overview-heading">
            <div>
              <span className="achievements-eyebrow">YOUR OVERVIEW</span>
              <h2>Achievement progress</h2>
              <p>Every completed milestone brings you one step closer.</p>
            </div>
            <div className="achievement-completion-number">{stats.percentage}% <span>completed</span></div>
          </div>
          <div className="achievement-overview-track">
            <span style={{ width: `${stats.percentage}%` }} />
          </div>
          <div className="achievement-overview-foot">
            <span>{stats.earned} of {stats.total} achievements earned</span>
            <span>{stats.locked} remaining</span>
          </div>
        </section>

        <section className="achievement-list-section" id="achievement-list">
          <div className="achievement-section-heading">
            <div>
              <span className="achievements-eyebrow">KEEP MOVING FORWARD</span>
              <h2>Your achievements</h2>
              <p>Discover milestones and track what you have accomplished.</p>
            </div>
            <button className="achievement-refresh-btn" onClick={loadAchievements} disabled={loading}>
              <RefreshCw size={15} className={loading ? 'is-spinning' : ''} />
              Refresh
            </button>
          </div>

          <div className="achievement-toolbar">
            <label className="achievement-search">
              <Search size={18} />
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search achievements..."
                aria-label="Search achievements"
              />
              {search && <button onClick={() => setSearch('')} aria-label="Clear search"><X size={15} /></button>}
            </label>

            <div className="achievement-status-filter">
              <Filter size={16} />
              <select value={status} onChange={event => setStatus(event.target.value)} aria-label="Filter by status">
                <option value="all">All status</option>
                <option value="earned">Earned</option>
                <option value="locked">Locked</option>
              </select>
            </div>
          </div>

          <div className="achievement-category-tabs" role="group" aria-label="Achievement categories">
            {CATEGORIES.map(item => (
              <button
                key={item}
                className={category === item ? 'active' : ''}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          {error && (
            <div className="achievement-error">
              <AlertCircle size={18} />
              <span>{error} Check that your backend exposes GET /achievements.</span>
              <button onClick={loadAchievements}>Try again</button>
            </div>
          )}

          {loading ? (
            <div className="achievement-grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <div className="achievement-skeleton" key={index}>
                  <div /><span /><span /><span />
                </div>
              ))}
            </div>
          ) : filtered.length ? (
            <div className="achievement-grid">
              {filtered.map(item => (
                <AchievementCard key={item._id} item={item} onDetails={setSelected} />
              ))}
            </div>
          ) : (
            <div className="achievement-empty">
              <div><Search size={28} /></div>
              <h3>No achievements found</h3>
              <p>Try another search or change your filters to discover more milestones.</p>
              <button onClick={() => { setSearch(''); setCategory('All'); setStatus('all'); }}>
                Clear filters
              </button>
            </div>
          )}
        </section>

        <section className="achievement-cta">
          <div className="achievement-cta-icon"><Target size={27} /></div>
          <div>
            <span className="achievements-eyebrow">YOUR NEXT MILESTONE</span>
            <h2>Build skills. Earn recognition.</h2>
            <p>Keep learning, practice consistently and turn your progress into achievements.</p>
          </div>
          <Link to="/courses" className="achievement-primary-btn">Explore courses <ArrowUpRight size={16} /></Link>
        </section>
      </div>

      <AchievementDetails item={selected} onClose={() => setSelected(null)} />
    </main>
  );
}
