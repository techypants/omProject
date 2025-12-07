"use client"
import { useEffect, useRef, useState } from "react";
import { 
  Plus, 
  Minus, 
  X, 
  Divide, 
  Parentheses, 
  Cuboid, 
  DecimalsArrowRight, 
  DecimalsArrowLeft, 
  Pi, 
  Tally5, 
  DraftingCompass, 
  Omega, 
  Box 
} from "lucide-react";

import { useElementSize } from "@/hooks/useElementSize";

// Mathematical symbols array using Lucide React icons
const mathematicalSymbols = [
  { icon: Plus, color: "#3B82F6" },          // Blue
  { icon: Minus, color: "#EF4444" },         // Red
  { icon: X, color: "#10B981" },             // Green
  { icon: Divide, color: "#F59E0B" },        // Amber
  { icon: Pi, color: "#8B5CF6" },            // Purple
  { icon: Omega, color: "#EC4899" },         // Pink
  { icon: Parentheses, color: "#06B6D4" },   // Cyan
  { icon: Cuboid, color: "#84CC16" },        // Lime
  { icon: DecimalsArrowRight, color: "#F97316" }, // Orange
  { icon: DecimalsArrowLeft, color: "#14B8A6" },  // Teal
  { icon: Tally5, color: "#A855F7" },        // Violet
  { icon: DraftingCompass, color: "#22D3EE" }, // Light Blue
  { icon: Box, color: "#65A30D" }            // Dark Lime
];

