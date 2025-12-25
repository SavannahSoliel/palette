import { useEffect, useState } from "react";
import "./HeroSlideshow.css";

const slides = [
  {
    image: "/slides/sabrina.jpg",
    caption: "a style curated for you"
  },
  {
    image: "/slides/ariana.jpg",
    caption: "based on your favorite inspirations"
  },
  {
    image: "/slides/selena.jpg",
    caption: "a gift finding hack"
  }
];

export default function HeroSlideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero-slideshow">
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`hero-slide ${i === index ? "active" : ""}`}
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <div className="hero-overlay">
            <p>{slide.caption}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
