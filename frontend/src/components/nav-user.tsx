"use client"

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useSignOut } from "@/lib/auth/sign-out"
import { User } from "@/models/user"
import { getUser } from "@/services/user"
import { ChevronsUpDownIcon } from "lucide-react"
import { useEffect, useState } from "react"

export function NavUser() {
  const { isMobile } = useSidebar()
  const { signOut } = useSignOut()
  const [user,setUser] = useState<User | null>(null)

  useEffect(() => {
    let active = true

    async function fetchUser() {
      try {
        const response = await getUser()
        if (active) setUser(response)
      } catch (error) {
        console.error("Erro ao buscar usuário:", error)
      }
    }

    void fetchUser()

    return () => {
      active = false
    }
  }, [])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-aut w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">{user?.name.charAt(0)+''+(user?.name.charAt(1)) || ''}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.name || ''}</span>
                <span className="truncate text-xs">{user?.email || ''}</span>
              </div>
              <ChevronsUpDownIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-fit"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuItem onClick={signOut}>
              Sair da conta
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
