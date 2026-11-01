
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronRight,
  Code2,
  Compass,
  GraduationCap,
  Layers3,
  Lightbulb,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Terminal,
  Trophy,
  Users,
  Workflow,
  Zap,
} from 'lucide-react';

const learningPillars = [
  {
    number: '01',
    icon: BookOpen,
    title: 'Learn with clarity',
    description:
      'Understand programming concepts through structured lessons, organized learning paths and practical explanations.',
    tags: ['Structured courses', 'Clear concepts'],
  },
  {
    number: '02',
    icon: Code2,
    title: 'Practice with purpose',
    description:
      'Strengthen your understanding through coding exercises, technical references and knowledge checks.',
    tags: ['Hands-on practice', 'Skill development'],
  },
  {
    number: '03',
    icon: Rocket,
    title: 'Build real projects',
    description:
      'Apply your knowledge to practical development projects and turn your ideas into working applications.',
    tags: ['Real-world projects', 'Portfolio building'],
  },
];

const platformFeatures = [
  {
    icon: GraduationCap,
    number: '01',
    title: 'Structured learning',
    description:
      'Explore organized courses and follow a progressive learning journey.',
    link: '/courses',
    linkText: 'Explore courses',
  },
  {
    icon: Terminal,
    number: '02',
    title: 'Developer resources',
    description:
      'Find useful programming references, cheat sheets and technical guides.',
    link: '/resources',
    linkText: 'Explore resources',
  },
  {
    icon: Workflow,
    number: '03',
    title: 'Practical projects',
    description:
      'Develop your implementation skills through practical project challenges.',
    link: '/projects',
    linkText: 'Explore projects',
  },
  {
    icon: Trophy,
    number: '04',
    title: 'Learning achievements',
    description:
      'Track your learning milestones and recognize your progress.',
    link: '/achievements',
    linkText: 'View achievements',
  },
];

const roadmap = [
  {
    number: '01',
    title: 'Programming fundamentals',
    description: 'Logic, problem solving and programming basics.',
    icon: Lightbulb,
  },
  {
    number: '02',
    title: 'Frontend development',
    description: 'HTML, CSS, JavaScript and responsive interfaces.',
    icon: Layers3,
  },
  {
    number: '03',
    title: 'Modern frameworks',
    description: 'React, reusable components and application architecture.',
    icon: Code2,
  },
  {
    number: '04',
    title: 'Backend development',
    description: 'Node.js, Express, APIs and databases.',
    icon: Terminal,
  },
  {
    number: '05',
    title: 'Full-stack development',
    description: 'Connect frontend, backend and persistent data.',
    icon: Workflow,
  },
  {
    number: '06',
    title: 'Real-world projects',
    description: 'Build applications and strengthen your portfolio.',
    icon: Rocket,
  },
];

const values = [
  {
    icon: Target,
    title: 'Purpose-driven learning',
    description:
      'Every learning activity should help develop a meaningful technical skill.',
  },
  {
    icon: Compass,
    title: 'Continuous improvement',
    description:
      'Build knowledge progressively and keep exploring new technologies.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality and clarity',
    description:
      'Focus on understandable learning material and useful practical guidance.',
  },
  {
    icon: Users,
    title: 'Learner-first experience',
    description:
      'Keep the platform organized around the needs of developers and learners.',
  },
];

const principles = [
  'Understand the fundamentals before moving forward.',
  'Practice consistently instead of only watching tutorials.',
  'Build projects that demonstrate your technical knowledge.',
  'Review your progress and continue improving your skills.',
];

function SectionLabel({ children, light = false }) {
  return (
    <div className={`about-label ${light ? 'about-label-light' : ''}`}>
      <span className="about-label-dot" />
      {children}
    </div>
  );
}

