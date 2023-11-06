import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const BackgroundAnimation = () => {
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
    <motion.div
      className="absolute inset-0 pointer-events-none"
      animate={{
        x: mousePosition.x - 50,
        y: mousePosition.y - 50,
      }}
    >
      <motion.div
        className="absolute w-64 h-64 bg-white rounded-full opacity-10"
        animate={{ scale: [0.5, 1.2, 0.5], opacity: [0.4, 0.1, 0.4] }}
        transition={{ duration: 5, repeat: Infinity }}
      ></motion.div>
      <motion.div
        className="absolute w-64 h-64 bg-white rounded-full opacity-20"
        animate={{ scale: [0.5, 1.2, 0.5], opacity: [0.4, 0.1, 0.4] }}
        transition={{ duration: 7, repeat: Infinity }}
      ></motion.div>
    </motion.div>
  );
};

export default BackgroundAnimation;
