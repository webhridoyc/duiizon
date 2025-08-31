
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X, Type, Sticker, Music, Film, Layers, Repeat, BarChart, Settings2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useData } from "@/context/data-context";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const storyTools = [
    { icon: Settings2, title: "Story Tools", description: "Customize your story with a range of creative tools including filters, stickers, and text options." },
    { icon: Film, title: "Add Photos and Videos", description: "Select your favorite photos and videos to make your story unique and engaging." },
    { icon: Layers, title: "Interactive Elements", description: "Enhance your story with elements like polls, questions, and quizzes to engage your audience." },
    { icon: BarChart, title: "Story Insights", description: "Track how your audience interacts with your stories with real-time insights and analytics." }
];

export default function CreateStoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { addStory } = useData();
  const [isPosting, setIsPosting] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings.',
          });
        }
      } else {
         setHasCameraPermission(false);
      }
    };
    getCameraPermission();

    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [toast]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setCapturedImage(dataUrl);
      }
    }
  };

  const handlePostStory = async () => {
    if (!capturedImage) return;
    setIsPosting(true);
    try {
      await addStory(capturedImage);
      toast({
        title: "Story Posted!",
        description: "Your story is now live for 24 hours.",
      });
      router.push("/feed");
    } catch (error) {
       toast({
        title: "Error",
        description: "Failed to post story. Please try again.",
        variant: "destructive"
      });
    } finally {
        setIsPosting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <div className="relative flex-1">
        {hasCameraPermission === null && <div className="absolute inset-0 bg-black flex items-center justify-center"><p>Loading camera...</p></div>}
        
        {capturedImage ? (
             <Image src={capturedImage} alt="Captured image" fill className="object-cover" />
        ) : (
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
        )}
        <canvas ref={canvasRef} className="hidden" />

        <header className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-20 bg-gradient-to-b from-black/50 to-transparent">
          <Button variant="ghost" size="icon" className="rounded-full bg-black/30 hover:bg-black/50" onClick={() => capturedImage ? setCapturedImage(null) : router.back()}>
            {capturedImage ? <X /> : <ArrowLeft />}
          </Button>
          
          {!capturedImage && <Button variant="ghost" className="rounded-full bg-black/30 hover:bg-black/50">New Story</Button>}
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full bg-black/30 hover:bg-black/50"><Type /></Button>
            <Button variant="ghost" size="icon" className="rounded-full bg-black/30 hover:bg-black/50"><Sticker /></Button>
            <Button variant="ghost" size="icon" className="rounded-full bg-black/30 hover:bg-black/50"><Music /></Button>
          </div>
        </header>

        {hasCameraPermission === false && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-8">
                 <Alert variant="destructive">
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                        To create a story, please allow camera access in your browser's settings.
                    </AlertDescription>
                </Alert>
            </div>
        )}
      </div>

      <footer className="p-6 flex flex-col items-center justify-end z-10 bg-gradient-to-t from-black/50 to-transparent">
        {capturedImage ? (
             <Button className="w-full h-14 text-lg font-bold rounded-full bg-blue-600 hover:bg-blue-700" onClick={handlePostStory} disabled={isPosting}>
                {isPosting ? 'Posting...' : 'Post Story'}
            </Button>
        ) : (
            <>
                <div className="w-20 h-20 rounded-full bg-white/30 flex items-center justify-center mb-6" onClick={handleCapture}>
                    <div className="w-16 h-16 rounded-full bg-white" />
                </div>
                <div className="flex justify-around w-full max-w-sm text-sm font-medium">
                    <button className="text-white/70">Gallery</button>
                    <button className="text-white font-bold">Camera</button>
                    <button className="text-white/70">Templates</button>
                </div>
            </>
        )}
      </footer>

       {/* Welcome Sheet */}
      {showWelcome && (
        <div className="absolute inset-0 z-30 flex items-end" onClick={() => setShowWelcome(false)}>
            <div className="absolute inset-0 bg-black/60 animate-in fade-in-0" />
            <Card className="relative z-10 w-full rounded-t-3xl border-0 animate-in slide-in-from-bottom-full duration-500" onClick={(e) => e.stopPropagation()}>
                <CardContent className="p-8">
                    <div className="w-10 h-1.5 rounded-full bg-muted mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-center mb-6">Welcome to Your First Story Creation</h2>
                    <div className="space-y-6">
                        {storyTools.map(tool => (
                            <div key={tool.title} className="flex items-start gap-4">
                                <div className="p-2 bg-blue-100 rounded-full">
                                    <tool.icon className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">{tool.title}</h3>
                                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button className="w-full mt-8 h-12 text-lg font-bold rounded-full bg-blue-600 hover:bg-blue-700" onClick={() => setShowWelcome(false)}>
                        Got it
                    </Button>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
}
