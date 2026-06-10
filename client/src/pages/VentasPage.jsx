import PageHeader from "../components/shared/PageHeader";

export default function VentasPage() {
    return (
        <div className="h-full flex flex-col pt-6 overflow-hidden">
            <div className="px-6 md:px-10 lg:px-11 flex-shrink-0">
                <PageHeader title={"Ventas"} />
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 md:px-10 lg:px-11 mt-6 pb-12">
                <p>Lorem ipsum.</p>
            </div>
        </div>
    );
}