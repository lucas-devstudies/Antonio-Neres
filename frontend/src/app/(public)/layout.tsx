export default function PublicLayout({
    children,
}: Readonly<{
    children: React.ReactNode;}>
){
    return <div className="max-w-[1920px]">
        {children}
    </div>
}