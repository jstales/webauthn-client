import ThemeToggle from "./ThemeToggle";

export default function Header({ onThemeToggle }) {
  return (
    <header className="flex justify-between p-5 items-center">
      <div className="text-5xl font-extrabold">
        <span className="bg-clip-text text-transparent bg-gradient-to-r dark:from-cyan-500 dark:to-blue-500 from-cyan-900 to-blue-900">
          Web Authentication Demo
        </span>
      </div>
      <ThemeToggle onToggle={onThemeToggle} />
    </header>
  );
}
