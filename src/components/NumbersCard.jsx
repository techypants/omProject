'use client'
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Send, CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function NumbersCard({ numbers, onComplete, slideIndex, scrollToSlide }) {
    const { num1, num2, num3, sum } = numbers;
    const [inputAnswer, setInputAnswer] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const cardRef = useRef(null);

    useEffect(() => {
        // Only run on client side
        if (typeof window === 'undefined') return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            {
                threshold: 0.5,
                rootMargin: '-10% 0px'
            }
        );

        if (cardRef.current) {
            observer.observe(cardRef.current);
        }

        return () => {
            if (cardRef.current) {
                observer.unobserve(cardRef.current);
            }
        };
    }, []);

    function handleSubmit() {
        const userAnswer = Number(inputAnswer);
        const correct = userAnswer === sum;
        setIsCorrect(correct);
        setShowResult(true);
        
        if (onComplete) {
            onComplete(correct);
        }

        // If answer is correct, start countdown and scroll to next slide
        if (correct && scrollToSlide && typeof slideIndex === 'number') {
            // Start countdown from 3
            setCountdown(3);
            
            const countdownInterval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(countdownInterval);
                        scrollToSlide(slideIndex + 1);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
    }

    function handleReset() {
        setInputAnswer('');
        setShowResult(false);
        setIsCorrect(false);
        setCountdown(0);
    }

    function handleKeyPress(e) {
        if (e.key === 'Enter' && inputAnswer.trim() !== '') {
            handleSubmit();
        }
    }

    return (
        <div className="w-screen h-screen flex items-center justify-center p-4">
            <Card 
                ref={cardRef}
                className={cn(
                    'min-w-[40%] min-h-[40%] transition-all duration-700 ease-out transform',
                    isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95',
                    showResult && isCorrect && 'ring-4 ring-green-400 shadow-lg shadow-green-200',
                    showResult && !isCorrect && 'ring-4 ring-red-400 shadow-lg shadow-red-200'
                )}
            >
                <CardHeader>
                    <CardTitle className="text-center text-2xl">
                        {showResult ? (
                            <div className={cn(
                                'flex items-center justify-center gap-2 transition-all duration-500',
                                isCorrect ? 'text-green-600' : 'text-red-600'
                            )}>
                                {isCorrect ? <CheckCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                                {isCorrect ? 'Correct!' : 'Try Again!'}
                            </div>
                        ) : (
                            "Add the numbers"
                        )}
                    </CardTitle>
                </CardHeader>
                
                <CardContent className="w-auto h-full flex flex-col items-center justify-center space-y-6">
                    <div className="text-8xl flex flex-col items-end font-semibold space-y-2">
                        <span className={cn(
                            'transition-all duration-500 delay-100',
                            isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                        )}>
                            {num1}
                        </span>
                        <span className={cn(
                            'transition-all duration-500 delay-300',
                            isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                        )}>
                            + {num2}
                        </span>
                        <div className={cn(
                            'w-full h-1 bg-gray-300 transition-all duration-500 delay-500',
                            isVisible ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
                        )}></div>
                    </div>

                    {showResult && (
                        <div className={cn(
                            'bg-white rounded-lg p-4 border-2 transition-all duration-500 transform',
                            'animate-in slide-in-from-bottom-4 fade-in',
                            isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                        )}>
                            <div className="text-center space-y-2">
                                <div className="text-sm text-gray-600">Your answer:</div>
                                <div className={cn(
                                    'text-2xl font-bold',
                                    isCorrect ? 'text-green-600' : 'text-red-600'
                                )}>
                                    {inputAnswer}
                                </div>
                                <div className="text-sm text-gray-600">Correct answer:</div>
                                <div className="text-2xl font-bold text-green-600">{sum}</div>
                                
                                {/* Countdown for auto-scroll when correct */}
                                {isCorrect && countdown > 0 && (
                                    <div className="mt-4 p-2 bg-blue-50 rounded-lg border border-blue-200">
                                        <div className="text-sm text-blue-600">Next question in:</div>
                                        <div className="text-3xl font-bold text-blue-600">{countdown}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>

                <CardFooter>
                    <div className="flex items-center justify-center w-full gap-4">
                        {!showResult ? (
                            <>
                                <Input 
                                    value={inputAnswer}
                                    onChange={(e) => setInputAnswer(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="text-2xl py-6 text-center"
                                    placeholder="Your answer"
                                    type="number"
                                    autoFocus={isVisible}
                                />
                                <Button
                                    onClick={handleSubmit}
                                    disabled={inputAnswer.trim() === ''}
                                    className="py-6 px-6"
                                >
                                    <Send className="w-5 h-5" />
                                </Button>
                            </>
                        ) : (
                            <Button
                                onClick={handleReset}
                                variant="outline"
                                className="py-6 px-8 text-lg"
                            >
                                <RotateCcw className="w-5 h-5 mr-2" />
                                Try Again
                            </Button>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}