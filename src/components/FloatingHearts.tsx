 import { useEffect, useState } from "react";
 
 const FloatingHearts = () => {
   const [hearts, setHearts] = useState<Array<{ id: number; left: number; delay: number; size: number }>>([]);
 
   useEffect(() => {
     const newHearts = Array.from({ length: 15 }, (_, i) => ({
       id: i,
       left: Math.random() * 100,
       delay: Math.random() * 6,
       size: 12 + Math.random() * 16,
     }));
     setHearts(newHearts);
   }, []);
 
   return (
     <div className="floating-hearts">
       {hearts.map((heart) => (
         <span
           key={heart.id}
           className="heart-float text-rose-light"
           style={{
             left: `${heart.left}%`,
             fontSize: `${heart.size}px`,
             animationDelay: `${heart.delay}s`,
           }}
         >
           💗
         </span>
       ))}
     </div>
   );
 };
 
 export default FloatingHearts;