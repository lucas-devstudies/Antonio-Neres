import Navbar from "@/components/Navbar";
import ThemeSwitcher from "@/components/theme-switcher";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardAction, CardDescription, CardTitle } from "@/components/ui/card";
import { cn } from "cn";
import Image from "next/image";
import Link from "next/link";

interface Cards{
  img:string;
  alt:string;
  title:string;
  description:string;
}

export default function Home() {

  const listCards:Cards[]= [
    {img:"/assets/aprovados.svg",alt:"imagem de um papel",title:"+1000 aprovados",description:"Centenas de alunos já conquistaram sua vaga na universidade com a nossa metodologia"},
    {img:"/assets/historia.svg",alt:"imagem de um chapéu",title:"+20 anos de história",description:"Mais de duas décadas preparando estudantes para os principais vestibulares"},
    {img:"/assets/am.svg",alt:"imagem de um papel",title:"Foco no Amazonas",description:"Conteúdo e estratégia pensados para os vestibulares do Amazonas"},
    {img:"/assets/metodologia.svg",alt:"imagem de um papel",title:"Metodologia focada",description:"Estude exatamente o que mais cai no vestibular, sem perder tempo"},
  ]
  
  return (
    <div className="flex flex-col h-dvh min-w-full">
      <Navbar></Navbar>
      <main className="flex flex-col h-auto w-full mt-24 px-2 items-center bg-white dark:bg-black sm:items-start">
        <div className="w-full flex md:flex-row flex-col-reverse gap-2 min-h-8/12 sm:min-h-8/12 sm:h-10/12">
          <div className="w-full flex md:mt-3 mt-0 flex-col md:h-full h-auto justify-between">
            <div className="h-auto sm:h-full flex justify-center items-center">
              <div>
                <h2 className=" md:text-left text-center text-primary text-xl font-bold uppercase">Centro Educacional Antonio Neres</h2>
                <p className="mt-2 font-light text-xl text-foreground/90">
                  Preparamos estudantes para os vestibuladores em nível nacional e estadual. Honrando tudo o que estabelecemos ao nosso alcance, sempre estimulando o melhor de nossos colaboradores, demonstrando ao longo de nossa história, que os nosso alunos podem alcançar os seus <span className="text-primary font-bold">sonhos</span>.
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-primary font-bold text-lg md:text-xl">Prepare-se para o vestibular com quem aprova há mais de 20 anos</h3>
              <div className="flex max-w-full flex-row mt-4 gap-2">
                <Link className={cn(buttonVariants({variant:"default"}),' px-4 rounded-full')} href={'/register'}>Fazer parte</Link>
                <Link className={cn(buttonVariants({variant:"outline_primary"}),' px-4 rounded-full')} href={'/register'}>Saber mais</Link>
              </div>
            </div>
          </div>
          <div className="w-full min-h-auto h-full">
            <iframe className="w-full h-full" src="https://www.youtube.com/embed/hlghnx83qYs?si=ynyb0E4sscHRSjVY" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"/>
          </div>
        </div>
        <div className="w-full grid gap-4 mt-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          {listCards.map((item)=>
            <Card key={item.title} className="items-center p-4 h-3/2 justify-center rounded-md border-input">
              <CardAction className="flex w-full items-center justify-center">
                <Image className="flex" width={48} height={48} alt={item.alt} src={item.img}></Image>
              </CardAction>
              <CardTitle className="font-bold text-lg">
                {item.title}
              </CardTitle>
              <CardDescription>
                {item.description}
              </CardDescription>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
