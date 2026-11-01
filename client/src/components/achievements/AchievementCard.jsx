import { Award, LockKeyhole } from 'lucide-react';
import Badge from '../ui/Badge.jsx';
export default function AchievementCard({ achievement, unlocked = false }) {
  return (
    <article className={`achievement-card tj-achievement-card ${unlocked ? 'is-unlocked' : 'is-locked'}`}>
      <span className="tj-achievement-card__icon">{unlocked ? <Award size={24}/> : <LockKeyhole size={22}/>}</span>
      <Badge tone={unlocked ? 'success' : 'neutral'}>{unlocked ? 'Unlocked' : 'Locked'}</Badge>
      <h3>{achievement?.title || 'Achievement'}</h3>
      {achievement?.description && <p>{achievement.description}</p>}
    </article>
  );
}

