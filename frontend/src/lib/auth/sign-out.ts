import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";

export function useSignOut() {
  
  const router = useRouter();

  const signOut = async () => {
    const { error } = await authClient.signOut();
    if (error) {
      console.error("Erro ao sair:", error);
      return;
    }
    router.replace("/sign-in");
    router.refresh();
  };

  return { signOut };
}