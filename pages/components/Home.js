import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import BackgroundAnimation from "./BackgroundAnimation";

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
    // <div className="relative h-screen bg-gradient-to-r from-blue-500 to-green-500">
    <div className="relative h-screen bg-gradient-to-r from-gray-800 via-indigo-900 to-gray-900">
      {/* <motion.div
        animate={{
          x: mousePosition.x - 50,
          y: mousePosition.y - 50,
        }}
        className="absolute w-20 h-20 bg-blue-300 rounded-full"
      ></motion.div> */}
      {/* <BackgroundAnimation /> */}
      <div className="flex items-center justify-center h-full">
        <h1 className="text-5xl font-bold text-white">Welcome</h1>
      </div>
    </div>
  );
};

export default Home;