export default function MathematicalHeroSection({ 
  numberOfEquations = 12, 
  centralAttraction = 0.05, 
  orbitalVelocity = 5, 
  horizontalForce = 2, 
  verticalForce = 1
}) {
  const containerRef = useRef(null);
  const [equations, setEquations] = useState([]);
  const { width, height } = useElementSize(containerRef);
  
  useEffect(() => {
    if (!width || !height) return;
    
    // Initialize mathematical symbols with orbital positions and velocities
    const centerX = width / 2;
    const centerY = height / 2;
    const initialEquations = Array.from({ length: numberOfEquations }, (_, index) => {
      // Distribute symbols in concentric mathematical rings
      const theta = (index / numberOfEquations) * 2 * Math.PI;
      const orbitalRadius = 100 + (index % 3) * 60; // Multiple mathematical orbital levels
      const x = centerX + Math.cos(theta) * orbitalRadius;
      const y = centerY + Math.sin(theta) * orbitalRadius;
      
      // Initial tangential velocity for mathematical orbital motion
      const tangentialSpeed = orbitalVelocity;
      const velocityX = -Math.sin(theta) * tangentialSpeed;
      const velocityY = Math.cos(theta) * tangentialSpeed;
      
      return {
        id: index,
        x: x,
        y: y,
        velocityX: velocityX,
        velocityY: velocityY,
        iconSize: 32,
        rotationAngle: Math.random() * 360,
        angularVelocity: (Math.random() - 0.5) * 5,
        symbol: mathematicalSymbols[index % mathematicalSymbols.length],
      };
    });
    
    setEquations(initialEquations);
    
    // Mathematical physics simulation loop
    const animationInterval = setInterval(() => {
      setEquations(previousEquations => {
        const centerX = width / 2;
        const centerY = height / 2;
        
        return previousEquations.map(equation => {
          // Calculate vector displacement to mathematical center
          const deltaX = centerX - equation.x;
          const deltaY = centerY - equation.y;
          const distanceToCenter = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
          
          // Apply central gravitational attraction for mathematical orbital dynamics
          let forceX = horizontalForce;
          let forceY = verticalForce;

          if (distanceToCenter > 0) {
            forceX = (deltaX / distanceToCenter) * centralAttraction;
            forceY = (deltaY / distanceToCenter) * centralAttraction;
          }
          
          // Apply mathematical forces to velocity components
          let newVelocityX = equation.velocityX + forceX;
          let newVelocityY = equation.velocityY + forceY;
          
          // Enhanced mathematical collision detection and repulsion
          previousEquations.forEach(otherEquation => {
            if (equation.id !== otherEquation.id) {
              const deltaX = otherEquation.x - equation.x;
              const deltaY = otherEquation.y - equation.y;
              const separation = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
              const minSeparation = equation.iconSize * 1.2; // Mathematical spacing buffer
              
              if (separation < minSeparation && separation > 0) {
                // Mathematical repulsion force to prevent symbol overlap
                const repulsionMagnitude = (minSeparation - separation) * 1;
                const repulsionAngle = Math.atan2(deltaY, deltaX);
                
                // Apply repulsive force components
                const repulsionX = -Math.cos(repulsionAngle) * repulsionMagnitude;
                const repulsionY = -Math.sin(repulsionAngle) * repulsionMagnitude;
                
                newVelocityX += repulsionX;
                newVelocityY += repulsionY;
                
                // Add tangential mathematical flow for orbital preservation
                const tangentialX = -Math.sin(repulsionAngle) * repulsionMagnitude * 0.3;
                const tangentialY = Math.cos(repulsionAngle) * repulsionMagnitude * 0.3;
                
                newVelocityX += tangentialX;
                newVelocityY += tangentialY;
              }
            }
          });
          
          // Update mathematical position coordinates
          let newX = equation.x + newVelocityX;
          let newY = equation.y + newVelocityY;
          let newRotationAngle = equation.rotationAngle + equation.angularVelocity;
          
          // Boundary reflection with mathematical orbital preservation
          const boundaryPadding = equation.iconSize / 2 + 10;
          if (newX < boundaryPadding || newX > width - boundaryPadding) {
            newVelocityX = -newVelocityX * 0.9;
            newX = newX < boundaryPadding ? boundaryPadding : width - boundaryPadding;
            // Add mathematical turbulence to maintain orbital dynamics
            newVelocityY += (Math.random() - 0.5) * 2;
          }
          
          if (newY < boundaryPadding || newY > height - boundaryPadding) {
            newVelocityY = -newVelocityY * 0.9;
            newY = newY < boundaryPadding ? boundaryPadding : height - boundaryPadding;
            // Add mathematical turbulence to maintain orbital dynamics
            newVelocityX += (Math.random() - 0.5) * 2;
          }
          
          // Velocity magnitude limiting to prevent mathematical chaos
          const maxVelocity = 8;
          const currentVelocity = Math.sqrt(newVelocityX * newVelocityX + newVelocityY * newVelocityY);
          if (currentVelocity > maxVelocity) {
            newVelocityX = (newVelocityX / currentVelocity) * maxVelocity;
            newVelocityY = (newVelocityY / currentVelocity) * maxVelocity;
          }
          
          // Minimal mathematical damping to preserve orbital energy
          newVelocityX *= 0.999;
          newVelocityY *= 0.999;
          
          return {
            ...equation,
            x: newX,
            y: newY,
            velocityX: newVelocityX,
            velocityY: newVelocityY,
            rotationAngle: newRotationAngle
          };
        });
      });
    }, 16); // 60fps mathematical simulation
    
    return () => clearInterval(animationInterval);
  }, [width, height, numberOfEquations, centralAttraction, orbitalVelocity]);
  
  return (
    <div 
      ref={containerRef} 
      className="relative h-full w-full flex  flex-col items-center justify-center overflow-clip "
    >
      {/* Mathematical symbols with physics simulation */}
      {equations.map((equation) => {
        const IconComponent = equation.symbol.icon;
        return (
          <div
            key={equation.id}
            className="absolute z-10 pointer-events-none"
            style={{
              left: `${equation.x}px`,
              top: `${equation.y}px`,
              transform: `translate(-50%, -50%) rotate(${equation.rotationAngle / 2}deg)`,
              transition: "none", // Disable transition for smooth mathematical physics
            }}
          >
            <IconComponent
              size={equation.iconSize}
              color={equation.symbol.color}
              className=" drop-shadow-lg"
              strokeWidth={2.5}
            />
          </div>
        );
      })}
    </div>
  );
}