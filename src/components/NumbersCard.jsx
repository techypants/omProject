'use client'
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Send, CheckCircle, XCircle, RotateCcw, Clock } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function NumbersCard({ 
    numbers, 
    onComplete, 
    slideIndex, 
    timeLeft, 
    sectionName 
}) {
    const { num1, num2, sum } = numbers;
    const [inputAnswer, setInputAnswer] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const inputRef = useRef(null);

    // Auto-focus input when component mounts or question changes
    useEffect(() => {
        if (inputRef.current && !showResult) {
            inputRef.current.focus();
        }
        // Reset state for new question
        setInputAnswer('');
        setShowResult(false);
        setIsCorrect(false);
        setIsSubmitted(false);
    }, [slideIndex, num1, num2]); // Reset when question changes

    // Handle time running out
    useEffect(() => {
        if (timeLeft === 0 && !isSubmitted) {
            handleTimeUp();
        }
    }, [timeLeft, isSubmitted]);

    function handleTimeUp() {
        if (!isSubmitted) {
            setIsSubmitted(true);
            setShowResult(true);
            setIsCorrect(false);
            
            if (onComplete) {
                onComplete(null, false); // null answer, incorrect
            }
        }
    }

    function handleSubmit() {
        if (isSubmitted || inputAnswer.trim() === '') return;
        
        const userAnswer = Number(inputAnswer);
        const correct = userAnswer === sum;
        
        setIsCorrect(correct);
        setShowResult(true);
        setIsSubmitted(true);
        
        if (onComplete) {
            onComplete(userAnswer, correct);
        }
    }

    function handleKeyPress(e) {
        if (e.key === 'Enter' && inputAnswer.trim() !== '' && !isSubmitted) {
            handleSubmit();
        }
    }

    // Get time urgency level for styling
    const getTimeUrgency = () => {
        if (timeLeft <= 5) return 'critical';
        if (timeLeft <= 10) return 'warning';
        return 'normal';
    };

    const urgency = getTimeUrgency();

    return (
        <div className="w-full max-w-2xl mx-auto p-4">
            <Card 
                className={cn(
                    'transition-all duration-300 ease-out transform shadow-lg',
                    showResult && isCorrect && 'ring-4 ring-green-400 shadow-lg shadow-green-200 scale-105',
                    showResult && !isCorrect && 'ring-4 ring-red-400 shadow-lg shadow-red-200',
                    urgency === 'critical' && !showResult && 'ring-2 ring-red-500 shadow-red-200',
                    urgency === 'warning' && !showResult && 'ring-2 ring-orange-500 shadow-orange-200'
                )}
            >
                <CardHeader className="pb-4">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-xl text-gray-600">
                            {sectionName}
                        </CardTitle>
                        
                        {/* Timer display */}
                        <div className={cn(
                            'flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold',
                            urgency === 'critical' && 'bg-red-100 text-red-700',
                            urgency === 'warning' && 'bg-orange-100 text-orange-700',
                            urgency === 'normal' && 'bg-blue-100 text-blue-700'
                        )}>
                            <Clock className="w-4 h-4" />
                            {timeLeft}s
                        </div>
                    </div>
                    
                    <div className="text-center">
                        {showResult ? (
                            <div className={cn(
                                'flex items-center justify-center gap-2 transition-all duration-500 text-2xl',
                                isCorrect ? 'text-green-600' : 'text-red-600'
                            )}>
                                {isCorrect ? <CheckCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                                {isCorrect ? 'Correct!' : timeLeft === 0 ? 'Time\'s Up!' : 'Incorrect!'}
                            </div>
                        ) : (
                            <h2 className="text-2xl font-semibold text-gray-800">
                                Solve the addition
                            </h2>
                        )}
                    </div>
                </CardHeader>
                
                <CardContent className="py-8">
                    {/* Math problem display */}
                    <div className="text-center mb-8">
                        <div className="text-6xl md:text-8xl font-bold text-gray-800 space-y-2">
                            <div className="animate-in slide-in-from-right duration-300">
                                {num1.toLocaleString()}
                            </div>
                            <div className="animate-in slide-in-from-right duration-300 delay-100">
                                + {num2.toLocaleString()}
                            </div>
                            <div className="w-full h-1 bg-gray-300 my-4 animate-in slide-in-from-left duration-300 delay-200"></div>
                        </div>
                    </div>

                    {/* Result display */}
                    {showResult && (
                        <div className={cn(
                            'mx-auto max-w-md p-6 rounded-xl border-2 transition-all duration-500 transform',
                            'animate-in slide-in-from-bottom-4 fade-in',
                            isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                        )}>
                            <div className="text-center space-y-3">
                                {inputAnswer && (
                                    <>
                                        <div className="text-sm text-gray-600">Your answer:</div>
                                        <div className={cn(
                                            'text-3xl font-bold',
                                            isCorrect ? 'text-green-600' : 'text-red-600'
                                        )}>
                                            {Number(inputAnswer).toLocaleString()}
                                        </div>
                                    </>
                                )}
                                
                                <div className="text-sm text-gray-600">Correct answer:</div>
                                <div className="text-3xl font-bold text-green-600">
                                    {sum.toLocaleString()}
                                </div>

                                {!isCorrect && timeLeft === 0 && (
                                    <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                                        <div className="text-sm text-orange-700">
                                            ⏰ Time ran out! The next question will load automatically.
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="pt-4">
                    <div className="w-full">
                        {!showResult ? (
                            <div className="flex items-center gap-4">
                                <Input 
                                    ref={inputRef}
                                    value={inputAnswer}
                                    onChange={(e) => setInputAnswer(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    className="text-2xl py-6 text-center flex-1"
                                    placeholder="Enter your answer"
                                    type="number"
                                    disabled={isSubmitted}
                                />
                                <Button
                                    onClick={handleSubmit}
                                    disabled={inputAnswer.trim() === '' || isSubmitted}
                                    className={cn(
                                        "py-6 px-6 text-lg",
                                        urgency === 'critical' && 'bg-red-600 hover:bg-red-700',
                                        urgency === 'warning' && 'bg-orange-600 hover:bg-orange-700'
                                    )}
                                >
                                    <Send className="w-5 h-5" />
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center text-gray-600">
                                <p className="text-lg">
                                    {isCorrect 
                                        ? "Great job! Next question loading..." 
                                        : "Don't worry, keep practicing! Next question loading..."
                                    }
                                </p>
                            </div>
                        )}
                        
                        {/* Progress indicator */}
                        <div className="mt-4 text-center text-sm text-gray-500">
                            Question {(slideIndex || 0) + 1}
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}