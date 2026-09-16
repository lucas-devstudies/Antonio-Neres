export default function PrivateLayout({
    children,
}: Readonly<{
    children: React.ReactNode;}>
){
    return (
        <div className="pt-20 px-2">
            <h3>Layout privado</h3>
            {children}
        </div>
    )
}