import { useEffect, useState } from "react";
import { api } from "../api/api";
import { Link } from "react-router-dom";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  const loadMeetings = () => {
    api.getMeetings().then(setMeetings);
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  const createMeeting = async (e) => {
    e.preventDefault();

    await api.createMeeting({
      title,
      description,
      meeting_date: date,
    });

    setTitle("");
    setDescription("");
    setDate("");

    loadMeetings();
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold mb-6">Meetings</h1>

        {/* CREATE MEETING */}
        <form
          onSubmit={createMeeting}
          className="mb-10 rounded-xl border bg-white p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold mb-4">Create Meeting</h2>

          <div className="grid gap-4">
            <input
              className="border p-2 rounded"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <textarea
              className="border p-2 rounded"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <input
              type="datetime-local"
              className="border p-2 rounded"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            <button className="bg-black text-white px-4 py-2 rounded">
              Create
            </button>
          </div>
        </form>

        {/* MEETINGS LIST */}
        <div className="grid gap-4 md:grid-cols-2">
          {meetings.map((m) => (
            <div
              key={m.id}
              className="rounded-xl border bg-white p-4 shadow-sm"
            >
              <h3 className="text-lg font-semibold">{m.title}</h3>

              <p className="text-gray-600 text-sm">
                {m.description || "No description"}
              </p>

              <Link
                to={`/meetings/${m.id}`}
                className="inline-block mt-3 text-blue-600"
              >
                Open meeting
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
