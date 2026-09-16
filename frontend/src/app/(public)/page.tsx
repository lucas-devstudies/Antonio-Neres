import Navbar from "@/components/Navbar";
import ThemeSwitcher from "@/components/theme-switcher";

export default function Home() {
  return (
    <div className="flex flex-col min-h-full min-w-full dark:bg-black">
      <Navbar></Navbar>
      <main className="flex w-full flex-col h-dvh max-w-3xl items-center bg-white dark:bg-black sm:items-start">
        <p>aoba</p>
        <ThemeSwitcher/>
      </main>
    </div>
  );
}
