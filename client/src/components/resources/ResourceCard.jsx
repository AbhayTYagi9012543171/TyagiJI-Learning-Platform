import { ExternalLink } from 'lucide-react';
import Badge from '../ui/Badge.jsx';
export default function ResourceCard({ resource }) {
  if (!resource?.url) return null;
  return (
    <a className="resource-card tj-resource-card" href={resource.url} target="_blank" rel="noopener noreferrer">
      <Badge tone="info">{resource.category || 'Reference'}</Badge>
      <h3>{resource.title || 'Learning resource'} <ExternalLink size={15}/></h3>
      {resource.description && <p>{resource.description}</p>}
      {Array.isArray(resource.technology) && <small>{resource.technology.join(' · ')}</small>}
    </a>
  );
}

