"use client";

import { TypeAnimation } from "react-type-animation";
import { motion } from "framer-motion";
import SocialLinks from "./SocialLinks";
import ProfileImage from "./ProfileImage";
import ContactButton from "./ContactButton";
import DownloadButton from "./DownloadButton";
import { useEffect, useState } from "react";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

const HeroSection = () => {
  const [visitorCount, setVisitorCount] = useState(0);

  useEffect(() => {
    fetch("/api/visitorcount")
      .then((response) => response.json())
      .then((data) => {
        if (data.count) {
          setVisitorCount(data.count);
          console.log("vis count", data.count);
        }
      })
      .catch((error) => console.error("Error fetching visitor count:", error));

    // Check if this is a unique visit
    const isUniqueVisit = !localStorage.getItem("visited");
    if (isUniqueVisit) {
      // Increment the visitor count
      fetch("/api/visitor", { method: "GET" })
        .then(() => {
          // Mark this visitor as counted
          localStorage.setItem("visited", "true");
        })
        .catch((error) =>
          console.error("Error incrementing visitor count:", error)
        );
    }
  }, []);

  // const db = getFirestore(app);
  const [data, setData]: any = useState([]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     const querySnapshot = await getDocs(collection(db, "visitors"));
  //     console.log("querySnapshot", querySnapshot);
  //     const dataList = querySnapshot.docs.map((doc) => doc.data());
  //     console.log("dataList", dataList);
  //     setData(dataList);
  //   };

  //   fetchData();
  // }, []);
  ////
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-8 items-center lg:py-10 h-full"
      id="home"
    >
      <div>Visitor Count: {visitorCount}</div>
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
