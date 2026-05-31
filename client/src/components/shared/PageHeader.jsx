export default function PageHeader({ title, children }) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-base md:text-xl lg:text-2xl font-black text-primaryText uppercase tracking-wide mr-4 md:mr-6 flex-shrink-0">
        {title}
      </h1>
      
      {children && (
        <div className="flex gap-3 flex-1 min-w-0 justify-end">
          {children}
        </div>
      )}
    </div>
  );
}