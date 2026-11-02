import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, BookOpen, Bookmark, BriefcaseBusiness,
  Check, CheckCircle2, ChevronRight, Clock3, Code2, ExternalLink,
  FileCode2, Github, GraduationCap, Layers3, LoaderCircle, Play,
  Rocket, ShieldCheck, Sparkles, Target, Terminal, Users, Zap,
} from 'lucide-react';

import { api } from '../../services/api.js';
import ProjectChecklist from '../../components/projects/ProjectChecklist.jsx';
import ProjectSubmissionPanel from '../../components/projects/ProjectSubmissionPanel.jsx';
import '../../styles/pages/projects-premium.css';
import '../../styles/pages/project-details-premium.css';

const FALLBACK_PROJECT = {
  title: 'Project details',
  description: 'Explore the project and learn how to build it.',
  overview: '',
  technology: 'JavaScript',
  difficulty: 'Beginner',
  duration: 'Self paced',
  objectives: [],
  features: [],
  requirements: [],
  tags: [],
};

function getProjectFromResponse(response) {
  if (!response) return null;

  const candidates = [
    response.project,
    response.data?.project,
    response.data,
    response,
  ];

  return candidates.find(
    (item) =>
      item &&
      typeof item === 'object' &&
      !Array.isArray(item) &&
      (item.title || item.name || item.slug || item._id || item.id)
  ) || null;
}

function getText(value, fallback = '') {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return fallback;
}

function getList(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === 'string') return item;

      if (item && typeof item === 'object') {
        return (
          item.title ||
          item.name ||
          item.text ||
          item.description ||
          ''
        );
      }

      return '';
    })
    .filter(Boolean);
}

function getDifficultyClass(difficulty = '') {
  const value = difficulty.toLowerCase();

  if (value.includes('advanced')) return 'advanced';
  if (value.includes('intermediate')) return 'intermediate';

  return 'beginner';
}

