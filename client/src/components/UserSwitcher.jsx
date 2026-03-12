import { setUser } from "../api/api";

export default function UserSwitcher() {
  const changeUser = (e) => {
    setUser(e.target.value);
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <select onChange={changeUser}>
        <option value="a5812d3d-c25f-488b-ab70-0af825ed7f8c">Admin</option>

        <option value="381f9ced-27e8-466a-9959-198907e2e09e">Organizer</option>

        <option value="6305d2e5-e624-49ca-852e-8fa863e4cce8">
          Participant
        </option>
      </select>
    </div>
  );
}
