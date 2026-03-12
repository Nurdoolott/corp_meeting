import React from "react";
import { get } from "../api/api.jsx";

const Meetings = () => {
  const [meetings, setMeetings] = React.useState([]);
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const responce = await get.meetings();
        setMeetings(responce);
      } catch (error) {
        console.error("Error fetching meetings:", error);
      }
    };
    fetchData();
  }, []);
  console.log(meetings);
  return (
    <div>
      Meetings
      {meetings.map((meeting) => (
        <div key={meeting.id}>
          <h3>{meeting.title}</h3>
          <p>{meeting.description}</p>
          <p>{new Date(meeting.meeting_date).toLocaleString()}</p>
          <p>Created by: {meeting.creator_name}</p>
        </div>
      ))}
      <div></div>
    </div>
  );
};

export default Meetings;
