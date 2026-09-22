
import fs from 'fs';
import path from 'path';
import Image from "next/image";
import { Marquee } from "./ui/marquee";

const assetsDirectory = path.join(process.cwd(), 'public/assets/schools');
const files = fs.readdirSync(assetsDirectory);
const listUniversities = files
    .filter((file) => /\.(png|jpe?g|svg|webp)$/i.test(file))
    .map((file) => ({
        img: `/assets/schools/${file}`,
        name: file.replace(/\.[^/.]+$/, ""), // Remove a extensão para usar de nome/alt
    }));

export default function InfiniteSlider(){
  return (
    <Marquee className="w-full [--duration:20s]">
      {listUniversities.map((item, index) => (
        <Image 
          key={index} 
          width={48} 
          height={48} 
          src={item.img} // Usa o caminho '/assets/logo.png' sem a palavra 'public'
          alt={item.name}
          className="object-contain shrink-0"
        />
      ))}
    </Marquee>
  )
}