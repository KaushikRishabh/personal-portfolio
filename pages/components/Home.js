import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const Home = () => {
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
    <div className="relative h-screen bg-gradient-to-r from-blue-500 to-green-500">
      <motion.div
        animate={{
          x: mousePosition.x - 50,
          y: mousePosition.y - 50,
        }}
        className="absolute w-20 h-20 bg-blue-300 rounded-full"
      ></motion.div>
      <div className="flex items-center justify-center h-full">
        <h1 className="text-5xl font-bold text-white">Welcome</h1>
      </div>
    </div>
  );
};

export default Home;
