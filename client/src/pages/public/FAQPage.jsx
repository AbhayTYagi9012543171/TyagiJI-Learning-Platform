import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge, Container, PageHeader } from '../../components/ui/index.js';

const questions = [
  {
    question: 'Do I need an account to explore TyagiJI?',
    answer: 'You can browse public course, project and resource pages without signing in. An account is required for protected learning activities such as opening enrolled lessons and saving your personal progress.',
  },
  {
    question: 'How is my course progress calculated?',
    answer: 'Progress is based on lesson completion records saved to your account. The dashboard and progress page use the learning data returned by the platform rather than a browser-only counter.',
  },
  {
    question: 'How do I continue a course?',
    answer: 'Sign in, open your dashboard and choose a course in progress. You can also browse the course catalog and open a course detail page to review its learning content and access requirements.',
  },
  {
    question: 'Can I save lessons and resources?',
    answer: 'The platform includes bookmarks for supported learning content. Sign in and use the bookmark control where it is available; saved items appear in your bookmarks area.',
  },
  {
    question: 'How do quizzes work?',
    answer: 'Open an available assessment from its course or assessment entry point, complete the questions and submit your attempt. Results and explanations are shown according to the assessment configuration.',
  },
  {
    question: 'Does the developer playground execute every programming language?',
    answer: 'No. Code execution should only be enabled when a secure isolated execution provider is configured. If that service is not configured, the interface should communicate that execution is unavailable rather than implying code has run.',
  },
  {
    question: 'What is the Career workspace?',
    answer: 'The Career workspace lets signed-in learners maintain a target role, experience level, skills and interests, then create roadmaps with milestones and track their completion.',
  },
  {
    question: 'Does TyagiJI work on mobile devices?',
    answer: 'The client includes responsive layouts for smaller screens. For the best experience, keep your browser updated and use the mobile navigation when it is displayed.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <Container className="faq-page">
      <PageHeader
        tag="HELP CENTER"
        title="Frequently asked questions."
        text="Clear answers about accounts, learning progress, assessments and the tools available in TyagiJI."
      >
        <Badge tone="info" dot>Platform guide</Badge>
      </PageHeader>
      <div className="faq-layout">
        <section className="faq-list" aria-label="Frequently asked questions">
          {questions.map((item, index) => {
            const open = openIndex === index;
            return (
              <article className={`faq-item ${open ? 'is-open' : ''}`} key={item.question}>
                <h2>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`faq-answer-${index}`}
                    onClick={() => setOpenIndex(open ? -1 : index)}
                  >
                    <span>{item.question}</span>
                    <ChevronDown size={18} aria-hidden="true" />
                  </button>
                </h2>
                {open && <div id={`faq-answer-${index}`} className="faq-answer"><p>{item.answer}</p></div>}
              </article>
            );
          })}
        </section>
        <aside className="faq-aside">
          <div className="faq-aside-icon"><HelpCircle size={23}/></div>
          <h2>Ready to start learning?</h2>
          <p>Explore the course catalog and choose a learning path that matches your current goals.</p>
          <Link className="btn primary" to="/courses">Explore courses</Link>
          <Link className="text-link" to="/about">Learn about TyagiJI</Link>
        </aside>
      </div>
    </Container>
  );
}
