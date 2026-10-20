import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator"
import ThemeSwitcher from "@/components/theme-switcher";

function getSidebarDefaultOpen(){
  if (typeof document === "undefined") {
    return true
  }
  const cookie = document.cookie
  .split('; ')
  .find((item)=> item.startsWith('sidebar_state='))
  
  return cookie ? cookie.split('=')[1] === 'true' : true
}

export default function PrivateLayout({
    children,
}: Readonly<{
    children: React.ReactNode;}>
){
    return <SidebarProvider defaultOpen={getSidebarDefaultOpen()}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 w-full justify-between">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <div className="">
              <ThemeSwitcher/>
            </div>
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
}