function ProjectDetailsPage() {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const projectIdentifier = slug || id;

  const [project, setProject] = useState(null);
  const [relatedProjects, setRelatedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [saved, setSaved] = useState(() => {
    try {
      const savedIds = JSON.parse(
        localStorage.getItem('tyagiji-saved-projects') || '[]'
      );

      return (
        Array.isArray(savedIds) &&
        savedIds.includes(String(projectIdentifier))
      );
    } catch {
      return false;
    }
  });

  const [activeSection, setActiveSection] = useState('overview');
  const [completedSteps, setCompletedSteps] = useState([]);

  const loadProject = useCallback(async (signal) => {
    if (!projectIdentifier) {
      setError('Project identifier is missing.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api(
        `/projects/${encodeURIComponent(projectIdentifier)}`,
        { signal }
      );

      if (signal.aborted) return;

      const result = getProjectFromResponse(response);

      if (!result) {
        throw new Error('Project information could not be found.');
      }

      setProject(result);

      const related = Array.isArray(response?.relatedProjects)
        ? response.relatedProjects
        : Array.isArray(response?.data?.relatedProjects)
          ? response.data.relatedProjects
          : [];

      setRelatedProjects(related);
    } catch (err) {
      if (signal.aborted) return;

      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Unable to load this project. Please try again.'
      );
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [projectIdentifier]);

  useEffect(() => {
    const controller = new AbortController();

    loadProject(controller.signal);

    return () => controller.abort();
  }, [loadProject]);

  useEffect(() => {
    try {
      const savedIds = JSON.parse(
        localStorage.getItem('tyagiji-saved-projects') || '[]'
      );

      setSaved(
        Array.isArray(savedIds) &&
        savedIds.includes(String(projectIdentifier))
      );
    } catch {
      setSaved(false);
    }

    setCompletedSteps([]);
  }, [projectIdentifier]);

  const details = useMemo(() => {
    const item = project || FALLBACK_PROJECT;
    const technologyValue = item.technology || item.technologies;

    return {
      title: getText(item.title || item.name, 'Untitled project'),
      description: getText(
        item.shortDescription || item.description
      ),
      overview: getText(
        item.overview ||
        item.longDescription ||
        item.description
      ),
      technology: Array.isArray(technologyValue)
        ? technologyValue.filter(Boolean).join(' · ')
        : getText(
            technologyValue || item.category,
            'Web Development'
          ),
      difficulty: getText(item.difficulty, 'Beginner'),
      duration: getText(
        item.duration ||
        item.estimatedDuration ||
        (
          item.estimatedHours
            ? `${item.estimatedHours} hours`
            : ''
        ),
        'Self paced'
      ),
      objectives: getList(
        item.objectives || item.learningObjectives
      ),
      features: getList(item.features),
      steps: getList(item.steps),
      acceptanceCriteria: getList(item.acceptanceCriteria),
      starterFiles: Array.isArray(item.starterFiles)
        ? item.starterFiles
        : [],
      extensions: getList(item.extensionTasks),
      requirements: getList(
        item.requirements || item.prerequisites
      ),
      tags: getList(
        item.tags || item.technologies || item.technology
      ),
      image:
        item.thumbnail ||
        item.thumbnailUrl ||
        item.image ||
        item.coverImage ||
        '',
      githubUrl: item.githubUrl || item.repositoryUrl || '',
      liveUrl: item.liveUrl || item.demoUrl || '',
      courseUrl: item.courseUrl || '',
      status: item.status || 'Available',
      author:
        item.author?.name ||
        item.createdBy?.name ||
        item.instructor?.name ||
        '',
    };
  }, [project]);

  const sections = [
    { id: 'overview', label: 'Overview' },
    { id: 'features', label: 'Features' },
    { id: 'objectives', label: 'Learning outcomes' },
    { id: 'requirements', label: 'Requirements' },
    ...(details.steps.length
      ? [{ id: 'steps', label: 'Build steps' }]
      : []),
    ...(details.acceptanceCriteria.length
      ? [{ id: 'acceptance', label: 'Acceptance criteria' }]
      : []),
    ...(details.extensions.length
      ? [{ id: 'extensions', label: 'Next challenges' }]
      : []),
    { id: 'submit', label: 'Submit project' },
  ];

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);

    document
      .getElementById(`project-${sectionId}`)
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
  };

  const handleBookmark = () => {
    setSaved((current) => {
      const next = !current;

      try {
        const stored = JSON.parse(
          localStorage.getItem('tyagiji-saved-projects') || '[]'
        );

        const ids = Array.isArray(stored)
          ? stored.map(String)
          : [];

        const updated = next
          ? [...new Set([...ids, String(projectIdentifier)])]
          : ids.filter(
              (item) => item !== String(projectIdentifier)
            );

        localStorage.setItem(
          'tyagiji-saved-projects',
          JSON.stringify(updated)
        );
      } catch {
        // Storage may be unavailable in private browsing.
      }

      return next;
    });
  };

  const toggleBuildStep = (index) => {
    setCompletedSteps((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index]
    );
  };

  if (loading) {
    return (
      <main className="tj-project-details">
        <div className="tj-project-container">
          <div className="tj-project-skeleton tj-project-skeleton-back" />
          <div className="tj-project-skeleton tj-project-skeleton-title" />
          <div className="tj-project-skeleton tj-project-skeleton-description" />
          <div className="tj-project-skeleton tj-project-skeleton-hero" />
          <div className="tj-project-skeleton tj-project-skeleton-content" />
        </div>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="tj-project-details">
        <div className="tj-project-container">
          <div className="tj-project-error">
            <div className="tj-project-error-icon">
              <FileCode2 size={30} />
            </div>

            <h1>Project unavailable</h1>
            <p>{error || 'This project could not be found.'}</p>

            <div className="tj-project-error-actions">
              <button
                type="button"
                className="tj-project-button tj-project-button-primary"
                onClick={() => {
                  const controller = new AbortController();
                  loadProject(controller.signal);
                }}
              >
                <LoaderCircle size={17} />
                Retry
              </button>

              <button
                type="button"
                className="tj-project-button tj-project-button-secondary"
                onClick={() => navigate('/projects')}
              >
                <ArrowLeft size={17} />
                All projects
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="tj-project-details">
      <div className="tj-project-container">
        <nav
          className="tj-project-breadcrumb"
          aria-label="Breadcrumb"
        >
          <Link to="/">Home</Link>
          <ChevronRight size={15} />
          <Link to="/projects">Projects</Link>
          <ChevronRight size={15} />
          <span>{details.title}</span>
        </nav>

        <header className="tj-project-heading">
          <div className="tj-project-heading-main">
            <div className="tj-project-eyebrow">
              <span className="tj-project-eyebrow-dot" />
              <span>Developer project</span>
              <span className="tj-project-eyebrow-divider">/</span>
              <span>{details.technology}</span>
            </div>

            <h1>{details.title}</h1>

            <p className="tj-project-subtitle">
              {details.description ||
                'Explore this hands-on project and build practical development skills.'}
            </p>

            <div className="tj-project-meta">
              <span
                className={`tj-project-difficulty ${getDifficultyClass(
                  details.difficulty
                )}`}
              >
                <Zap size={14} />
                {details.difficulty}
              </span>

              <span>
                <Clock3 size={15} />
                {details.duration}
              </span>

              <span>
                <Code2 size={15} />
                {details.technology}
              </span>

              {details.author && (
                <span>
                  <Users size={15} />
                  {details.author}
                </span>
              )}
            </div>

            <div className="tj-project-heading-actions">
              <a
                href="#project-overview"
                className="tj-project-button tj-project-button-primary"
              >
                Explore project
                <ArrowRight size={17} />
              </a>

              <button
                type="button"
                className={`tj-project-button tj-project-button-secondary ${
                  saved ? 'is-saved' : ''
                }`}
                onClick={handleBookmark}
                aria-pressed={saved}
              >
                {saved ? <Check size={17} /> : <Bookmark size={17} />}
                {saved ? 'Saved' : 'Save project'}
              </button>
            </div>
          </div>

          <div className="tj-project-heading-visual">
            {details.image ? (
              <img
                src={details.image}
                alt={`${details.title} preview`}
                className="tj-project-cover-image"
              />
            ) : (
              <div className="tj-project-code-visual">
                <div className="tj-project-code-topbar">
                  <div className="tj-project-window-dots">
                    <span />
                    <span />
                    <span />
                  </div>

                  <span>project.js</span>
                  <Code2 size={15} />
                </div>

                <div className="tj-project-code-body">
                  <div className="tj-project-code-line">
                    <span>01</span>
                    <code><i>const</i> project = {'{'}</code>
                  </div>

                  <div className="tj-project-code-line indent">
                    <span>02</span>
                    <code>
                      name: <b>'{details.title.slice(0, 23)}'</b>,
                    </code>
                  </div>

                  <div className="tj-project-code-line indent">
                    <span>03</span>
                    <code>
                      technology: <b>'{details.technology}'</b>,
                    </code>
                  </div>

                  <div className="tj-project-code-line indent">
                    <span>04</span>
                    <code>
                      level: <b>'{details.difficulty}'</b>
                    </code>
                  </div>

                  <div className="tj-project-code-line">
                    <span>05</span>
                    <code>{'}'};</code>
                  </div>

                  <div className="tj-project-code-line code-highlight">
                    <span>06</span>
                    <code><i>await</i> build(project);</code>
                  </div>
                </div>

                <div className="tj-project-code-footer">
                  <span>
                    <span className="tj-project-status-dot" />
                    Ready to build
                  </span>
                  <span>TyagiJI Lab</span>
                </div>
              </div>
            )}

            <div className="tj-project-visual-badge">
              <Sparkles size={15} />
              Hands-on learning
            </div>
          </div>
        </header>

        <div className="tj-project-layout">
          <aside className="tj-project-sidebar">
            <div className="tj-project-sidebar-card">
              <div className="tj-project-sidebar-title">
                <Layers3 size={17} />
                On this page
              </div>

              <nav className="tj-project-section-nav">
                {sections.map((section) => (
                  <button
                    type="button"
                    key={section.id}
                    className={
                      activeSection === section.id ? 'active' : ''
                    }
                    onClick={() => scrollToSection(section.id)}
                  >
                    <span />
                    {section.label}
                  </button>
                ))}
              </nav>

              <div className="tj-project-sidebar-divider" />

              <div className="tj-project-sidebar-title">
                <Target size={17} />
                Project information
              </div>

              <div className="tj-project-info-list">
                <div>
                  <span>Difficulty</span>
                  <strong>{details.difficulty}</strong>
                </div>

                <div>
                  <span>Duration</span>
                  <strong>{details.duration}</strong>
                </div>

                <div>
                  <span>Technology</span>
                  <strong>{details.technology}</strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong className="tj-project-available">
                    <span />
                    {details.status}
                  </strong>
                </div>
              </div>

              <Link
                to={details.courseUrl || '/courses'}
                className="tj-project-sidebar-cta"
              >
                <GraduationCap size={17} />
                {details.courseUrl
                  ? 'Related course'
                  : 'Explore courses'}
                <ArrowRight size={15} />
              </Link>
            </div>
          </aside>

          <article className="tj-project-content">
            <section
              id="project-overview"
              className="tj-project-section"
            >
              <div className="tj-project-section-heading">
                <span className="tj-project-section-icon">
                  <BriefcaseBusiness size={19} />
                </span>

                <div>
                  <span className="tj-project-section-kicker">
                    01 / INTRODUCTION
                  </span>
                  <h2>Project overview</h2>
                </div>
              </div>

              <div className="tj-project-prose">
                <p>
                  {details.overview ||
                    'This project is designed to help you apply development concepts through practical implementation. Explore the requirements, identify the core features, and build your solution step by step.'}
                </p>
              </div>

              {details.tags.length > 0 && (
                <div className="tj-project-tags">
                  {details.tags.map((tag, index) => (
                    <span key={`${tag}-${index}`}>{tag}</span>
                  ))}
                </div>
              )}
            </section>

            <section
              id="project-features"
              className="tj-project-section"
            >
              <div className="tj-project-section-heading">
                <span className="tj-project-section-icon">
                  <Rocket size={19} />
                </span>

                <div>
                  <span className="tj-project-section-kicker">
                    02 / WHAT YOU WILL BUILD
                  </span>
                  <h2>Core features</h2>
                </div>
              </div>

              {details.features.length > 0 ? (
                <div className="tj-project-feature-grid">
                  {details.features.map((feature, index) => (
                    <div
                      className="tj-project-feature"
                      key={`${feature}-${index}`}
                    >
                      <span className="tj-project-feature-check">
                        <CheckCircle2 size={17} />
                      </span>
                      <p>{feature}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="tj-project-empty-note">
                  <Layers3 size={20} />
                  <p>
                    Feature information will be available when
                    provided by the project.
                  </p>
                </div>
              )}
            </section>

            <section
              id="project-objectives"
              className="tj-project-section"
            >
              <div className="tj-project-section-heading">
                <span className="tj-project-section-icon">
                  <GraduationCap size={19} />
                </span>

                <div>
                  <span className="tj-project-section-kicker">
                    03 / YOUR PROGRESS
                  </span>
                  <h2>What you will learn</h2>
                </div>
              </div>

              {details.objectives.length > 0 ? (
                <div className="tj-project-objective-list">
                  {details.objectives.map((objective, index) => (
                    <div key={`${objective}-${index}`}>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <p>{objective}</p>
                      <CheckCircle2 size={17} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="tj-project-empty-note">
                  <Target size={20} />
                  <p>Learning objectives have not been added yet.</p>
                </div>
              )}
            </section>

            <section
              id="project-requirements"
              className="tj-project-section"
            >
              <div className="tj-project-section-heading">
                <span className="tj-project-section-icon">
                  <ShieldCheck size={19} />
                </span>

                <div>
                  <span className="tj-project-section-kicker">
                    04 / BEFORE YOU START
                  </span>
                  <h2>Requirements</h2>
                </div>
              </div>

              {details.requirements.length > 0 ? (
                <div className="tj-project-requirement-list">
                  {details.requirements.map((requirement, index) => (
                    <div key={`${requirement}-${index}`}>
                      <CheckCircle2 size={17} />
                      <p>{requirement}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="tj-project-empty-note">
                  <CheckCircle2 size={20} />
                  <p>
                    No specific prerequisites have been listed
                    for this project.
                  </p>
                </div>
              )}
            </section>

            {details.steps.length > 0 && (
              <section
                id="project-steps"
                className="tj-project-section"
              >
                <div className="tj-project-section-heading">
                  <span className="tj-project-section-icon">
                    <Layers3 size={19} />
                  </span>

                  <div>
                    <span className="tj-project-section-kicker">
                      05 / BUILD PLAN
                    </span>
                    <h2>Build it step by step</h2>
                    <p>
                      Use this checklist to keep track of your
                      implementation during this visit.
                    </p>
                  </div>
                </div>

                <div className="tj-project-step-progress">
                  <span>
                    {completedSteps.length} of {details.steps.length} steps checked
                  </span>

                  <div>
                    <i
                      style={{
                        width: `${
                          details.steps.length
                            ? (completedSteps.length /
                                details.steps.length) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <ProjectChecklist
                  items={details.steps}
                  completed={completedSteps}
                  onToggle={toggleBuildStep}
                />
              </section>
            )}

            {details.acceptanceCriteria.length > 0 && (
              <section
                id="project-acceptance"
                className="tj-project-section"
              >
                <div className="tj-project-section-heading">
                  <span className="tj-project-section-icon">
                    <ShieldCheck size={19} />
                  </span>

                  <div>
                    <span className="tj-project-section-kicker">
                      06 / DEFINITION OF DONE
                    </span>
                    <h2>Acceptance criteria</h2>
                  </div>
                </div>

                <div className="tj-project-requirement-list">
                  {details.acceptanceCriteria.map(
                    (criterion, index) => (
                      <div key={`${criterion}-${index}`}>
                        <CheckCircle2 size={17} />
                        <p>{criterion}</p>
                      </div>
                    )
                  )}
                </div>
              </section>
            )}

            {details.starterFiles.length > 0 && (
              <section className="tj-project-section tj-project-starter-files">
                <div className="tj-project-section-heading">
                  <span className="tj-project-section-icon">
                    <FileCode2 size={19} />
                  </span>

                  <div>
                    <span className="tj-project-section-kicker">
                      STARTER MATERIAL
                    </span>
                    <h2>Starter files</h2>
                    <p>
                      Reference snippets supplied with this project.
                    </p>
                  </div>
                </div>

                {details.starterFiles.map((file, index) => (
                  <details
                    className="tj-project-starter-file"
                    key={`${file.name || 'file'}-${index}`}
                  >
                    <summary>
                      <FileCode2 size={16} />
                      {file.name || `Starter file ${index + 1}`}
                      <span>View code</span>
                    </summary>

                    <pre>
                      <code>
                        {file.content || 'No starter content supplied.'}
                      </code>
                    </pre>
                  </details>
                ))}
              </section>
            )}

            {details.extensions.length > 0 && (
              <section
                id="project-extensions"
                className="tj-project-section"
              >
                <div className="tj-project-section-heading">
                  <span className="tj-project-section-icon">
                    <Rocket size={19} />
                  </span>

                  <div>
                    <span className="tj-project-section-kicker">
                      LEVEL UP
                    </span>
                    <h2>Take it further</h2>
                    <p>
                      Optional extensions to stretch your
                      implementation after the core build.
                    </p>
                  </div>
                </div>

                <div className="tj-project-requirement-list">
                  {details.extensions.map((task, index) => (
                    <div key={`${task}-${index}`}>
                      <Sparkles size={17} />
                      <p>{task}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div id="project-submit">
              <ProjectSubmissionPanel project={project} />
            </div>

            <section className="tj-project-build-cta">
              <div className="tj-project-build-icon">
                <Terminal size={25} />
              </div>

              <div>
                <span>YOUR NEXT STEP</span>
                <h2>
                  Ready to turn knowledge into experience?
                </h2>
                <p>
                  Start exploring the learning resources and build
                  your development skills through practice.
                </p>
              </div>

              <Link
                to="/courses"
                className="tj-project-button tj-project-button-primary"
              >
                Start learning
                <ArrowRight size={17} />
              </Link>
            </section>

            {(details.githubUrl || details.liveUrl) && (
              <section className="tj-project-external-links">
                <h3>Project links</h3>

                <div>
                  {details.githubUrl && (
                    <a
                      href={details.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github size={17} />
                      Source repository
                      <ExternalLink size={14} />
                    </a>
                  )}

                  {details.liveUrl && (
                    <a
                      href={details.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Play size={17} />
                      Live demo
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </section>
            )}
          </article>
        </div>

        {relatedProjects.length > 0 && (
          <section className="tj-related-projects">
            <div className="tj-related-heading">
              <div>
                <span>KEEP BUILDING</span>
                <h2>Explore related projects</h2>
              </div>

              <Link to="/projects">
                View all projects
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="tj-related-grid">
              {relatedProjects.slice(0, 3).map((item) => (
                <Link
                  key={item._id || item.id || item.slug}
                  to={`/projects/${item.slug || item._id || item.id}`}
                  className="tj-related-card"
                >
                  <div className="tj-related-card-icon">
                    <Code2 size={20} />
                  </div>

                  <h3>{item.title || item.name}</h3>

                  <p>
                    {item.shortDescription ||
                      item.description ||
                      'Explore this practical development project.'}
                  </p>

                  <span>
                    Explore project
                    <ArrowRight size={15} />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="tj-project-bottom-nav">
          <Link to="/projects">
            <ArrowLeft size={16} />
            Back to all projects
          </Link>

          <Link to="/courses">
            Explore learning paths
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </main>
  );
}

export default ProjectDetailsPage;