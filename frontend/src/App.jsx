import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);

  const sanitizeValue = (value) =>
    value?.replace(/"/g, "").trim().toLowerCase();

  const fetchTickets = async () => {
    const res = await axios.get("http://localhost:8000/api/tickets/");
    setTickets(res.data);
  };

  const fetchStats = async () => {
    const res = await axios.get("http://localhost:8000/api/tickets/stats/");
    setStats(res.data);
  };

  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, []);

  const handleClassify = async () => {
    if (!description) return;

    setLoading(true);
    const res = await axios.post(
      "http://localhost:8000/api/tickets/classify/",
      { description }
    );

    setCategory(sanitizeValue(res.data.suggested_category) || "");
    setPriority(sanitizeValue(res.data.suggested_priority) || "");
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await axios.post("http://localhost:8000/api/tickets/", {
      title,
      description,
      category,
      priority,
      status: "open",
    });

    setTitle("");
    setDescription("");
    setCategory("");
    setPriority("");

    fetchTickets();
    fetchStats();
  };

  const handleStatusChange = async (id, status) => {
    await axios.patch(
      `http://localhost:8000/api/tickets/${id}/`,
      { status }
    );

    fetchTickets();
    fetchStats();
  };

  return (
    <div className="container">
      <h1>Support Ticket System</h1>

      {/* Dashboard */}
      {stats && (
        <div className="dashboard">
          <div className="stat-card">
            <h3>Total Tickets</h3>
            <p>{stats.total_tickets}</p>
          </div>
          <div className="stat-card">
            <h3>Open Tickets</h3>
            <p>{stats.open_tickets}</p>
          </div>
          <div className="stat-card">
            <h3>Avg / Day</h3>
            <p>{stats.avg_tickets_per_day}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form className="ticket-form" onSubmit={handleSubmit}>
        <input
          placeholder="Title"
          value={title}
          required
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Description"
          value={description}
          required
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleClassify}
        />

        {loading && <p>Classifying...</p>}

        <div className="form-row">
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Category</option>
            <option value="billing">Billing</option>
            <option value="technical">Technical</option>
            <option value="account">Account</option>
            <option value="general">General</option>
          </select>

          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="">Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <button type="submit">Create Ticket</button>
      </form>

      {/* Ticket List */}
      <div className="ticket-list">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="ticket-card">
            <div className="ticket-header">
              <h3>{ticket.title}</h3>
              <span className={`badge ${ticket.priority}`}>
                {ticket.priority}
              </span>
            </div>

            <p className="description">
              {ticket.description.length > 120
                ? ticket.description.substring(0, 120) + "..."
                : ticket.description}
            </p>

            <div className="ticket-footer">
              <span className="category">{ticket.category}</span>

              <select
                value={ticket.status}
                onChange={(e) =>
                  handleStatusChange(ticket.id, e.target.value)
                }
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <small>
              {new Date(ticket.created_at).toLocaleString()}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
