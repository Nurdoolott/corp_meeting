import { Routes, Route } from "react-router-dom";
import MeetingsPage from "./pages/MeetingsPage";
import MeetingPage from "./pages/MeetingPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MeetingsPage />} />
      <Route path="/meetings/:id" element={<MeetingPage />} />
    </Routes>
  );
}

export default App;
