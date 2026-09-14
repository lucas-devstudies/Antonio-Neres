"use client";

import { useTheme } from "next-themes";
import { Button } from "./ui/button";

export default function ThemeSwitcher(){
    const {setTheme, theme} = useTheme();

    return (
        <Button onClick={()=> setTheme(theme === "dark" ? "light" : "dark")}>Switch Theme</Button>
    );
}