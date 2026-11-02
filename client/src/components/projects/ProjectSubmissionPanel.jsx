import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Github,
  LoaderCircle,
  Send,
  ShieldCheck,
} from 'lucide-react';

import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

const STATUS_LABELS = {
  draft: 'Draft',
  submitted: 'Submitted',
  in_review: 'In review',
  changes_requested: 'Changes requested',
  approved: 'Approved',
  rejected: 'Not approved',
};

function getProjectId(submission) {
  return String(
    submission?.project?._id ||
    submission?.project?.id ||
    submission?.project ||
    ''
  );
}

function formatDate(value) {
  if (!value) return 'Not available';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return 'Not available';

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default function ProjectSubmissionPanel({ project }) {
  const { user, loading: authLoading } = useAuth();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    title: `${project?.title || 'Project'} submission`,
    description: '',
    repositoryUrl: '',
    demoUrl: '',
  });

  const loadSubmissions = useCallback(async () => {
    if (!user) {
      setSubmissions([]);
      return;
    }

    setLoading(true);

    try {
      const response = await api.get(
        '/v11/submissions?limit=50'
      );

      const items = Array.isArray(response?.data)
        ? response.data
        : [];

      setSubmissions(
        items.filter(
          (item) => getProjectId(item) === String(project?._id)
        )
      );
    } catch (err) {
      if (err?.status !== 401) {
        setError(
          err?.message || 'Could not load your submissions.'
        );
      }
    } finally {
      setLoading(false);
    }
  }, [project?._id, user]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const update = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (!project?._id) {
      setError(
        'This project is missing its database identifier. Please contact the platform administrator.'
      );
      return;
    }

    if (!form.title.trim()) {
      setError('Please enter a submission title.');
      return;
    }

    setSaving(true);

    try {
      await api.post('/v11/submissions', {
        project: project._id,
        title: form.title.trim(),
        description: form.description.trim(),
        repositoryUrl: form.repositoryUrl.trim(),
        demoUrl: form.demoUrl.trim(),
      });

      setSuccess(
        'Your project has been submitted for review.'
      );

      setForm((current) => ({
        ...current,
        description: '',
        repositoryUrl: '',
        demoUrl: '',
      }));

      await loadSubmissions();
    } catch (err) {
      setError(
        err?.message ||
        'Unable to submit your project. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <section className="project-submission-panel">
        <div className="project-panel-loading">
          <LoaderCircle size={20} className="spin" />
          Checking your account…
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="project-submission-panel">
        <div className="project-submission-heading">
          <span className="project-panel-icon">
            <ShieldCheck size={20} />
          </span>

          <div>
            <span className="project-panel-eyebrow">
              SHARE YOUR WORK
            </span>
            <h3>Submit your project</h3>
          </div>
        </div>

        <p className="project-panel-description">
          Sign in to submit your repository and live demo for
          review. Your submission history will be available here.
        </p>

        <Link
          to="/login"
          className="project-submit-button"
        >
          Sign in to submit
          <Send size={16} />
        </Link>
      </section>
    );
  }

  return (
    <section className="project-submission-panel">
      <div className="project-submission-heading">
        <span className="project-panel-icon">
          <Github size={20} />
        </span>

        <div>
          <span className="project-panel-eyebrow">
            PORTFOLIO REVIEW
          </span>
          <h3>Submit your build</h3>
        </div>
      </div>

      <p className="project-panel-description">
        Share your Git repository and optional live demo.
        An administrator can review your work and send feedback.
      </p>

      {error && (
        <div className="project-form-alert is-error" role="alert">
          <AlertCircle size={17} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="project-form-alert is-success" role="status">
          <CheckCircle2 size={17} />
          <span>{success}</span>
        </div>
      )}

      <form className="project-submission-form" onSubmit={submit}>
        <label>
          <span>Submission title</span>
          <input
            name="title"
            value={form.title}
            onChange={update}
            minLength={3}
            maxLength={140}
            required
            placeholder="My completed project"
          />
        </label>

        <label>
          <span>What did you build?</span>
          <textarea
            name="description"
            value={form.description}
            onChange={update}
            maxLength={5000}
            rows={4}
            placeholder="Briefly describe the features you implemented, the challenges you solved, and what you learned."
          />
        </label>

        <label>
          <span>
            Git repository URL <em>Required for review</em>
          </span>
          <div className="project-input-with-icon">
            <Github size={17} />
            <input
              name="repositoryUrl"
              type="url"
              value={form.repositoryUrl}
              onChange={update}
              maxLength={500}
              placeholder="https://github.com/username/project"
              required
            />
          </div>
        </label>

        <label>
          <span>Live demo URL <em>Optional</em></span>
          <div className="project-input-with-icon">
            <ExternalLink size={17} />
            <input
              name="demoUrl"
              type="url"
              value={form.demoUrl}
              onChange={update}
              maxLength={500}
              placeholder="https://your-project.example"
            />
          </div>
        </label>

        <button
          className="project-submit-button"
          type="submit"
          disabled={saving}
        >
          {saving ? (
            <>
              <LoaderCircle size={17} className="spin" />
              Submitting…
            </>
          ) : (
            <>
              Submit for review
              <Send size={16} />
            </>
          )}
        </button>
      </form>

      <div className="project-submission-history">
        <div className="project-history-heading">
          <h4>Your submissions</h4>
          <span>{submissions.length}</span>
        </div>

        {loading ? (
          <div className="project-history-loading">
            <LoaderCircle size={17} className="spin" />
            Loading submissions…
          </div>
        ) : submissions.length === 0 ? (
          <p className="project-history-empty">
            You haven't submitted this project yet.
          </p>
        ) : (
          <div className="project-history-list">
            {submissions.map((item) => {
              const status = item.status || 'submitted';

              return (
                <article
                  className="project-history-item"
                  key={item._id}
                >
                  <div className="project-history-item-main">
                    <strong>{item.title}</strong>
                    <span>{formatDate(item.updatedAt || item.createdAt)}</span>

                    {item.feedback && (
                      <p className="project-review-feedback">
                        <b>Review feedback:</b> {item.feedback}
                      </p>
                    )}
                  </div>

                  <span
                    className={`project-review-status status-${status}`}
                  >
                    {STATUS_LABELS[status] || status}
                  </span>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}