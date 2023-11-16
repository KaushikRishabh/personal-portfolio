"use client";

import Image from "next/image";
import { Tab, Tabs } from "@nextui-org/react";
import { TAB_DATA } from "@/lib/data";
import SectionTitle from "./SectionTitle";

const AboutSection = () => {
  return (
    <section
      className="flex flex-col sm:grid grid-cols-5 gap-4 lg:gap-8 items-center justify-center py-20 px-2 w-full"
      id="about"
    >
      <SectionTitle title="About Me" />
      <div className="col-span-2 flex items-center justify-center w-36 h-36 self-center sm:self-start lg:w-fit lg:h-fit justify-self-center">
        <Image
          src={"/about-image.png"}
          alt="About Image"
          priority
          width={200}
          height={200}
          className="w-auto h-auto rounded-md self-center"
        />
      </div>
      <div className="h-full col-span-3">
        <p className="text-base">
          <span className="text-bold">
            I have curiosity and endless passion for new technologies.{" "}
          </span>
          Effective communication and collaboration are key to my success. My
          experience with various projects has honed my skills in working
          seamlessly with front-end and back-end developers, enhancing the
          development process. I excel in managing schedules and creating
          systematic plans, focusing on clear communication and defined roles.
          This approach has earned me recognition for consistently achieving
          high project completion rates.
        </p>

        <div className="flex flex-col justify-start mt-8">
          <Tabs variant="light" aria-label="Dynamic tabs" items={[...TAB_DATA]}>
            {(item) => (
              <Tab key={item.id} title={item.title}>
                <ul className="list-disc pl-2">
                  {item.content.map((content) => (
                    <li key={content}>{content}</li>
                  ))}
                </ul>
              </Tab>
            )}
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
