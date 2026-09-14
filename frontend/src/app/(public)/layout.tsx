export default function PublicLayout({
    children,
}: Readonly<{
    children: React.ReactNode;}>
){
    return <>
        <h3>Layout público</h3>
        {children}
    </>
}