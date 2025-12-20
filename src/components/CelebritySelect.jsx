import { celebrities } from "../data/celebrities";
import "./CelebritySelect.css";

function CelebritySelect({ selected, setSelected }) {
  function toggleCelebrity(name) {
    if (selected.includes(name)) {
      setSelected(selected.filter(c => c !== name));
    } else {
      setSelected([...selected, name]);
    }
  }

  return (
    <div className="celebrity-scroll">
      {celebrities.map((celeb) => (
        <div
          key={celeb.id}
          className={`celebrity-card ${selected.includes(celeb.name) ? "selected" : ""}`}
          onClick={() => toggleCelebrity(celeb.name)}
        >
          {/* Circular image */}
          {celeb.image && (
            <img
              src={celeb.image}
              alt={celeb.name}
              className="celebrity-image"
            />
          )}

          {/* Celebrity name */}
          <p className="celebrity-name">{celeb.name}</p>
        </div>
      ))}
    </div>
  );
}

export default CelebritySelect;
