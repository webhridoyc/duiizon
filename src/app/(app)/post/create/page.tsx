
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Image as ImageIcon, GitBranch, Vote, PawPrint, Search, Calendar, ChevronUp, Loader2 } from "lucide-react";
import { usePosts } from "@/context/post-context";
import { useData } from "@/context/data-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { uploadImage } from "@/lib/storage";
import { Badge } from "@/components/ui/badge";

const attachmentOptions = [
    { icon: ImageIcon, label: "Photo/Video", action: "photo" },
    { icon: GitBranch, label: "Gif", action: "feature" },
    { icon: Vote, label: "Poll", action: "feature" },
    { icon: PawPrint, label: "Adoption", action: "feature" },
    { icon: Search, label: "Lost Notice", action: "feature" },
    { icon: Calendar, label: "Event", action: "feature" },
]

export default function CreatePostPage() {
  const router = useRouter();
  const { addPost } = usePosts();
  const { currentUser } = useData();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePost = async () => {
    if (!content.trim() || !currentUser) return;
    setIsPosting(true);

    let imageUrl: string | undefined = undefined;
    if (imageFile) {
        try {
            imageUrl = await uploadImage(currentUser.id, imageFile, 'posts');
        } catch (error) {
            toast({ title: "Image upload failed", description: "Please try again.", variant: "destructive"});
            setIsPosting(false);
            return;
        }
    }
    
    const newPost = {
        user: currentUser,
        content: content,
        image: imageUrl, 
    };
    addPost(newPost);
    setIsPosting(false);
    router.push("/feed");
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setIsSheetOpen(false);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleAttachmentClick = (action: string) => {
    if (action === "photo") {
        fileInputRef.current?.click();
    } else {
        toast({
            title: "Feature Coming Soon",
            description: "This feature is not yet implemented.",
        });
    }
  }
  
  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const isPostButtonDisabled = content.trim().length === 0 || isPosting;

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <X />
        </Button>
        <h1 className="text-lg font-semibold">Create Post</h1>
        <Button 
            variant={isPostButtonDisabled ? 'ghost' : 'default'} 
            disabled={isPostButtonDisabled}
            onClick={handlePost}
            className={cn("rounded-full px-5 w-24", isPostButtonDisabled && !isPosting && "text-muted-foreground")}
        >
          {isPosting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Post'}
        </Button>
      </header>
      
      <main className="flex-1 flex flex-col p-4 gap-4">
        <div className="flex items-start gap-3">
            <Avatar>
                <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                <AvatarFallback>{currentUser?.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <p className="font-semibold">{currentUser?.name}</p>
            </div>
        </div>
        <Textarea 
            placeholder="What do you want to talk about?"
            className="flex-1 text-base border-0 focus-visible:ring-0 ring-offset-0 p-0 shadow-none resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsSheetOpen(false)}
        />

        {imagePreview && (
          <div className="relative mt-4">
            <Image
              src={imagePreview}
              alt="Selected image preview"
              width={500}
              height={500}
              className="rounded-lg w-full h-auto object-cover"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 rounded-full h-8 w-8"
              onClick={handleRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/jpeg, image/gif"
        />
      </main>

      <footer className="border-t p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
                 {attachmentOptions.slice(0, 4).map(opt => (
                    <Button 
                        key={opt.label}
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground"
                        onClick={() => handleAttachmentClick(opt.action)}
                    >
                        <opt.icon className="h-6 w-6" />
                    </Button>
                 ))}
            </div>
            <div className="flex items-center">
                <Button variant="ghost" size="icon" onClick={() => setIsSheetOpen(!isSheetOpen)}>
                    <ChevronUp className={cn("h-6 w-6 text-muted-foreground transition-transform", isSheetOpen && "rotate-180")}/>
                </Button>
            </div>
          </div>
          {isSheetOpen && (
              <div className="p-2 animate-in slide-in-from-bottom-full duration-300">
                  <div className="grid grid-cols-2 gap-4 mt-2">
                      {attachmentOptions.map(opt => (
                           <Button 
                                key={opt.label}
                                variant="secondary"
                                className="justify-start h-14 rounded-lg p-4"
                                onClick={() => handleAttachmentClick(opt.action)}
                            >
                               <opt.icon className="h-6 w-6 mr-3 text-primary"/>
                               <span className="font-semibold">{opt.label}</span>
                           </Button>
                      ))}
                  </div>
              </div>
          )}
      </footer>
    </div>
  );
}
