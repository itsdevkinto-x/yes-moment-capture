import { useMemo } from "react";
import { getDecorationById, DecorationType } from "@/lib/themes";

interface FloatingDecorationsProps {
  decorationType: DecorationType;
  customImageUrl?: string | null;
}

const FloatingDecorations = ({ decorationType, customImageUrl }: FloatingDecorationsProps) => {
  const decoration = getDecorationById(decorationType);
  
  const items = useMemo(() => {
    const count = 15;
    const elements = [];
    
    for (let i = 0; i < count; i++) {
      const isCustomImage = decorationType === "custom" && customImageUrl;
      const symbol = isCustomImage 
        ? null 
        : decoration.symbols[Math.floor(Math.random() * decoration.symbols.length)];
      
      elements.push({
        id: i,
        symbol,
        isImage: isCustomImage,
        imageUrl: customImageUrl,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 6,
        duration: 4 + Math.random() * 4,
        size: 16 + Math.random() * 20,
      });
    }
    
    return elements;
  }, [decorationType, customImageUrl, decoration.symbols]);

  return (
    <div className="floating-hearts">
      {items.map((item) => (
        <div
          key={item.id}
          className="heart-float"
          style={{
            left: item.left,
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.duration}s`,
            fontSize: `${item.size}px`,
          }}
        >
          {item.isImage ? (
            <img
              src={item.imageUrl!}
              alt=""
              style={{
                width: `${item.size}px`,
                height: `${item.size}px`,
                objectFit: "contain",
              }}
            />
          ) : (
            item.symbol
          )}
        </div>
      ))}
    </div>
  );
};

export default FloatingDecorations;
