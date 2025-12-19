import { celebrities } from "../data/celebrities";

function CelebritySelect({ selected, setSelected }) {
  function toggleCelebrity(name) {
    if (selected.includes(name)) {
      setSelected(selected.filter(c => c !== name));
    } else {
      setSelected([...selected, name]);
    }
  }

  return (
    <div>
      <p>celebrity select loaded</p>

      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
        {celebrities.map((celeb) => (
          <button
            key={celeb.id}
            onClick={() => toggleCelebrity(celeb.name)}
          >
            {celeb.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CelebritySelect;
