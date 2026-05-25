import AddIcon from "./AddIcon";

export default function AddGridCard({ onClick, text = "Añadir nuevo producto" }) {
  return (
    <button onClick={onClick}
            
    className="
            
            flex flex-col items-center justify-center 
                       gap-2.5 max-w-64 lg:min-h-[115px] 
                       border-2 border-dashed border-primaryAction/60 
                       rounded-lg transition-colors cursor-pointer p-3 lg:p-4
                       transition-all duration-200 ease-in-out active:scale-95 active:opacity-80"
    >
      <AddIcon className="text-sm lg:text-2xl"/>
      
      <span className="font-medium text-sm lg:text-base text-center leading-tight whitespace-pre-line">
        {text}
      </span>
    </button>
  );
}