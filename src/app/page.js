import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MoveRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center ">
      <div className="space-y-4 w-full lg:w-1/3 p-4">
        <div className="text-6xl font-bold">
          <span>Hello!</span>
        </div>
        <div className="text-5xl font-semibold opacity-75">
          <span>This is Om's project for school level science exhibition program</span>
        </div>
        <div className="mt-16 w-full bg-amber-300">
          <Link href="/calculate">
            <Button className={cn('w-full text-2xl h-auto flex justify-between pr-8')}>
              <span>Let's calculate</span>
              <span className="stroke-3 " ><MoveRight/></span>
            </Button>
            </Link>
        </div>
      </div>
    </div>
  );
}
