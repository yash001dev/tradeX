import Image from "next/image";
import { Inter } from "next/font/google";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
   useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    } else{
      router.push('/auth/signin');
    }
  }, [status]);


  return (
    <div className="flex items-center justify-center h-screen">
    <LoadingSpinner/>
    </div>
  );
}
