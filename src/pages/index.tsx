/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { type NextPage } from "next";
import { useState } from "react";
// import { api } from "~/utils/api";
import { ChatIcon } from "@heroicons/react/solid";
import Navbar from "./components/navbar";
import Chat from "./components/chat";

const Home: NextPage = () => {
  const [pattern, setPattern] = useState("cross");
  const [translate, setTranslate] = useState(false);
  const [font, setFont] = useState("font-clash");

  const patternBG = () => {
    if (pattern === "cross") {
      setPattern("dots");
    } else if (pattern === "dots") {
      setPattern("paper");
    } else {
      setPattern("cross");
    }
  };

  function patternStyles() {
    const defaultPattern =
      "z-5 absolute h-full w-full pattern-gray-400 dark:pattern-gray-600 pattern-bg-gray-200 dark:pattern-bg-gray-900 pattern-opacity-20 duration-150";
    if (pattern === "cross") {
      return defaultPattern + " pattern-cross pattern-size-8";
    } else if (pattern === "dots") {
      return defaultPattern + " pattern-dots pattern-size-6";
    } else {
      return defaultPattern + " pattern-paper pattern-size-6";
    }
  }

  const menuHandler = () => {
    setTranslate(!translate);
  };

  const fontInitializer = () => {
    if (font === "font-clash") {
      setFont("font-satoshi");
    } else if (font === "font-satoshi") {
      // setFont("font-azeret");
      setFont("font-azeret");
    } else if (font === "font-azeret") {
      setFont("font-general");
    } else {
      setFont("font-clash");
    }
  };

  return (
    <main className="relative overflow-hidden">
      <div className={font}>
        <Navbar
          pattern={pattern}
          patternBG={patternBG}
          menuHandler={menuHandler}
          fontInitializer={fontInitializer}
        />

        <div className="min-h-[calc(100vh-3.6rem)] overflow-hidden bg-gradient-to-b  from-gray-100 to-gray-200 duration-150 dark:from-gray-800 dark:to-gray-900 sm:max-h-[calc(100vh-3.6rem)] ">
          <div className={patternStyles()}></div>
          <Chat translate={translate} />
        </div>
      </div>
    </main>
  );
};

export default Home;
