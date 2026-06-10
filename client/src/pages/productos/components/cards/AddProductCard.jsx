import AddIcon from "../icons/AddIcon";

export default function AddProductCard({ onClick, text = "Añadir nuevo producto", className = "" }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full h-full
                  gap-2.5 max-w-64 min-h-[115px] 
                  border-2 border-dashed border-primaryAction/60 
                  rounded-lg transition-colors cursor-pointer p-2 md:p-2.5
                  transition-all duration-200 ease-in-out active:scale-95 active:opacity-80 
                  ${className}`} 
    >
      <AddIcon className="text-sm lg:text-2xl"/>
      
      <span className="font-medium text-sm lg:text-base text-center leading-tight whitespace-pre-line">
        {text}
      </span>
    </button>
  );
}