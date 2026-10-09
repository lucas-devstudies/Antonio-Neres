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
      <Button className="w-[10] h-[10] rounded-full border-input" variant="outline" disabled />
    );
  }
    return (
        <Button className="h-10 w-10  rounded-full border-input p-0" variant={'outline'} onClick={()=> setTheme(theme === "dark" ? "light" : "dark")}>
            <Sun className="h-10 w-10 rotate-90 scale-0 transition-all dark:-rotate-0 dark:scale-100"></Sun>
            <Moon className="absolute h-10 w-10 rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0"></Moon>
        </Button>
    );
}