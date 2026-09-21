export default function PublicLayout({
    children,
}: Readonly<{
    children: React.ReactNode;}>
){
    return <div className="max-w-full">
        {children}
    </div>
}