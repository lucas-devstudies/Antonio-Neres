export default function PrivateLayout({
    children,
}: Readonly<{
    children: React.ReactNode;}>
){
    return (
        <>
            <h3>Layout privado</h3>
            {children}
        </>
    )
}