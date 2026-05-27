import PageHeader from "../components/shared/PageHeader";
import { Input } from "@/components/ui/input"
export default function VentasPage() {
    return (
        <div className="p-4">
            <PageHeader title={"Configuracion"}></PageHeader>
                <Input className="" placeholder="Enter text" />
        </div>
    );
}