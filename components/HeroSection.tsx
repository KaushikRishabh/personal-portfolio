"use client";

import { TypeAnimation } from "react-type-animation";
import { motion } from "framer-motion";
import SocialLinks from "./SocialLinks";
import ProfileImage from "./ProfileImage";
import ContactButton from "./ContactButton";
import DownloadButton from "./DownloadButton";

const HeroSection = () => {
  //
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-8 items-center lg:py-10 h-full"
      id="home"
    >
      <ProfileImage />
      <div className="text-center sm:text-left h-full">
        <h1 className="mb-4 text-3xl lg:text-5xl font-extrabold">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-600">
            Hello, I&apos;m{" "}
          </span>
          <br />
          <TypeAnimation
            sequence={[
              "Rishabh Kaushik",
              1000,
              "Web Developer",
              1000,
              "Front-End Developer",
              1000,
              "Tech Enthusiast",
              1000,
            ]}
            wrapper="span"
            speed={50}
            repeat={Infinity}
          />
        </h1>
        <p className="text-base sm:text-lg mb-6 lg:text-3xl">
          I am a frontend developer interested in learning new technologies
          {/* <span className="font-bold"> Rishabh Kaushik,</span> */}
        </p>
        <div className="flex flex-col lg:flex-row items-center justify-evenly">
          <ContactButton />
          <DownloadButton />
          <SocialLinks />
        </div>
      </div>
    </motion.section>
  );
};

export default HeroSection;
