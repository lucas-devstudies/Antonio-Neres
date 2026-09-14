import ThemeSwitcher from "@/components/theme-switcher";

export default function Home() {
  return (
    <div className="flex justify-center items-center min-h-full min-w-full dark:bg-black">
      <main className="flex w-full h-dvh max-w-3xl flex-col items-center justify-between bg-white dark:bg-black sm:items-start">
        <p>aoba</p>
        <ThemeSwitcher/>
      </main>
    </div>
  );
}
