//retirar depois de consertar
'use client'
import { Button} from "./ui/button";
import Logo from "./logo";
import ThemeSwitcher from "./theme-switcher";

export default function Navbar() {
    return (
        <nav className="flex flex-row w-full justify-between fixed top-0 left-0 p-4 items-center bg-white dark:bg-black border-b-black/20 dark:border-b-white/20 border-b-2">
            <div className="flex gap-2">
                <Logo/>
                <h2 className="text-secondary font-bold sm:flex hidden">Prev Antonio Neres</h2>
            </div>
            <div className="flex gap-2">
                <ThemeSwitcher/>
                <Button variant='outline_primary'>Método AN</Button>
            </div>
        </nav>
    )
}