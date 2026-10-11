import { useEffect, useState } from 'react';
import { Check, ChevronDown, ChevronRight, CirclePlus, ClipboardList, LoaderCircle, Trash2 } from 'lucide-react';
import { api } from './api.js';

const statuses = ['to_do', 'pending', 'in_progress', 'done'];
const actors = ['John Doe', 'Jane Smith', 'Alice'];
const labels = { to_do: 'To do', pending: 'Pending', in_progress: 'In progress', done: 'Done' };

function TaskCard({ task, actor, onChange, onDelete }) {
    const [open, setOpen] = useState(false);
    const [logs, setLogs] = useState([]);
    const [busy, setBusy] = useState(false);
    const nextStatus = statuses[statuses.indexOf(task.status) + 1];

    async function toggleLogs() {
        if (!open && logs.length === 0) setLogs(await api.getAuditLogs(task.id));
        setOpen(!open);
    }

    async function advance() {
        setBusy(true);
        try {
            await api.updateStatus(task.id, { status: nextStatus, actor });
            await onChange();
            if (open) setLogs(await api.getAuditLogs(task.id));
        } catch (error) {
            window.alert(error.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <article className="task-card">
            <div className="task-main">
                <div className="task-copy">
                    <span className={`status status-${task.status}`}>{labels[task.status]}</span>
                    <h2>{task.title}</h2>
                    <p>{task.description || 'No description provided.'}</p>
                </div>
                <div className="task-actions">
                    {nextStatus && (
                        <button className="button button-primary" disabled={busy} onClick={advance}>
                            {busy ? <LoaderCircle className="spin" size={16} /> : <Check size={16} />} Move to {labels[nextStatus]}
                        </button>
                    )}
                    <button className="icon-button danger" title="Delete task" onClick={() => onDelete(task.id)}>
                        <Trash2 size={17} />
                    </button>
                </div>
            </div>
            <button className="audit-toggle" onClick={toggleLogs}>
                {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />} Audit history <span>{logs.length || ''}</span>
            </button>
            {open && (
                <div className="audit-list">
                    {logs.length ? (
                        logs.map((log) => (
                            <div className="audit-row" key={log.id}>
                                <span className="audit-dot" />
                                <p>
                                    <strong>{log.actor}</strong> changed status from <em>{labels[log.fromStatus]}</em> to{' '}
                                    <em>{labels[log.toStatus]}</em>
                                    <small>{new Date(log.timestamp).toLocaleString()}</small>
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="empty-audit">No status changes yet.</p>
                    )}
                </div>
            )}
        </article>
    );
}

export default function App() {
    const [tasks, setTasks] = useState([]);
    const [actor, setActor] = useState(actors[0]);
    const [form, setForm] = useState({ title: '', description: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    async function loadTasks() {
        setLoading(true);
        try {
            setTasks(await api.getTasks());
            setError('');
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        loadTasks();
    }, []);
    async function submit(event) {
        event.preventDefault();
        try {
            await api.createTask(form);
            setForm({ title: '', description: '' });
            await loadTasks();
        } catch (requestError) {
            setError(requestError.message);
        }
    }
    async function remove(id) {
        if (!window.confirm('Delete this task?')) return;
        try {
            await api.deleteTask(id);
            await loadTasks();
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    return (
        <main className="app-shell">
            <header className="topbar">
                <div className="brand">
                    <div className="brand-mark">
                        <ClipboardList size={21} />
                    </div>
                    <div>
                        <p className="eyebrow">Workspace</p>
                        <h1>Task flow</h1>
                    </div>
                </div>
                <label className="actor-picker">
                    Acting as
                    <select value={actor} onChange={(event) => setActor(event.target.value)}>
                        {actors.map((name) => (
                            <option key={name}>{name}</option>
                        ))}
                    </select>
                </label>
            </header>
            <section className="intro">
                <div>
                    <p className="eyebrow">Today&apos;s focus</p>
                    <h2>Move good work forward.</h2>
                    <p>Every transition is recorded, accountable, and kept in order.</p>
                </div>
                <div className="count">
                    <strong>{tasks.length}</strong>
                    <span>active tasks</span>
                </div>
            </section>
            <section className="content-grid">
                <form className="new-task" onSubmit={submit}>
                    <div className="section-heading">
                        <CirclePlus size={19} />
                        <h2>New task</h2>
                    </div>
                    <label>
                        Title
                        <input
                            required
                            value={form.title}
                            onChange={(event) => setForm({ ...form, title: event.target.value })}
                            placeholder="What needs doing?"
                        />
                    </label>
                    <label>
                        Description
                        <textarea
                            value={form.description}
                            onChange={(event) => setForm({ ...form, description: event.target.value })}
                            placeholder="Add useful context"
                            rows="5"
                        />
                    </label>
                    <button className="button button-dark" type="submit">
                        Create task <ChevronRight size={17} />
                    </button>
                </form>
                <section className="task-section">
                    <div className="section-heading">
                        <h2>All tasks</h2>
                        <span className="task-total">{tasks.length}</span>
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    {loading ? (
                        <div className="loading">
                            <LoaderCircle className="spin" /> Loading tasks
                        </div>
                    ) : tasks.length ? (
                        tasks.map((task) => <TaskCard key={task.id} task={task} actor={actor} onChange={loadTasks} onDelete={remove} />)
                    ) : (
                        <div className="empty-state">
                            <ClipboardList size={30} />
                            <p>No tasks yet. Add the first one.</p>
                        </div>
                    )}
                </section>
            </section>
        </main>
    );
}
