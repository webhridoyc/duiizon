
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Clapperboard } from "lucide-react";
import { useData } from "@/context/data-context";

export function CreatePost() {
  const router = useRouter();
  const { toggleCreateMenu } = useData();

  const handleNavigate = (path: string) => {
    toggleCreateMenu(false);
    router.push(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
      <div
        className="fixed inset-0"
        onClick={() => toggleCreateMenu(false)}
        aria-hidden="true"
      />
      <div className="relative z-10 w-full max-w-md mb-24 pb-4 animate-in slide-in-from-bottom-full duration-300 pointer-events-auto">
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1.5 rounded-full bg-muted" />
        </div>
        <div className="flex justify-around gap-4">
          <Button
            variant="secondary"
            className="h-auto py-4 flex flex-col items-center justify-center gap-2 text-center w-32 rounded-xl shadow-lg"
            onClick={() => handleNavigate("/story/create")}
          >
            <Clapperboard className="h-8 w-8 text-primary" />
            <p className="font-semibold text-foreground">Story</p>
          </Button>
          <Button
            variant="secondary"
            className="h-auto py-4 flex flex-col items-center justify-center gap-2 text-center w-32 rounded-xl shadow-lg"
            onClick={() => handleNavigate("/post/create")}
          >
            <ImageIcon className="h-8 w-8 text-primary" />
            <p className="font-semibold text-foreground">Post</p>
          </Button>
        </div>
      </div>
    </div>
  );
}
