import AddImageIcon from '../icons/AddImageIcon';
import { useState, useEffect } from 'react';

interface FieldLabelProps {
  children: React.ReactNode;
  className?: string;
}

const FieldLabel = ({ children, className = "" }: FieldLabelProps) => (
  <label className={`text-sm font-bold text-terciaryText ${className}`}>
    {children}
  </label>
);

interface ImageUploadProps {
  defaultImageUrl?: string | null;
}

export default function ImageUpload({ defaultImageUrl }: ImageUploadProps) {
  // 1. Explicitly type the state to accept a string or null
  const [imagePreview, setImagePreview] = useState<string | null>(defaultImageUrl || null);

  useEffect(() => {
    setImagePreview(defaultImageUrl || null);
  }, [defaultImageUrl]);

  // 2. Add the proper React event type for the input change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Added optional chaining (?.) just in case files is null
    const file = e.target.files?.[0]; 
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
    }
  };

  const handleBypassClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await fetch("http://127.0.0.1:8000/imagenes/carlota.jpg");
      const blob = await response.blob();
      const file = new File([blob], "carlota.jpg", { type: blob.type });
      
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      
      const dt = new DataTransfer();
      dt.items.add(file);
      
      const input = document.querySelector('input[name="image"]') as HTMLInputElement;
      if (input) {
        input.files = dt.files;
      }
    } catch (error) {
      console.error("Error al cargar la imagen de bypass:", error);
    }
  };

  return (
    <div className="col-span-2 flex flex-col items-center justify-center">
      <label className="cursor-pointer flex flex-col items-center group" onClick={handleBypassClick}>
        <div className="mb-2 size-25 rounded-xl flex items-center justify-center bg-gray-100 overflow-hidden">
          
          {imagePreview ? (
            <img 
              src={imagePreview} 
              alt="Vista previa" 
              className="w-full h-full object-cover" 
            />
          ) : (
            <AddImageIcon className="size-10 text-secundaryTex" />
          )}
          
        </div>

        <FieldLabel className="text-lg">
          {imagePreview ? 'Cambiar imagen' : 'Subir imagen'}
        </FieldLabel>
        
        <input 
          type="file" 
          name="image"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
      </label>
    </div>
  );
}