function SectionHeading({ eyebrow, title, description, centered = false }) {
  return (
    <div className={`about-section-heading ${centered ? 'is-centered' : ''}`}>
      <SectionLabel>{eyebrow}</SectionLabel>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

function AboutPage() {
  const [activeStage, setActiveStage] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);

    if (typeof IntersectionObserver === 'undefined') {
      return undefined;
    }

    const elements = document.querySelectorAll(
      '.about-reveal:not(.is-visible)'
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <main className={`about-page ${visible ? 'about-page-ready' : ''}`}>

      {/* HERO */}
      <section className="about-hero">
        <div className="about-hero-glow about-glow-one" />
        <div className="about-hero-glow about-glow-two" />

        <div className="about-hero-grid">

          <div className="about-hero-content">
            <SectionLabel light>
              ABOUT TYAGIJI LEARNING PLATFORM
            </SectionLabel>

            <h1>
              Turn curiosity
              <br />
              into <span>capability.</span>
            </h1>

            <p className="about-hero-description">
              A learning environment designed to help aspiring developers
              understand technology, practice their skills and build
              meaningful software projects.
            </p>

            <div className="about-hero-actions">
              <Link to="/courses" className="about-button about-button-primary">
                Explore courses
                <ArrowRight size={17} />
              </Link>

              <Link to="/projects" className="about-button about-button-ghost">
                Discover projects
                <ArrowUpRight size={17} />
              </Link>
            </div>

            <div className="about-hero-note">
              <span className="about-note-icon">
                <Check size={14} />
              </span>
              Learn. Build. Practice. Achieve.
            </div>
          </div>

          <div className="about-hero-visual">
            <div className="about-orbit about-orbit-outer" />
            <div className="about-orbit about-orbit-inner" />

            <div className="about-code-window">
              <div className="about-code-header">
                <div className="about-window-dots">
                  <i />
                  <i />
                  <i />
                </div>
                <span>developer-journey.jsx</span>
                <Terminal size={15} />
              </div>

              <div className="about-code-body">
                <div className="about-code-line">
                  <span className="code-muted">01</span>
                  <span className="code-purple">const</span>
                  <span className="code-blue"> journey</span>
                  <span className="code-muted"> = {'{'}</span>
                </div>

                <div className="about-code-line indent">
                  <span className="code-muted">02</span>
                  <span className="code-blue"> learn:</span>
                  <span className="code-green"> "everyday",</span>
                </div>

                <div className="about-code-line indent">
                  <span className="code-muted">03</span>
                  <span className="code-blue"> practice:</span>
                  <span className="code-green"> "consistently",</span>
                </div>

                <div className="about-code-line indent">
                  <span className="code-muted">04</span>
                  <span className="code-blue"> build:</span>
                  <span className="code-green"> "real projects",</span>
                </div>

                <div className="about-code-line indent">
                  <span className="code-muted">05</span>
                  <span className="code-blue"> improve:</span>
                  <span className="code-purple"> true</span>
                </div>

                <div className="about-code-line">
                  <span className="code-muted">06</span>
                  <span className="code-muted">{'};'}</span>
                </div>

                <div className="about-code-line about-code-last">
                  <span className="code-muted">07</span>
                  <span className="code-purple">return</span>
                  <span className="code-green"> growth;</span>
                  <span className="about-cursor" />
                </div>
              </div>

              <div className="about-code-footer">
                <span><span /> Learning in progress</span>
                <span>TyagiJI</span>
              </div>
            </div>

            <div className="about-floating-card about-float-top">
              <span className="about-floating-icon purple">
                <BrainCircuit size={19} />
              </span>
              <div>
                <strong>Think clearly</strong>
                <small>Understand concepts</small>
              </div>
            </div>

            <div className="about-floating-card about-float-bottom">
              <span className="about-floating-icon cyan">
                <Rocket size={19} />
              </span>
              <div>
                <strong>Build confidently</strong>
                <small>Turn ideas into projects</small>
              </div>
            </div>
          </div>
        </div>

        <div className="about-hero-bottom">
          <span>BUILT AROUND THE DEVELOPER JOURNEY</span>
          <span className="about-scroll-indicator">
            SCROLL TO EXPLORE <ChevronRight size={14} />
          </span>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="about-intro about-container about-reveal">
        <div className="about-intro-heading">
          <SectionLabel>OUR STORY</SectionLabel>
          <h2>
            Technology is easier to understand when learning has a
            <span> clear direction.</span>
          </h2>
        </div>

        <div className="about-intro-copy">
          <p>
            TyagiJI Learning Platform is built around a simple idea:
            learning software development should be structured, practical
            and focused on real understanding.
          </p>
          <p>
            Instead of treating lessons, references and projects as
            disconnected experiences, the platform brings these learning
            activities together in one organized environment.
          </p>

          <Link to="/courses" className="about-inline-link">
            Start your learning journey
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* MISSION AND VISION */}
      <section className="about-mission-section">
        <div className="about-container about-mission-grid">

          <article className="about-mission-card about-reveal">
            <div className="about-card-top">
              <span className="about-card-icon">
                <Target size={22} />
              </span>
              <span>01 / OUR MISSION</span>
            </div>

            <h2>
              Make learning
              <span> practical.</span>
            </h2>

            <p>
              Help learners develop useful software development skills
              through organized knowledge, consistent practice and
              meaningful project work.
            </p>

            <div className="about-mission-decoration">MISSION</div>
          </article>

          <article className="about-vision-card about-reveal">
            <div className="about-card-top">
              <span className="about-card-icon">
                <Sparkles size={22} />
              </span>
              <span>02 / OUR VISION</span>
            </div>

            <h2>
              Create with
              <span> confidence.</span>
            </h2>

            <p>
              Support a learning journey where developers move beyond
              consuming information and gain the confidence to create,
              experiment and solve real problems.
            </p>

            <div className="about-vision-decoration">
              <Code2 size={100} />
            </div>
          </article>

        </div>
      </section>

      {/* LEARNING PHILOSOPHY */}
      <section className="about-container about-philosophy-section about-reveal">
        <SectionHeading
          eyebrow="OUR LEARNING PHILOSOPHY"
          title={<>Learn something. <span>Build something.</span></>}
          description="A connected learning experience that transforms understanding into practical development skills."
          centered
        />

        <div className="about-pillar-grid">
          {learningPillars.map((pillar) => {
            const Icon = pillar.icon;

            return (
              <article className="about-pillar-card" key={pillar.number}>
                <div className="about-pillar-top">
                  <span>{pillar.number}</span>
                  <Icon size={24} />
                </div>

                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>

                <div className="about-pillar-tags">
                  {pillar.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>

                <div className="about-pillar-bottom">
                  <span>TYAGIJI LEARNING</span>
                  <ArrowUpRight size={17} />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* PLATFORM CAPABILITIES */}
      <section className="about-platform-section">
        <div className="about-container">
          <div className="about-platform-heading about-reveal">
            <div>
              <SectionLabel>ONE CONNECTED PLATFORM</SectionLabel>
              <h2>
                Everything connects to
                <span> your growth.</span>
              </h2>
            </div>

            <p>
              Explore the tools and learning experiences that help
              connect technical knowledge with practical development.
            </p>
          </div>

          <div className="about-feature-grid">
            {platformFeatures.map((feature) => {
              const Icon = feature.icon;

              return (
                <article className="about-feature-card" key={feature.number}>
                  <div className="about-feature-card-top">
                    <span>{feature.number}</span>
                    <Icon size={24} />
                  </div>

                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>

                  <Link to={feature.link}>
                    {feature.linkText}
                    <ArrowRight size={15} />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ROADMAP */}
      <section className="about-roadmap-section about-container about-reveal">
        <div className="about-roadmap-intro">
          <SectionLabel>A PROGRESSIVE LEARNING PATH</SectionLabel>

          <h2>
            Your journey from
            <span> beginner to builder.</span>
          </h2>

          <p>
            Develop your skills step by step. Select a stage to explore
            the focus of each part of the developer journey.
          </p>

          <Link to="/courses" className="about-button about-button-primary">
            Explore learning paths
            <ArrowRight size={16} />
          </Link>

          <div className="about-roadmap-selected">
            <span>SELECTED STAGE</span>
            <strong>
              {String(activeStage + 1).padStart(2, '0')} / 06
            </strong>
          </div>
        </div>

        <div className="about-roadmap-list">
          {roadmap.map((stage, index) => {
            const Icon = stage.icon;
            const selected = activeStage === index;

            return (
              <button
                type="button"
                key={stage.number}
                className={`about-roadmap-item ${selected ? 'active' : ''}`}
                onClick={() => setActiveStage(index)}
                aria-pressed={selected}
              >
                <span className="about-roadmap-number">
                  {stage.number}
                </span>

                <span className="about-roadmap-icon">
                  <Icon size={19} />
                </span>

                <span className="about-roadmap-text">
                  <strong>{stage.title}</strong>
                  <small>{stage.description}</small>
                </span>

                <ChevronRight size={19} className="about-roadmap-arrow" />
              </button>
            );
          })}
        </div>
      </section>

      {/* VALUES */}
      <section className="about-values-section">
        <div className="about-container">
          <SectionHeading
            eyebrow="WHAT WE BELIEVE"
            title={<>Built on principles that <span>matter.</span></>}
            description="A strong learning experience begins with the right principles."
            centered
          />

          <div className="about-values-grid">
            {values.map((value, index) => {
              const Icon = value.icon;

              return (
                <article className="about-value-card" key={value.title}>
                  <div className="about-value-icon">
                    <Icon size={22} />
                  </div>
                  <span className="about-value-number">
                    0{index + 1}
                  </span>
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRINCIPLES */}
      <section className="about-principles-section about-container about-reveal">
        <div className="about-principles-visual">
          <div className="about-principles-icon">
            <Zap size={36} />
          </div>

          <div className="about-principles-orbit" />

          <span>KEEP BUILDING</span>
        </div>

        <div className="about-principles-content">
          <SectionLabel>THE DEVELOPER MINDSET</SectionLabel>

          <h2>
            Progress comes from
            <span> consistent action.</span>
          </h2>

          <p>
            Becoming a developer is not about knowing everything.
            It is about learning continuously, solving problems and
            improving through experience.
          </p>

          <ul>
            {principles.map((principle) => (
              <li key={principle}>
                <CheckCircle2 size={18} />
                {principle}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="about-container about-cta-section">
        <div className="about-cta-card">
          <div className="about-cta-glow" />

          <div className="about-cta-content">
            <SectionLabel light>
              YOUR NEXT CHAPTER STARTS HERE
            </SectionLabel>

            <h2>
              Don't just learn to code.
              <br />
              <span>Learn to create.</span>
            </h2>

            <p>
              Choose your starting point, explore useful learning
              resources and begin building your developer journey.
            </p>

            <div className="about-cta-actions">
              <Link to="/courses" className="about-button about-button-primary">
                Start learning
                <ArrowRight size={17} />
              </Link>

              <Link to="/projects" className="about-button about-button-ghost">
                Explore projects
                <ArrowUpRight size={17} />
              </Link>
            </div>
          </div>

          <div className="about-cta-symbol">
            <GraduationCap size={125} strokeWidth={1} />
            <span>TYAGIJI</span>
          </div>
        </div>
      </section>

    </main>
  );
}

export default AboutPage;
