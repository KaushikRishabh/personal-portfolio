import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "./CursorCracks.module.css";

const CursorCracks = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className={styles.circleContainer}>
      <svg
        className={styles.circle}
        xmlns="http://www.w3.org/2000/svg"
        width="200"
        height="200"
        style={{
          top: mousePosition.y - 100,
          left: mousePosition.x - 100,
        }}
      >
        <circle cx="100" cy="100" r="50" />
      </svg>
    </div>
  );
};
export default CursorCracks;
