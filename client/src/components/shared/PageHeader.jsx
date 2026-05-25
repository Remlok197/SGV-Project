export default function PageHeader({ title, children }) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-base md:text-xl  lg:text-2xl font-black text-primaryText uppercase tracking-wide">
        {title}
      </h1>
      
      {children && (
        <div className="flex">
          {children}
        </div>
      )}
    </div>
  );
}