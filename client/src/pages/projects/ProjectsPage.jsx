
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Search,
  SlidersHorizontal,
  Code2,
  Layers3,
  Clock3,
  Sparkles,
  Target,
  Rocket,
  FolderGit2,
  RefreshCw,
  X,
  ChevronDown,
  CircleDot,
  CheckCircle2,
  Command,
  Filter,
} from 'lucide-react';

import { api } from '../../services/api.js';

const PAGE_SIZE = 9;

const DIFFICULTIES = ['All levels', 'Beginner', 'Intermediate', 'Advanced'];

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured first' },
  { value: 'newest', label: 'Newest first' },
  { value: 'title', label: 'Title: A to Z' },
  { value: 'difficulty', label: 'Difficulty' },
];

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function text(value, fallback = '') {
  return typeof value === 'string' && value.trim()
    ? value.trim()
    : fallback;
}

function getTechnologies(project) {
  const value = project?.technology || project?.technologies || project?.techStack;

  if (Array.isArray(value)) {
    return value.filter(Boolean).map(String);
  }

  if (typeof value === 'string') {
    return value.split(/[,|]/).map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

function getDifficulty(project) {
  const value = text(project?.difficulty, 'Practice');
  const normalized = value.toLowerCase();

  if (normalized.includes('begin')) return 'Beginner';
  if (normalized.includes('inter')) return 'Intermediate';
  if (normalized.includes('adv')) return 'Advanced';

  return value;
}

function getProjectDate(project) {
  const date = new Date(project?.createdAt || project?.publishedAt || 0);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function getDuration(project) {
  const value = project?.duration || project?.estimatedTime || project?.timeRequired;

  if (typeof value === 'number' && value > 0) {
    return `${value} ${value === 1 ? 'hour' : 'hours'}`;
  }

  return text(value, '');
}

function getProjectHref(project) {
  const slug = project?.slug || project?._id || project?.id;
  return slug ? `/projects/${encodeURIComponent(String(slug))}` : '/projects';
}

function getInitials(value) {
  return String(value || 'TJ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function ProjectIcon({ project, className = '' }) {
  const technologies = getTechnologies(project);
  const first = technologies[0]?.toLowerCase() || '';

  let Icon = Code2;

  if (first.includes('react') || first.includes('vue') || first.includes('angular')) {
    Icon = Layers3;
  } else if (first.includes('node') || first.includes('express')) {
    Icon = Command;
  } else if (first.includes('mongo') || first.includes('sql')) {
    Icon = FolderGit2;
  }

  return (
    <div className={`tj-project-icon ${className}`}>
      <Icon size={23} strokeWidth={1.8} />
    </div>
  );
}

function ProjectSkeleton() {
  return (
    <div className="tj-project-skeleton" aria-hidden="true">
      <div className="tj-skeleton-line tj-skeleton-short" />
      <div className="tj-skeleton-icon" />
      <div className="tj-skeleton-line tj-skeleton-title" />
      <div className="tj-skeleton-line" />
      <div className="tj-skeleton-line tj-skeleton-medium" />
      <div className="tj-skeleton-tags">
        <span />
        <span />
        <span />
      </div>
      <div className="tj-skeleton-footer" />
    </div>
  );
}

function ProjectCard({ project, index }) {
  const technologies = getTechnologies(project);
  const difficulty = getDifficulty(project);
  const duration = getDuration(project);
  const description = text(
    project?.shortDescription || project?.description,
    'Explore this practical build and strengthen your development skills.'
  );

  const isFeatured = Boolean(project?.featured || project?.isFeatured);
  const requirements = asArray(project?.requirements);
  const steps = asArray(project?.steps);
  const href = getProjectHref(project);

  return (
    <article
      className="tj-project-card"
      style={{ '--card-index': index }}
    >
      <div className="tj-project-card-top">
        <span className={`tj-difficulty tj-difficulty-${difficulty.toLowerCase()}`}>
          <CircleDot size={12} />
          {difficulty}
        </span>

        {isFeatured && (
          <span className="tj-featured-label">
            <Sparkles size={12} />
            Featured
          </span>
        )}
      </div>

      <div className="tj-project-card-visual">
        <div className="tj-project-visual-grid" />
        <ProjectIcon project={project} />
        <span className="tj-project-visual-index">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="tj-project-visual-orbit tj-orbit-one" />
        <span className="tj-project-visual-orbit tj-orbit-two" />
      </div>

      <div className="tj-project-card-content">
        <div className="tj-project-card-heading">
          <h3>{text(project?.title, 'Untitled project')}</h3>
          <span className="tj-project-card-arrow" aria-hidden="true">
            <ArrowUpRight size={17} />
          </span>
        </div>

        <p className="tj-project-description">{description}</p>

        <div className="tj-project-meta">
          {duration && (
            <span>
              <Clock3 size={14} />
              {duration}
            </span>
          )}
          {requirements.length > 0 && (
            <span>
              <CheckCircle2 size={14} />
              {requirements.length} requirements
            </span>
          )}
          {steps.length > 0 && (
            <span>
              <Layers3 size={14} />
              {steps.length} build steps
            </span>
          )}
        </div>

        {technologies.length > 0 && (
          <div className="tj-tech-list">
            {technologies.slice(0, 4).map((technology) => (
              <span key={technology}>{technology}</span>
            ))}
            {technologies.length > 4 && (
              <span className="tj-tech-more">+{technologies.length - 4}</span>
            )}
          </div>
        )}

        <div className="tj-project-card-footer">
          <span className="tj-project-build-label">
            <span className="tj-status-dot" />
            Hands-on project
          </span>

          <Link
            className="tj-project-open"
            to={href}
            aria-label={`View ${text(project?.title, 'project')} details`}
          >
            Explore brief
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function EmptyProjects({ onReset, hasFilters }) {
  return (
    <div className="tj-project-empty">
      <div className="tj-empty-icon">
        <FolderGit2 size={30} />
      </div>
      <span className="tj-eyebrow">NOTHING MATCHED</span>
      <h3>{hasFilters ? 'No projects found' : 'Your project studio is getting ready'}</h3>
      <p>
        {hasFilters
          ? 'Try a different search term or remove some filters to discover more projects.'
          : 'Published projects will appear here when they are available.'}
      </p>
      {hasFilters && (
        <button className="tj-button tj-button-secondary" onClick={onReset}>
          <X size={16} />
          Clear filters
        </button>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All levels');
  const [technology, setTechnology] = useState('All technologies');
  const [sort, setSort] = useState('featured');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const loadProjects = useCallback(async (signal) => {
    setLoading(true);
    setError('');

    try {
      const response = await api('/projects', { signal });
      const records = Array.isArray(response?.projects)
        ? response.projects
        : Array.isArray(response?.data?.projects)
          ? response.data.projects
          : Array.isArray(response?.data)
            ? response.data
            : [];

      setProjects(records);
    } catch (err) {
      if (err?.name !== 'AbortError') {
        setError(err?.message || 'Unable to load projects right now.');
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadProjects(controller.signal);
    return () => controller.abort();
  }, [loadProjects]);

  const technologies = useMemo(() => {
    const all = projects.flatMap(getTechnologies);
    return [...new Set(all)].sort((a, b) => a.localeCompare(b));
  }, [projects]);

  const featuredProject = useMemo(() => {
    return projects.find((project) => project?.featured || project?.isFeatured) || projects[0] || null;
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = projects.filter((project) => {
      const title = text(project?.title).toLowerCase();
      const description = text(
        project?.shortDescription || project?.description
      ).toLowerCase();
      const tech = getTechnologies(project);
      const level = getDifficulty(project);

      const matchesSearch =
        !query ||
        title.includes(query) ||
        description.includes(query) ||
        tech.some((item) => item.toLowerCase().includes(query));

      const matchesDifficulty =
        difficulty === 'All levels' || level === difficulty;

      const matchesTechnology =
        technology === 'All technologies' || tech.includes(technology);

      return matchesSearch && matchesDifficulty && matchesTechnology;
    });

    switch (sort) {
      case 'newest':
        result.sort((a, b) => getProjectDate(b) - getProjectDate(a));
        break;
      case 'title':
        result.sort((a, b) =>
          text(a?.title).localeCompare(text(b?.title))
        );
        break;
      case 'difficulty': {
        const rank = { Beginner: 1, Intermediate: 2, Advanced: 3 };
        result.sort(
          (a, b) =>
            (rank[getDifficulty(a)] || 4) -
            (rank[getDifficulty(b)] || 4)
        );
        break;
      }
      default:
        result.sort(
          (a, b) =>
            Number(Boolean(b?.featured || b?.isFeatured)) -
            Number(Boolean(a?.featured || a?.isFeatured))
        );
    }

    return result;
  }, [projects, search, difficulty, technology, sort]);

  const visibleProjects = filteredProjects.slice(0, visibleCount);
  const hasFilters =
    Boolean(search.trim()) ||
    difficulty !== 'All levels' ||
    technology !== 'All technologies';

  const clearFilters = () => {
    setSearch('');
    setDifficulty('All levels');
    setTechnology('All technologies');
    setSort('featured');
    setVisibleCount(PAGE_SIZE);
  };

  const handleSearch = (value) => {
    setSearch(value);
    setVisibleCount(PAGE_SIZE);
  };

  const totalTechnologies = technologies.length;
  const beginnerProjects = projects.filter(
    (project) => getDifficulty(project) === 'Beginner'
  ).length;

  return (
    <main className="tj-projects-page">
      <section className="tj-project-hero">
        <div className="tj-project-hero-noise" />
        <div className="tj-project-hero-inner">
          <div className="tj-project-hero-copy">
            <div className="tj-project-kicker">
              <span className="tj-kicker-pulse" />
              TYAGIJI DEVELOPER STUDIO
            </div>

            <h1>
              Ideas become
              <br />
              <span>real projects.</span>
            </h1>

            <p>
              Move beyond tutorials. Build practical applications, solve
              real-world problems, and create a portfolio that shows what
              you can do.
            </p>

            <div className="tj-project-hero-actions">
              <a href="#project-catalogue" className="tj-button tj-button-primary">
                Explore projects
                <ArrowRight size={17} />
              </a>
              <div className="tj-project-proof">
                <span className="tj-proof-icon">
                  <Target size={16} />
                </span>
                <span>
                  <strong>Learn by building</strong>
                  <small>Practice with purpose</small>
                </span>
              </div>
            </div>

            <div className="tj-project-hero-stats">
              <div>
                <strong>{loading ? '—' : projects.length}</strong>
                <span>Published projects</span>
              </div>
              <div>
                <strong>{loading ? '—' : totalTechnologies}</strong>
                <span>Technologies</span>
              </div>
              <div>
                <strong>{loading ? '—' : beginnerProjects}</strong>
                <span>Beginner friendly</span>
              </div>
            </div>
          </div>

          <div className="tj-project-hero-art" aria-hidden="true">
            <div className="tj-art-glow" />
            <div className="tj-art-ring tj-ring-a" />
            <div className="tj-art-ring tj-ring-b" />
            <div className="tj-art-ring tj-ring-c" />

            <div className="tj-art-window">
              <div className="tj-art-window-top">
                <div className="tj-window-dots">
                  <i /><i /><i />
                </div>
                <span>project.config</span>
                <span className="tj-window-live">● LIVE</span>
              </div>
              <div className="tj-art-code">
                <div><span>01</span><b>const</b> idea = <em>'your idea'</em>;</div>
                <div><span>02</span><b>const</b> plan = build(idea);</div>
                <div><span>03</span><b>while</b> (learning) {'{'}</div>
                <div><span>04</span> &nbsp; practice(plan);</div>
                <div><span>05</span> &nbsp; ship(project);</div>
                <div><span>06</span>{'}'}</div>
                <div><span>07</span><i>// progress starts here</i></div>
              </div>
              <div className="tj-art-window-bottom">
                <span><CheckCircle2 size={13} /> Build ready</span>
                <span>main · 0 errors</span>
              </div>
            </div>

            <div className="tj-art-float tj-art-float-top">
              <span className="tj-float-icon"><Rocket size={17} /></span>
              <span><strong>Build something</strong><small>Worth showing</small></span>
            </div>
            <div className="tj-art-float tj-art-float-bottom">
              <span className="tj-float-check"><CheckCircle2 size={18} /></span>
              <span><strong>Skills in action</strong><small>Learn · Build · Improve</small></span>
            </div>
          </div>
        </div>
      </section>

      <section className="tj-project-content" id="project-catalogue">
        <div className="tj-project-section-heading">
          <div>
            <span className="tj-eyebrow">THE PROJECT LIBRARY</span>
            <h2>Find your next <span>build.</span></h2>
            <p>Choose a challenge, explore the brief, and turn your learning into something tangible.</p>
          </div>
          <div className="tj-library-count">
            <FolderGit2 size={17} />
            <span>{loading ? 'Loading library' : `${filteredProjects.length} projects found`}</span>
          </div>
        </div>

        <div className="tj-project-toolbar">
          <label className="tj-project-search">
            <Search size={18} />
            <input
              type="search"
              value={search}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder="Search projects, skills, technologies..."
              aria-label="Search projects"
            />
            {search && (
              <button type="button" onClick={() => handleSearch('')} aria-label="Clear search">
                <X size={16} />
              </button>
            )}
            <kbd>/</kbd>
          </label>

          <div className="tj-toolbar-actions">
            <button
              className={`tj-filter-toggle ${filtersOpen ? 'is-active' : ''}`}
              type="button"
              onClick={() => setFiltersOpen((value) => !value)}
              aria-expanded={filtersOpen}
            >
              <SlidersHorizontal size={16} />
              Filters
              <ChevronDown size={15} />
            </button>

            <label className="tj-sort-control">
              <span>Sort by</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                aria-label="Sort projects"
              >
                {SORT_OPTIONS.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {filtersOpen && (
          <div className="tj-filter-panel">
            <label>
              <span>Difficulty</span>
              <select
                value={difficulty}
                onChange={(event) => {
                  setDifficulty(event.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
              >
                {DIFFICULTIES.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>

            <label>
              <span>Technology</span>
              <select
                value={technology}
                onChange={(event) => {
                  setTechnology(event.target.value);
                  setVisibleCount(PAGE_SIZE);
                }}
              >
                <option>All technologies</option>
                {technologies.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>

            <button className="tj-clear-filter" type="button" onClick={clearFilters}>
              <RefreshCw size={14} />
              Reset all
            </button>
          </div>
        )}

        <div className="tj-project-quick-filters">
          <span>QUICK FILTER</span>
          {DIFFICULTIES.map((item) => (
            <button
              key={item}
              type="button"
              className={difficulty === item ? 'is-selected' : ''}
              onClick={() => {
                setDifficulty(item);
                setVisibleCount(PAGE_SIZE);
              }}
            >
              {item}
            </button>
          ))}
          {hasFilters && (
            <button className="tj-reset-inline" type="button" onClick={clearFilters}>
              Clear filters <X size={13} />
            </button>
          )}
        </div>

        {error && (
          <div className="tj-project-error" role="alert">
            <div>
              <strong>We couldn't load the project library.</strong>
              <p>{error}</p>
            </div>
            <button
              type="button"
              className="tj-button tj-button-secondary"
              onClick={() => {
                const controller = new AbortController();
                loadProjects(controller.signal);
              }}
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        )}

        {!error && !loading && featuredProject && !hasFilters && (
          <section className="tj-featured-project">
            <div className="tj-featured-copy">
              <span className="tj-featured-eyebrow">
                <Sparkles size={14} />
                EDITOR'S PICK
              </span>
              <h3>{text(featuredProject.title, 'Featured project')}</h3>
              <p>
                {text(
                  featuredProject.shortDescription || featuredProject.description,
                  'A practical project selected from the project library.'
                )}
              </p>
              <div className="tj-featured-tags">
                <span>{getDifficulty(featuredProject)}</span>
                {getDuration(featuredProject) && <span>{getDuration(featuredProject)}</span>}
                {getTechnologies(featuredProject).slice(0, 3).map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
              <Link className="tj-featured-link" to={getProjectHref(featuredProject)}>
                Explore featured project
                <ArrowUpRight size={17} />
              </Link>
            </div>
            <div className="tj-featured-art" aria-hidden="true">
              <div className="tj-featured-backdrop" />
              <div className="tj-featured-code-card">
                <div className="tj-featured-code-head"><i /><i /><i /><span>build-your-next-idea</span></div>
                <div className="tj-featured-code-body">
                  <span>01</span> <b>import</b> {'{'} creativity {'}'}<br />
                  <span>02</span> <b>from</b> <em>'practice'</em><br />
                  <span>03</span><br />
                  <span>04</span> <b>export default</b> success;<br />
                  <span>05</span> <i>// keep building</i>
                </div>
              </div>
              <div className="tj-featured-stamp"><Rocket size={24} /><span>MAKE IT<br />REAL</span></div>
            </div>
          </section>
        )}

        <div className="tj-project-results-heading">
          <div>
            <span className="tj-eyebrow">EXPLORE & BUILD</span>
            <h3>{hasFilters ? 'Matching projects' : 'All projects'}</h3>
          </div>
          {!loading && (
            <span className="tj-results-number">
              Showing {visibleProjects.length} of {filteredProjects.length}
            </span>
          )}
        </div>

        {loading ? (
          <div className="tj-project-grid">
            {Array.from({ length: 6 }).map((_, index) => (
              <ProjectSkeleton key={index} />
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <>
            <div className="tj-project-grid">
              {visibleProjects.map((project, index) => (
                <ProjectCard
                  key={project?._id || project?.id || project?.slug || index}
                  project={project}
                  index={index}
                />
              ))}
            </div>

            {visibleCount < filteredProjects.length && (
              <div className="tj-load-more-wrap">
                <button
                  className="tj-button tj-button-secondary tj-load-more"
                  type="button"
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                >
                  Load more projects
                  <ArrowDownIcon />
                </button>
              </div>
            )}
          </>
        ) : (
          <EmptyProjects onReset={clearFilters} hasFilters={hasFilters} />
        )}
      </section>

      <section className="tj-project-bottom-cta">
        <div className="tj-cta-orb" />
        <div className="tj-cta-icon"><Rocket size={23} /></div>
        <div className="tj-cta-copy">
          <span className="tj-eyebrow">YOUR NEXT STEP STARTS HERE</span>
          <h2>Learn a concept. <span>Build a solution.</span></h2>
          <p>Pair your project work with structured courses and keep growing your developer skill set.</p>
        </div>
        <Link to="/courses" className="tj-button tj-button-primary">
          Explore courses
          <ArrowRight size={17} />
        </Link>
      </section>
    </main>
  );
}

function ArrowDownIcon() {
  return <ArrowRight size={16} className="tj-arrow-down" />;
}
