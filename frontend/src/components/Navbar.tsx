//retirar depois de consertar
'use client'
import { Button} from "./ui/button";
import Logo from "./logo";

export default function Navbar() {
    return (
        <nav className="flex flex-row w-full justify-between fixed top-0 left-0 p-4 items-center bg-white dark:bg-black border-b border-b-black/20 dark:border-b-white/20 border-b-2">
            <Logo/>
            <Button variant='outline_primary'>Método AN</Button>
        </nav>
    )
}