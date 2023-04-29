/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useState, useEffect, type SetStateAction } from "react";
// import { api } from "~/utils/api";
import { env } from "../../env.mjs";
import Typewriter from "typewriter-effect";
import { Configuration, OpenAIApi } from "openai";
import {
  UserCircleIcon,
  BookOpenIcon,
  SparklesIcon,
  DocumentDownloadIcon,
  RefreshIcon,
  ViewGridAddIcon,
} from "@heroicons/react/solid";
const configuration = new Configuration({
  apiKey: env.NEXT_PUBLIC_OPENAI_API,
});
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
delete configuration.baseOptions.headers["User-Agent"];

const openai = new OpenAIApi(configuration);

// type Roles = "user" | "assistant" | "system";
export default function Chat(_props: { translate: boolean }) {
  const { data: session } = useSession();
  const [choice, setChoice] = useState("");
  const [history, setHistory] = useState([] as string[][]);
  const [turn, setTurn] = useState("10");
  const [gameTurns, setGameTurns] = useState(0);
  const [temp, setTemp] = useState("0");
  const [tokens, setTokens] = useState("256");
  const [freq, setFreq] = useState("0");
  const [top_p, setTop_P] = useState("1");
  const [story, setStory] = useState("");

  //OpenAI integration
  // const [roles, setRoles] = useState<Roles>("user");
  const [submit, setSubmit] = useState(false);

  const promptSelector = () => {
    if (gameTurns + 1 == parseInt(turn)) {
      return (
        "\nPrevious turn:" +
        history.slice(-2)?.[0]?.[1] +
        "\n Previous turn:" +
        history.slice(-2)?.[1]?.[1] +
        "It is the final turn. Please end the game with a conclusion depending on the player's actions."
      );
    } else {
      return history.length >= 2
        ? // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
          "You are an adventure game app." +
            "\nCreate a small summary of what happened titled 'EVENTS:' with options for what to do next titled 'A.' 'B.' 'C.' 'D.'" +
            "\n Previous turn:" +
            history.slice(-2)?.[0]?.[1] +
            "\n Previous turn:" +
            history.slice(-2)?.[1]?.[1] +
            "\n New turn:" +
            choice +
            "\n Next event with options:"
        : // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
          "You are an adventure game app." +
            "You have to start the adventure" +
            "\nCreate a small summary of what happened titled 'EVENTS:' and then create options for what to do with A. B. C. D." +
            "\n Story prompt:" +
            story +
            "\n Next event with options:";
    }
  };

  //request openai from api endpoint
  useEffect(() => {
    async function fetchData() {
      if (submit && choice) {
        const context = promptSelector();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        history.push([
          session?.user?.name || "Guest",
          choice,
          gameTurns.toString(),
        ]);
        const completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: context }],
          temperature: parseInt(temp),
          max_tokens: parseInt(tokens),
          top_p: parseInt(top_p),
          frequency_penalty: parseInt(freq),
          presence_penalty: 0,
        });

        history.push(
          [
            "AdventureGPT",
            completion?.data?.choices[0]?.message?.content || "",
            (gameTurns + 1).toString(),
          ] // and one new item at the end
        );
        setGameTurns(gameTurns + 1);
      }
    }
    void fetchData();
    setSubmit(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submit]);

  const setButtonSubmission = (text: string) => {
    setStory(text);
    setChoice(text);
    setSubmit(!submit);
  };

  const chatSelector = (msg: string) => {
    if (msg == session?.user?.name) {
      return (
        <Image
          src={(session && session.user.image) || ""}
          alt="avatar"
          className="mr-4 h-8 w-8 rounded-full"
          height={500}
          width={500}
        />
      );
    } else if (msg == "Guest") {
      return (
        <UserCircleIcon className="mr-2 inline h-8 w-8 rounded-full text-gray-800 dark:text-gray-400 sm:mb-1" />
      );
    } else {
      return (
        <>
          <Image
            src="/images/logo.svg"
            className="svgfill-gpt mb-0.5   mr-2 hidden h-8 w-8 dark:inline sm:mb-0 sm:mt-0.5"
            alt="ChatGPT"
            height={500}
            width={500}
          />
          <Image
            src="/images/logo.svg"
            className="mb-0.5 mr-2   inline h-8 w-8 dark:hidden sm:mb-0 sm:mt-0.5"
            alt="ChatGPT"
            height={500}
            width={500}
          />
        </>
      );
    }
  };

  const handleTempChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setTemp(event.target.value);
  };

  const handleTurnChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setTurn(event.target.value);
  };

  const handleTokenChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setTokens(event.target.value);
  };

  const handleFreqChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setFreq(event.target.value);
  };
  const handlePChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setTop_P(event.target.value);
  };

  const choiceSelectionHandler = (choice: string) => {
    if (
      history[history.length - 1]?.[0] !== "Guest" &&
      history[history.length - 1]?.[0] !== session?.user.name
    ) {
      setChoice(choice);
      setSubmit(!submit);
    }
  };

  const parseResponse = (msg: string[] | number[]) => {
    const message = history.slice(-1)?.[0]?.[1] || "";
    return (
      <div className="grid grid-cols-4 gap-3 py-2">
        <div className="col-span-4">
          <Typewriter
            options={{
              loop: false,
              delay: 20,
              cursor: "",
              autoStart: true,
            }}
            onInit={(typewriter) =>
              typewriter
                .typeString(
                  message.substring(
                    message.indexOf("EVENTS.") + 8,
                    message.indexOf("A.")
                  )
                )
                .start()
            }
          />
        </div>
        <button
          onClick={() => {
            choiceSelectionHandler(
              message.substring(
                message.indexOf("A.") + 2,
                message.indexOf("B.")
              )
            );
          }}
          id="A"
          disabled={msg[2] !== gameTurns.toString()}
          className="flex flex-col rounded-lg bg-gray-200 p-4 duration-150 hover:scale-[1.02] hover:bg-gptLightest dark:bg-gray-700 dark:hover:bg-gptDarker"
        >
          <p className="flex flex-row pb-2 text-2xl font-semibold">A.</p>
          <p className="text-left text-base">
            <Typewriter
              options={{
                loop: false,
                delay: 20,
                cursor: "",
                autoStart: true,
              }}
              onInit={(typewriter) =>
                typewriter
                  .typeString(
                    message.substring(
                      message.indexOf("A.") + 2,
                      message.indexOf("B.")
                    )
                  )
                  .start()
              }
            />
          </p>
        </button>
        <button
          onClick={() => {
            choiceSelectionHandler(
              message.substring(
                message.indexOf("B.") + 2,
                message.indexOf("C.")
              )
            );
          }}
          id="B"
          disabled={msg[2] !== gameTurns.toString()}
          className="flex flex-col rounded-lg bg-gray-200 p-4 duration-150 hover:scale-[1.02] hover:bg-gptLightest dark:bg-gray-700 dark:hover:bg-gptDarker"
        >
          <p className="flex flex-row pb-2 text-2xl font-semibold">B.</p>
          <p className="text-left text-base">
            <Typewriter
              options={{
                loop: false,
                delay: 20,
                cursor: "",
                autoStart: true,
              }}
              onInit={(typewriter) =>
                typewriter
                  .typeString(
                    message.substring(
                      message.indexOf("B.") + 2,
                      message.indexOf("C.")
                    )
                  )
                  .start()
              }
            />
          </p>
        </button>
        <button
          onClick={() => {
            choiceSelectionHandler(
              message.substring(
                message.indexOf("C.") + 2,
                message.indexOf("D.")
              )
            );
          }}
          id="C"
          disabled={msg[2] !== gameTurns.toString()}
          className="flex flex-col rounded-lg bg-gray-200 p-4 duration-150 hover:scale-[1.02] hover:bg-gptLightest dark:bg-gray-700 dark:hover:bg-gptDarker"
        >
          <p className="flex flex-row pb-2 text-2xl font-semibold">C.</p>
          <p className="text-left text-base">
            <Typewriter
              options={{
                loop: false,
                delay: 20,
                cursor: "",
                autoStart: true,
              }}
              onInit={(typewriter) =>
                typewriter
                  .typeString(
                    message.substring(
                      message.indexOf("C.") + 2,
                      message.indexOf("D.")
                    )
                  )
                  .start()
              }
            />
          </p>
        </button>
        <button
          id="D"
          disabled={msg[2] !== gameTurns.toString()}
          onClick={() => {
            choiceSelectionHandler(
              message.substring(message.indexOf("D.") + 2)
            );
          }}
          className="flex flex-col rounded-lg bg-gray-200 p-4 duration-150 hover:scale-[1.02] hover:bg-gptLightest dark:bg-gray-700 dark:hover:bg-gptDarker"
        >
          <p className="flex flex-row pb-2 text-2xl font-semibold">D.</p>
          <p className="text-left text-base">
            <Typewriter
              options={{
                loop: false,
                delay: 20,
                cursor: "",
                autoStart: true,
              }}
              onInit={(typewriter) =>
                typewriter
                  .typeString(message.substring(message.indexOf("D.") + 2))
                  .start()
              }
            />
          </p>
        </button>
      </div>
    );
  };

  const clearHandler = () => {
    setHistory([]);
    setStory("");
    setChoice("");
    setGameTurns(0);
  };

  function downloadHistory(filename: string, text: string | number | boolean) {
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(text)
    );
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  const chatRenderer = () => {
    if (history[0] && gameTurns !== parseInt(turn)) {
      return history.map((msg, i) => (
        <>
          <div
            key={i}
            className="mb-3 flex flex-col rounded-lg bg-white p-2 px-4 shadow-md  duration-150 dark:bg-gray-800 "
          >
            <div className="flex items-center">
              {chatSelector(msg[0] || "")}
              <p className="font-semibold text-gray-700 duration-150 dark:text-gray-200">
                {msg[0]}:
              </p>
              {msg[0] !== "Guest" && msg[0] !== session?.user.name && (
                <div className="ml-auto pr-4">
                  Turn <span className="font-semibold">{msg[2]}</span> of {turn}
                </div>
              )}
            </div>

            <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 md:text-base">
              {msg[0] == "AdventureGPT" ? parseResponse(msg) : msg[1]}
            </div>
          </div>
        </>
      ));
    } else if (history[0] && gameTurns == parseInt(turn)) {
      return history.slice(0, -1).map((msg, i) => (
        <>
          <div
            key={i}
            className="mb-3 flex flex-col rounded-lg bg-white p-2 px-4 shadow-md  duration-150 dark:bg-gray-800 "
          >
            <div className="flex items-center">
              {chatSelector(msg[0] || "")}
              <p className="font-semibold text-gray-700 duration-150 dark:text-gray-200">
                {msg[0]}:
              </p>
              {msg[0] !== "Guest" && msg[0] !== session?.user.name && (
                <div className="ml-auto pr-4">
                  Turn <span className="font-semibold">{msg[2]}</span> of {turn}
                </div>
              )}
            </div>

            <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
              {msg[0] == "AdventureGPT" ? parseResponse(msg) : msg[1]}
            </div>
          </div>
        </>
      ));
    } else {
      return (
        <div className="grid h-full grid-cols-3 gap-3 pb-3">
          <p className="col-span-3 text-center text-sm font-semibold uppercase">
            Some ideas to get you started
          </p>
          <button
            onClick={() =>
              setButtonSubmission(
                "A master thief discovers a way to steal from alternate universes, but soon realizes there are unintended consequences."
              )
            }
            className="rounded-lg bg-gray-50 p-2 shadow-md shadow-gpt/50 duration-150 hover:scale-[1.02] hover:bg-gptLightest dark:bg-gray-700 dark:shadow-gptDarker/50 hover:dark:bg-gptDarker"
          >
            A master thief discovers a way to steal from alternate universes,
            but soon realizes there are unintended consequences.
          </button>
          <button
            onClick={() =>
              setButtonSubmission(
                "A haunted microwave possesses the food in it, turning the food into its minions. Pulling the plug doesn't turn it off."
              )
            }
            className="rounded-lg bg-gray-50 p-2 shadow-md shadow-gpt/50 duration-150 hover:scale-[1.02] hover:bg-gptLightest dark:bg-gray-700 hover:dark:bg-gptDarker"
          >
            A haunted microwave possesses the food in it, turning the food into
            its minions. Pulling the plug {"doesn't"} turn it off.
          </button>
          <button
            onClick={() =>
              setButtonSubmission(
                "A salvage crew searches for lost treasures in the depths of the ocean, but discovers a graveyard of ships that have been swallowed by the sea."
              )
            }
            className="rounded-lg bg-gray-50 p-2 shadow-md shadow-gpt/50 duration-150 hover:scale-[1.02] hover:bg-gptLightest dark:bg-gray-700 hover:dark:bg-gptDarker"
          >
            A salvage crew discovers a graveyard of ships that have been
            swallowed by the sea, along with a forbidden treasure.
          </button>
          <button
            onClick={() =>
              setButtonSubmission(
                "Explorers decipher clues of ancient civilization on distant planet, but warning of impending threat looms."
              )
            }
            className="rounded-lg bg-gray-50 p-2 shadow-md shadow-gpt/50 duration-150 hover:scale-[1.02] hover:bg-gptLightest dark:bg-gray-700 hover:dark:bg-gptDarker"
          >
            Explorers decipher clues of ancient civilization on a distant
            planet, but they warn of an impending threat.
          </button>
          <button
            onClick={() =>
              setButtonSubmission(
                "A biologist discovers a novel fungus, but has to prevent the world from turning it into a bioweapon."
              )
            }
            className="rounded-lg bg-gray-50 p-2 shadow-md shadow-gpt/50 duration-150 hover:scale-[1.02] hover:bg-gptLightest dark:bg-gray-700 hover:dark:bg-gptDarker"
          >
            A biologist discovers a novel fungus, but has to prevent the world
            from turning it into a bioweapon.
          </button>
          <button
            onClick={() =>
              setButtonSubmission(
                "Your latest AI creation has developed a personality and is communicating with you in ways you never expected."
              )
            }
            className="rounded-lg bg-gray-50 p-2 shadow-md shadow-gpt/50 duration-150 hover:scale-[1.02] hover:bg-gptLightest dark:bg-gray-700 hover:dark:bg-gptDarker"
          >
            Your latest AI creation has developed a personality and is
            communicating with you in ways you never expected.
          </button>
        </div>
      );
    }
  };

  return (
    <div className="grid grid-cols-12">
      <section
        className={
          _props.translate
            ? "hidden"
            : "scrollbar relative z-10 col-span-4 flex min-h-[calc(100vh-3.6rem)] flex-col justify-between overflow-x-hidden overflow-y-scroll border-r border-gray-600 bg-gray-100 dark:bg-gray-900"
        }
      >
        <div className="z-5 pattern-opacity-70 pattern-dots absolute h-[100vh] w-[100vw] duration-150 pattern-bg-gray-100 pattern-gray-300 pattern-size-2 dark:pattern-gray-800 dark:pattern-bg-gray-900"></div>
        <div className="relative z-10 flex flex-col p-2">
          <p className="text-3xl font-extrabold">CREATE YOUR OWN ADVENTURE</p>
          <div className="flex text-xl font-semibold">
            <span>
              <BookOpenIcon className=" mr-2 inline h-6 w-6 text-gptDark dark:text-gpt" />
              I want to...{" "}
            </span>
            <span className="inline text-gpt">
              <Typewriter
                options={{
                  strings: [
                    "fight a dragon",
                    "explore the moon",
                    "find some treasure",
                    "survive a dungeon",
                    "save the world",
                  ],
                  loop: true,
                  delay: 20,
                  cursor: "",
                  autoStart: true,
                }}
              />
            </span>
          </div>
          <p className="mt-4 text-lg font-semibold">Technical Stuff</p>
          <div>
            <div className="flex flex-row ">
              <div className="">Temperature</div>
              <div className="ml-auto pr-4">{temp}</div>
            </div>
            <p className="text-xs italic text-gray-500 dark:text-gray-400">
              Controls the level of creativity in responses.
            </p>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={temp}
              onChange={(e) => handleTempChange(e)}
              disabled={history.length !== 0 || false}
              className="slider w-full accent-gptDark duration-150 dark:bg-gray-800 dark:accent-gptLight"
            />
          </div>
          <div>
            <div className="flex flex-row ">
              <div className="">Max Tokens</div>
              <div className="ml-auto pr-4">{tokens}</div>
            </div>
            <p className="text-xs italic text-gray-500 dark:text-gray-400">
              1 token ≈ 4 characters in English
            </p>
            <input
              type="range"
              min="0"
              max="1000"
              step="10"
              value={tokens}
              onChange={(e) => handleTokenChange(e)}
              disabled={history.length !== 0 || false}
              className="slider w-full accent-gptDark duration-150 dark:accent-gptLight"
            />
          </div>
          <div>
            <div className="flex flex-row ">
              <div className="">Frequency Penalty</div>
              <div className="ml-auto pr-4">{freq}</div>
            </div>
            <p className="text-xs italic text-gray-500 dark:text-gray-400">
              Controls the level of repetition in responses.
            </p>
            <input
              type="range"
              min="0"
              max="2"
              step="0.01"
              value={freq}
              onChange={(e) => handleFreqChange(e)}
              disabled={history.length !== 0 || false}
              className="slider w-full accent-gptDark duration-150 dark:accent-gptLight"
            />
          </div>

          <div>
            <div className="flex flex-row ">
              <div className="">Top P</div>
              <div className="ml-auto pr-4">{top_p}</div>
            </div>
            <p className="text-xs italic text-gray-500 dark:text-gray-400">
              Controls the randomness of the response.
            </p>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={top_p}
              onChange={(e) => handlePChange(e)}
              disabled={history.length !== 0 || false}
              className="slider w-full accent-gptDark duration-150 dark:accent-gptLight"
            />
          </div>
          <p className="mt-4 text-lg font-semibold">Story Details</p>

          <div className="flex flex-col">
            <div className="flex flex-row">
              <div className="">ChatGPT Prompt</div>
              <div className="ml-auto pr-4">{story.length}/200</div>
            </div>
            <p className="text-xs italic text-gray-500 dark:text-gray-400">
              Hint: Include details about the number of characters, setting,
              plot events, lore
            </p>
            <input
              type="text"
              placeholder="Type your story..."
              className="w-full rounded-lg border  border-gray-400 bg-gray-200 py-1 px-4 text-gray-900 duration-150 focus:outline-none  focus:ring-2 focus:ring-gpt dark:border-gray-700 dark:bg-gray-600 dark:text-gray-200"
              value={story}
              onChange={(e) => setStory(e.target.value)}
              disabled={history.length !== 0 || false}
              maxLength={200}
            />
          </div>
          <div>
            <div className="mt-2 flex flex-row">
              <div className="">Turns</div>
              <div className="ml-auto pr-4">{turn}</div>
            </div>
            <p className="text-xs italic text-gray-500 dark:text-gray-400">
              Determines how many turns your story will span.
            </p>
            <input
              type="range"
              min="2"
              max="20"
              step="1"
              className="slider w-full accent-gptDark duration-150 dark:accent-gptLight"
              value={turn}
              onChange={(e) => handleTurnChange(e)}
              disabled={history.length !== 0 || false}
            />
          </div>
          <button
            onClick={() => setButtonSubmission(story)}
            disabled={history.length !== 0 || false}
            className="mt-4 w-full items-center rounded-lg bg-gptLight py-2 px-2 font-semibold text-gray-900 duration-150 ease-in-out hover:bg-gpt hover:text-blue-100 dark:bg-gpt dark:hover:bg-gptDark "
          >
            <SparklesIcon className=" mr-2 inline h-6 w-6" />
            CREATE MY STORY
          </button>
        </div>
      </section>
      <section
        className={
          _props.translate
            ? "relative z-10 col-span-12 flex min-h-[calc(100vh-3.6rem)] flex-col justify-between overflow-hidden"
            : "relative z-10 col-span-8 flex min-h-[calc(100vh-3.6rem)] flex-col justify-between overflow-hidden"
        }
      >
        <div className="relative flex h-full min-h-[calc(100vh-3.6rem)] flex-col ">
          <div className="relative z-10 flex items-center border-b border-b-gray-600 bg-gray-100 px-2 py-2 duration-150 dark:bg-gray-900  ">
            <p className="flex select-none items-center text-lg font-semibold text-gray-800 duration-150 dark:text-white">
              <ViewGridAddIcon className="mr-2 h-6 w-6 text-gray-600 dark:text-gray-400" />{" "}
              Use{" "}
              <span className="mx-[0.38rem] text-gptDarker dark:text-gpt">
                {" "}
                AdventureGPT{" "}
              </span>{" "}
              to Make Your Story
            </p>
            <div className="ml-auto flex items-center">
              <div className=" text-lg">
                Turn: <span className="text-lg font-semibold">{gameTurns}</span>
              </div>
              <button
                className="ml-4 flex items-center rounded-lg bg-gptLight px-2 py-1 text-gray-900 duration-75 hover:bg-gpt dark:bg-gpt dark:hover:bg-gptDark"
                onClick={() => clearHandler()}
              >
                <RefreshIcon className="inline h-6 w-6 lg:mr-1" />

                <span className="hidden font-semibold lg:inline">Restart</span>
              </button>
            </div>
          </div>

          <div className="scrollbar flex h-[10rem] grow flex-col-reverse overflow-y-scroll bg-gray-300 bg-opacity-10 p-4 pb-1 shadow-inner dark:bg-gray-900 dark:bg-opacity-20">
            <div className=" relative z-10 flex flex-col">
              {chatRenderer()}{" "}
              {parseInt(turn) == gameTurns && history[0] && (
                <>
                  <div className="mb-3 flex h-full w-full flex-col items-center justify-center rounded-lg bg-white p-4 shadow-lg dark:bg-gray-700 ">
                    <p className="text-4xl font-extrabold">FINAL RESULT</p>
                    <div className="flex flex-row items-center">
                      <div className="font-semibold text-gptDark dark:text-gpt">
                        Turns: {turn}
                      </div>
                    </div>
                    <div className="mt-4 rounded-lg bg-gray-200 p-2 shadow-inner dark:bg-gray-800">
                      {history[history.length - 1]?.[1]}
                    </div>
                  </div>
                </>
              )}{" "}
            </div>
          </div>
          <div className="relative z-10 flex w-full flex-row items-center border-t border-gray-600 bg-gray-50 p-4 py-3 duration-150 dark:bg-gray-800">
            <button
              onClick={() => downloadHistory("story.txt", history.toString())}
              className="flex h-full flex-row items-center rounded-lg bg-gptLight py-1 px-2 font-semibold text-gray-900 duration-150 ease-in-out hover:bg-gpt dark:bg-gpt dark:hover:bg-gptDark "
            >
              <DocumentDownloadIcon className=" mr-2 inline h-6 w-6" />
              <span className="block whitespace-nowrap">Download Story</span>
            </button>
            <div className="bg-pattern-gray-600 ml-3 flex h-full w-full items-center rounded-lg border border-gray-400 bg-gray-200 py-1 px-2 text-sm duration-150 pattern-bg-gray-200 pattern-gray-400 pattern-opacity-20 dark:border-gray-600 dark:bg-gray-600 dark:pattern-gray-600 dark:pattern-bg-gray-900">
              Your Story: {story}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
