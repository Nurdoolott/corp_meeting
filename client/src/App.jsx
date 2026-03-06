import { useEffect, useState } from "react";

export default function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:4000/api/health")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>Corporate Meetings MVP</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
