"use client";

import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};
function useIsMounted() {
    return useSyncExternalStore(
        emptySubscribe, () => true, () => false 
    );
}

export default function ThemeSwitcher() {
  const mounted = useIsMounted();
  const { setTheme, theme } = useTheme();

  if (!mounted) {
    return (
      <Button className="w-1/3 rounded-full border-input" variant="outline" disabled />
    );
  }
    return (
        <Button className="w-1/3 rounded-full border-input" variant={'outline'} onClick={()=> setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:-rotate-0 dark:scale-100"></Sun>
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0"></Moon>
        </Button>
    );
}