export default function CategoryDivider({
  categoryName, 
  itemCount, 
  leftLineClassName = "w-4 md:w-[5.5rem]", 
  titleClassName = "text-xl md:text-2xl",
  countClassName = "text-base md:text-lg"
}) {
  return (
    <div className="flex items-center w-full">
        <div className={`border-t-[2px] border-secundaryText/50 ${leftLineClassName}`} />

        <div className="px-1 whitespace-nowrap ">
            <span className={`font-bold text-primaryAction ${titleClassName}`}>
                {categoryName}
            </span>
            <span className={`text-secundaryText font-normal ${countClassName}`}>
                ({itemCount} elementos)
            </span>
        </div>

      <div className="border-t-[2px] border-secundaryText/50 flex-1" />
    </div>
  );
}