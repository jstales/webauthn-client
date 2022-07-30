import { useState } from "react";
import { ReactComponent as DarkIcon } from "../assets/dark.svg";
import { ReactComponent as LightIcon } from "../assets/light.svg";

export default function ThemeToggle({ theme = "Dark", onToggle }) {
  const [mode, setMode] = useState(theme);

  return (
    <div className="flex gap-2">
      <LightIcon className="dark:text-slate-100 dark:opacity-25 fill-blue-500 text-blue-500 dark:fill-transparent w-8 h-8" />
      <label
        htmlFor="theme-toggle"
        className="inline-flex relative items-center cursor-pointer"
      >
        <input
          type="checkbox"
          id="theme-toggle"
          className="sr-only peer"
          checked={mode === "Dark"}
          onChange={() => {
            let newMode = mode === "Dark" ? "Light" : "Dark";
            setMode(newMode);
            console.log(newMode);
            onToggle(newMode);
          }}
        />
        <div className="w-14 h-9 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-[2px] peer-checked:after:left-[-2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300 sr-only">
          {mode}
        </span>
      </label>
      <DarkIcon className="dark:fill-yellow-500 opacity-25 dark:opacity-100 w-8 h-8" />
    </div>
  );
}
