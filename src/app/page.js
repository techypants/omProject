import MathematicalHeroSection from "@/components/PhysicsSection";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MoveRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen  items-center justify-center ">
      <div className="w-full h-screen  absolute z-0 opacity-75">
        <MathematicalHeroSection/>
      </div>
      <div className="space-y-4 w-full lg:w-1/3 p-4 z-100">
        <div className=" font-bold">
          <p className="text-xl text-muted-foreground" >Namaste!</p>
          <p className="text-4xl text-muted-foreground" >This is </p>
          <p className="text-8xl mix-blend-difference ">Math Master </p>

        </div>
        <div className="text-5xl font-semibold opacity-75">
          {/* <span>school level science exhibition program</span> */}
        </div>
        <div className="mt-16 w-full flex gap-2 flex-col ">
          <Link href="/calculate">
            <Button className={cn('w-full text-2xl h-auto flex justify-between pr-8')}>
              <span>Let's calculate</span>
              <span className="stroke-3 " ><MoveRight/></span>
            </Button>
            </Link>

            <Link href="/illustrations">
              <Button 
                variant="outline"
                className={cn('w-full text-sm h-auto flex justify-between pr-8')}>
                <span>Let's understand</span>
                <span className="stroke-3 " ><MoveRight/></span>
              </Button>
            </Link>
        </div>

        <div className="text-center font-semibold bg-muted/50 backdrop-blur-2xl p-8 px-4 rounded-2xl " >
            <p>A project by Om Rajesh Pant from PM shri Kendriya Vidyalaya OFAJ Nagpur</p>
        </div>

      </div>
    </div>
  );
}
