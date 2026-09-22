import InfiniteSlider from "@/components/infiniteSlider";
import Navbar from "@/components/Navbar";
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
    <div className="flex flex-col min-h-screen w-full bg-white dark:bg-black">
      <Navbar />
      <main className="flex-1 w-full h-auto max-w-screen pt-28 pb-12 flex flex-col gap-12 items-center sm:items-start">
        <section className="w-full px-4  flex md:flex-row flex-col-reverse gap-6 items-center">
          <div className="w-full flex flex-col justify-between gap-6">
            <div>
              <h2 className="md:text-left text-center text-primary text-xl font-bold uppercase">
                Centro Educacional Antonio Neres
              </h2>
              <p className="mt-2 font-light text-xl text-foreground/90">
                Preparamos estudantes para os vestibuladores em nível nacional e estadual. Honrando tudo o que estabelecemos ao nosso alcance, sempre estimulando o melhor de nossos colaboradores, demonstrando ao longo de nossa história, que os nosso alunos podem alcançar os seus <span className="text-primary font-bold">sonhos</span>.
              </p>
            </div>
            <div>
              <h3 className="text-primary font-bold text-lg md:text-xl">
                Prepare-se para o vestibular com quem aprova há mais de 20 anos
              </h3>
              <div className="flex max-w-full flex-row mt-4 gap-2">
                <Link className={cn(buttonVariants({variant:"default"}),' px-4 rounded-full')} href={'/register'}>Fazer parte</Link>
                <Link className={cn(buttonVariants({variant:"outline_primary"}),' px-4 rounded-full')} href={'/register'}>Saber mais</Link>
              </div>
            </div>
          </div>
          <div className="w-full aspect-video rounded-xl overflow-hidden shadow-lg">
            <iframe 
              className="w-full h-full" 
              src="https://www.youtube.com/embed/hlghnx83qYs?si=ynyb0E4sscHRSjVY" 
              title="YouTube video player" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            />
          </div>
        </section>
        <section className="w-full px-4  grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          {listCards.map((item) => (
            <Card key={item.title} className="p-4 flex flex-col items-center justify-center rounded-md border-input drop-shadow-sm drop-shadow-green-500">
              <CardAction className="flex w-full items-center justify-center">
                <Image className="flex" width={48} height={48} alt={item.alt} src={item.img} />
              </CardAction>
              <CardTitle className="font-bold text-lg">{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </Card>
          ))}
        </section>
        <section className="max-h-fit w-full py-2 m-0 bg-white border-y-4 border-primary">
          <InfiniteSlider />
        </section>
        <section className="w-full px-4 flex md:flex-row flex-col gap-6 items-center">
          <div className="w-full aspect-video rounded-xl overflow-hidden">
            <Image width={200} height={200} className="w-full h-full" alt="Foto de turma completa" src='/assets/bg.png'/>
          </div>
           <div className="w-full flex flex-col justify-between gap-6">
            <div>
              <h2 className="md:text-left text-center text-primary text-xl font-bold uppercase">
                Método AN
              </h2>
              <p className="mt-2 text-lg text-foreground/80 text-justify">
                Estamos preparados para lhe ajudar a aprender Língua Portuguesa &amp; Matemática, sendo você o principal agente desse processo, somos o Método AN.  Temos uma plataforma que contém toda teoria do que o estudante precisa para realizar as questões, sendo que temos uma interação diretamente por nossa plataforma.               
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
