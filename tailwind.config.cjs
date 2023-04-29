/** @type {import('tailwindcss').Config} */
// import 'tailwindcss-bg-patterns';

const config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        hanken: ["Hanken Grotesk", "Inter"],
        general: ["General Sans", "Inter"],
        azeret: ["Azeret Mono", "Inter"],
        clash: ["Clash Grotesk", "Inter"],
        satoshi: ["Satoshi", "Inter"],
      },
      colors: {
        gpt: "#00a8e8",
        gptLight: "#27c3ff",
        gptLighter: "#26c1fb",
        gptLightest: "#59d1ff",
        gptDark: "#0099d3",
        gptDarker: "#0094cc",
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  plugins: [require("tailwindcss-bg-patterns")],
};

module.exports = config;
