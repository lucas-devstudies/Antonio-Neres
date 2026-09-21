export default function PublicLayout({
    children,
}: Readonly<{
    children: React.ReactNode;}>
){
    return <div className="p-0 m-0 min-h-full max-w-full w-screen overflow-hidden">
        {children}
    </div>
}