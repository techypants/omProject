'use client'
import { useState, useEffect, useRef } from "react";
import NumbersCard from "@/components/NumbersCard";
import { getRandomNumber } from "../../lib/randomNumber";
// import "./calculate.css";

export default function CalculatePage() {
    const [numbersArray, setNumbersArray] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const slidesRef = useRef([]);

    useEffect(() => {
        // Generate numbers on client side only to avoid hydration mismatch
        const numbers = Array.from({ length: 10 }).map(() => {
            const num1 = getRandomNumber(1, 100);
            const num2 = getRandomNumber(1, 100);
            const num3 = getRandomNumber(1, 100);

            return {
                num1,
                num2,
                // num3,
                sum: num1 + num2,
            };
        });
        
        setNumbersArray(numbers);
        setIsLoaded(true);
    }, []);

    const scrollToSlide = (index) => {
        console.log('scrolling to slide index', index);
        if (slidesRef.current[index]) {
            slidesRef.current[index].scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
        }
    };

    // Show loading state during initial render to prevent hydration mismatch
    if (!isLoaded) {
        return (
            <div className="w-screen h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="text-lg text-gray-600">Preparing your math problems...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Fixed progress indicator */}
            <div className="fixed top-4 right-4 z-50 bg-white rounded-full shadow-lg p-2">
                <div className="text-sm font-medium text-gray-600">
                    Question {Math.min(10, 1)} of {numbersArray.length}
                </div>
            </div>

            {/* Smooth scrolling container */}
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen scroll-container">
                {numbersArray.map((numbers, index) => (
                    <div
                        key={index}
                        className="snap-start"
                        ref={(el) => (slidesRef.current[index] = el)}
                    >
                        <NumbersCard 
                            numbers={numbers}
                            slideIndex={index}
                            scrollToSlide={scrollToSlide}
                            onComplete={(isCorrect) => {
                                console.log(`Question ${index + 1}: ${isCorrect ? 'Correct' : 'Incorrect'}`);
                            }}
                        />
                    </div>
                ))}
                
                {/* Completion message */}
                <div 
                    className="w-screen h-screen flex items-center justify-center"
                    ref={(el) => (slidesRef.current[numbersArray.length] = el)}
                >
                    <div className="text-center space-y-4 p-8 bg-white rounded-lg shadow-xl">
                        <h2 className="text-4xl font-bold text-green-600">🎉 Congratulations!</h2>
                        <p className="text-xl text-gray-600">You've completed all the math problems!</p>
                        <button
                            onClick={() => scrollToSlide(0)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
                        >
                            Start Over
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}