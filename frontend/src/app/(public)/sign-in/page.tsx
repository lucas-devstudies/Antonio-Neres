import Image from "next/image";
import FormLogin from "./FormLogin";

export default function SignIn(){
    return <div className="flex flex-row min-w-screen max-h-full">
        <div className="hidden md:flex flex-col w-full bg-secondary h-screen items-center justify-center">
            <Image className="h-auto w-auto" width={36} height={36} src="/assets/logo_branca.png" alt="Logo"/>
            <h2 className="text-lg font-bold text-white">Método AN</h2>
            <p className="text-white/60">Construindo Conhecimento Mutuamente</p>
        </div>
        <div className="flex flex-col w-full h-screen items-center justify-center px-10">
            <h2 className="text-lg font-bold">Acesse sua Conta</h2>
            <p className="text-foreground/60 mb-10">Acesse para poder visualizar as inscrições do alunos</p>
            <FormLogin></FormLogin>
        </div>
    </div>
}