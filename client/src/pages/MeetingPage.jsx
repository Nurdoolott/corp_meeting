import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../api/api";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";

export default function MeetingPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [summary, setSummary] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [taskText, setTaskText] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [participantId, setParticipantId] = useState("");
  const [user, setUser] = useState(null);
  const [showAllTimeline, setShowAllTimeline] = useState(false);

  useEffect(() => {
    api.getMe().then(setUser);
  }, []);

  const deleteMeeting = async () => {
    const confirmDelete = confirm("Delete this meeting?");

    if (!confirmDelete) return;

    await fetch(`http://localhost:4000/api/meetings/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": "381f9ced-27e8-466a-9959-198907e2e09e",
      },
    });

    navigate("/");
  };

  const addParticipant = async (e) => {
    e.preventDefault();

    await fetch(`http://localhost:4000/api/meetings/${id}/participants`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": "381f9ced-27e8-466a-9959-198907e2e09e",
      },
      body: JSON.stringify({
        user_id: participantId,
      }),
    });

    setParticipantId("");

    const data = await api.getSummary(id);
    setSummary(data);
  };

  const markTaskDone = async (taskId) => {
    console.log("markTaskDone clicked, taskId =", taskId);

    await fetch(`http://localhost:4000/api/tasks/${taskId}/done`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": "6305d2e5-e624-49ca-852e-8fa863e4cce8",
      },
    });

    const data = await api.getSummary(id);
    setSummary(data);
  };

  const createTask = async (e) => {
    e.preventDefault();

    await fetch(`http://localhost:4000/api/tasks/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": "381f9ced-27e8-466a-9959-198907e2e09e",
      },
      body: JSON.stringify({
        description: taskText,
        assigned_to: assignedTo || null,
        due_date: dueDate || null,
      }),
    });

    setTaskText("");
    setDueDate("");
    setAssignedTo("");

    const data = await api.getSummary(id);
    setSummary(data);
  };

  const createNote = async (e) => {
    e.preventDefault();

    await fetch(`http://localhost:4000/api/meetings/${id}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": "381f9ced-27e8-466a-9959-198907e2e09e",
      },
      body: JSON.stringify({
        content: noteText,
      }),
    });

    setNoteText("");

    const data = await api.getSummary(id);
    setSummary(data);
  };

  useEffect(() => {
    api.getSummary(id).then(setSummary);
  }, [id]);

  if (!summary) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-5xl rounded-2xl bg-white p-6 shadow-sm border border-gray-200">
          Loading...
        </div>
      </div>
    );
  }

  const { meeting, participants, notes, tasks } = summary;

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === b.status) return 0;
    if (a.status === "done") return 1;
    return -1;
  });

  const tasksDone = tasks.filter((t) => t.status === "done").length;

  const timeline = [
    ...notes.map((n) => ({
      id: `note-${n.id}`,
      type: "note",
      text: `${n.author_name} added a note`,
      date: n.created_at,
    })),

    ...tasks.map((t) => ({
      id: `task-${t.id}`,
      type: "task",
      text:
        t.status === "done"
          ? `${t.assigned_to_name || "Someone"} completed a task`
          : `${t.assigned_to_name || "Someone"} was assigned a task`,
      date: t.created_at,
    })),

    ...participants.map((p) => ({
      id: `participant-${p.id}`,
      type: "participant",
      text: `${p.full_name} joined the meeting`,
      date: meeting.created_at,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const visibleTimeline = showAllTimeline ? timeline : timeline.slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <TopBar user={user} className="fixed top-0 left-0 right-0" />
        <Link
          to="/"
          className="mb-6 inline-block text-sm font-medium text-gray-600 hover:text-black"
        >
          ← Back to meetings
        </Link>

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">{meeting.title}</h1>
          <p className="mt-3 text-gray-600">
            {meeting.description || "No description"}
          </p>
          {(user?.role === "organizer" || user?.role === "admin") && (
            <button
              onClick={deleteMeeting}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded"
            >
              Delete Meeting
            </button>
          )}

          <div className="mt-4 grid gap-3 md:grid-cols-3 text-sm text-gray-600">
            <div className="rounded-xl bg-blue-200 p-3">
              <span className="font-semibold text-gray-800">Creator:</span>{" "}
              {meeting.creator_name || "Unknown"}
            </div>
            <div className="rounded-xl bg-blue-200 p-3">
              <span className="font-semibold text-gray-800">Date:</span>{" "}
              {new Date(meeting.meeting_date).toLocaleString()}
            </div>
            <div className="rounded-xl bg-blue-200 p-3">
              <span className="font-semibold text-gray-800">Meeting ID:</span>{" "}
              {meeting.id}
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-4 gap-4">
          <div className="rounded-xl bg-white p-4 shadow border">
            <p className="text-sm text-gray-500">Participants</p>
            <p className="text-2xl font-bold">{participants.length}</p>
          </div>

          <div className="rounded-xl bg-white p-4 shadow border">
            <p className="text-sm text-gray-500">Notes</p>
            <p className="text-2xl font-bold">{notes.length}</p>
          </div>

          <div className="rounded-xl bg-white p-4 shadow border">
            <p className="text-sm text-gray-500">Tasks</p>
            <p className="text-2xl font-bold">{tasks.length}</p>
          </div>

          <div className="rounded-xl bg-white p-4 shadow border">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold">{tasksDone}</p>
          </div>
        </div>

        <div className="mb-6 rounded-xl bg-white p-4 shadow border">
          <p className="text-sm text-gray-600 mb-2">Task progress</p>

          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full"
              style={{
                width: `${tasks.length ? (tasksDone / tasks.length) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Meeting Activity
            </h2>

            {timeline.length > 4 && (
              <button
                onClick={() => setShowAllTimeline((prev) => !prev)}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                {showAllTimeline ? "Show less" : "Show all"}
              </button>
            )}
          </div>

          {timeline.length === 0 ? (
            <p className="text-sm text-gray-500">No activity yet.</p>
          ) : (
            <div
              className={`${showAllTimeline ? "max-h-80 overflow-y-auto pr-2" : ""} space-y-3`}
            >
              {visibleTimeline.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between rounded-xl bg-gray-50 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.text}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-gray-400">
                      {item.type}
                    </p>
                  </div>

                  <p className="ml-4 text-xs text-gray-500">
                    {new Date(item.date).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Participants
            </h2>
            {(user?.role === "organizer" || user?.role === "admin") && (
              <form onSubmit={addParticipant} className="mb-4 space-y-2">
                <select
                  className="w-full border rounded p-2"
                  value={participantId}
                  onChange={(e) => setParticipantId(e.target.value)}
                  required
                >
                  <option value="">Select participant</option>

                  <option value="6305d2e5-e624-49ca-852e-8fa863e4cce8">
                    Participant
                  </option>
                </select>

                <button className="bg-black text-white px-4 py-2 rounded">
                  Add participant
                </button>
              </form>
            )}
            {participants.length === 0 ? (
              <p className="text-sm text-gray-500">No participants yet.</p>
            ) : (
              <div className="space-y-3">
                {participants.map((p) => (
                  <div key={p.id} className="rounded-xl bg-gray-50 p-3 text-sm">
                    <p className="font-medium text-gray-900">{p.full_name}</p>
                    <p className="text-gray-500">{p.email}</p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-gray-400">
                      {p.role}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Notes</h2>

            {/* FORM ADD NOTE */}
            <form onSubmit={createNote} className="mb-4">
              <textarea
                className="w-full border rounded p-2"
                placeholder="Write note..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                required
              />

              <button className="mt-2 bg-black text-white px-4 py-2 rounded">
                Add Note
              </button>
            </form>

            {notes.length === 0 ? (
              <p className="text-sm text-gray-500">No notes yet.</p>
            ) : (
              <div className="space-y-3">
                {notes.map((n) => (
                  <div key={n.id} className="rounded-xl bg-gray-50 p-3 text-sm">
                    <p className="text-gray-800">{n.content}</p>
                    <p className="mt-2 text-xs text-gray-500">
                      Author: {n.author_name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">Tasks</h2>

            {(user?.role === "organizer" || user?.role === "admin") && (
              <form onSubmit={createTask} className="mb-4 space-y-3">
                <input
                  className="w-full border rounded p-2"
                  placeholder="Task description"
                  value={taskText}
                  onChange={(e) => setTaskText(e.target.value)}
                  required
                />

                <select
                  className="w-full border rounded p-2"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  required
                >
                  <option value="">Select participant</option>
                  {participants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name}
                    </option>
                  ))}
                </select>

                <input
                  type="datetime-local"
                  className="w-full border rounded p-2"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />

                <button className="bg-black text-white px-4 py-2 rounded">
                  Add Task
                </button>
              </form>
            )}
            {tasks.length === 0 ? (
              <p className="text-sm text-gray-500">No tasks yet.</p>
            ) : (
              <div className="space-y-3">
                {sortedTasks.map((t) => (
                  <div key={t.id} className="rounded-xl bg-gray-50 p-3 text-sm">
                    <p className="font-medium text-gray-900">{t.description}</p>

                    <p className="mt-1 text-gray-500">
                      Assigned to: {t.assigned_to_name || "Unknown"}
                    </p>

                    <p
                      className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                        t.status === "done"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {t.status}
                    </p>

                    {t.status !== "done" && (
                      <button
                        onClick={() => markTaskDone(t.id)}
                        className="mt-3 block rounded-lg bg-green-600 px-3 py-2 text-white hover:bg-green-700"
                      >
                        Mark Done
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
