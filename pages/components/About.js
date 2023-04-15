import { FaReact, FaNodeJs, FaHtml5, FaCss3Alt } from "react-icons/fa";

const About = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-6">
      <h2 className="text-4xl font-bold">About Me</h2>
      <p className="text-center">
        I am a senior React developer with 7 years of experience. I specialize
        in building modern web applications and have expertise in the following
        technologies:
      </p>
      <div className="flex items-center justify-center space-x-4">
        <FaReact className="text-5xl text-blue-500" />
        <FaNodeJs className="text-5xl text-green-500" />
        <FaHtml5 className="text-5xl text-red-500" />
        <FaCss3Alt className="text-5xl text-blue-400" />
      </div>
    </div>
  );
};

export default About;
