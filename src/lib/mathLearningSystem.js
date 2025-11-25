/**
 * Math Learning System with Random Number Generator and Mistake Tracking
 * Designed for kids to learn calculations with adaptive difficulty
 */

export class MathLearningSystem {
    constructor() {
        this.mistakeHistory = new Map();
        this.difficultyLevel = 1;
        this.consecutiveCorrect = 0;
        this.sessionStats = {
            totalProblems: 0,
            correctAnswers: 0,
            commonMistakes: new Map()
        };
    }

    /**
     * Generate random numbers based on parameters
     * @param {Object} params - Configuration object
     * @param {number} params.min - Minimum value
     * @param {number} params.max - Maximum value
     * @param {number} params.digits - Number of digits (optional, overrides min/max)
     * @param {string} params.type - 'integer' or 'decimal'
     * @param {number} params.decimalPlaces - Number of decimal places for decimals
     * @param {boolean} params.allowNegative - Allow negative numbers
     * @param {Array} params.exclude - Numbers to exclude from generation
     * @returns {number} Generated random number
     */
    generateRandomNumber(params = {}) {
        const {
            min = 1,
            max = 100,
            digits,
            type = 'integer',
            decimalPlaces = 2,
            allowNegative = false,
            exclude = []
        } = params;

        let actualMin = min;
        let actualMax = max;

        // If digits specified, override min/max
        if (digits) {
            actualMin = Math.pow(10, digits - 1);
            actualMax = Math.pow(10, digits) - 1;
            
            // For single digit, start from 0
            if (digits === 1) {
                actualMin = 0;
                actualMax = 9;
            }
        }

        let number;
        let attempts = 0;
        const maxAttempts = 100; // Prevent infinite loops

        do {
            if (type === 'decimal') {
                const range = actualMax - actualMin;
                number = Math.random() * range + actualMin;
                number = parseFloat(number.toFixed(decimalPlaces));
            } else {
                number = Math.floor(Math.random() * (actualMax - actualMin + 1)) + actualMin;
            }

            if (allowNegative && Math.random() < 0.3) {
                number = -Math.abs(number);
            }

            attempts++;
        } while (exclude.includes(number) && attempts < maxAttempts);

        return number;
    }

    /**
     * Generate a math problem based on difficulty level and mistake history
     * @param {string} operation - '+', '-', '*', '/', 'mixed'
     * @param {Object} customParams - Custom parameters for number generation
     * @returns {Object} Problem object with numbers and expected answer
     */
    generateProblem(operation = '+', customParams = {}) {
        const difficulty = this.adaptDifficulty();
        let num1Params, num2Params;

        // Adjust parameters based on difficulty and operation
        switch (difficulty) {
            case 1: // Beginner
                num1Params = { min: 1, max: 10, ...customParams };
                num2Params = { min: 1, max: 10, ...customParams };
                break;
            case 2: // Intermediate
                num1Params = { min: 10, max: 50, ...customParams };
                num2Params = { min: 1, max: 20, ...customParams };
                break;
            case 3: // Advanced
                num1Params = { min: 20, max: 100, ...customParams };
                num2Params = { min: 10, max: 50, ...customParams };
                break;
            case 4: // Expert
                num1Params = { digits: 3, ...customParams };
                num2Params = { digits: 2, ...customParams };
                break;
        }

        // Adjust for specific operations
        if (operation === '/' || operation === 'division') {
            // For division, ensure clean results for beginners
            if (difficulty <= 2) {
                const divisor = this.generateRandomNumber(num2Params);
                const quotient = this.generateRandomNumber({ min: 2, max: 12 });
                return {
                    num1: divisor * quotient,
                    num2: divisor,
                    operation: '÷',
                    answer: quotient,
                    difficulty
                };
            }
        }

        const operations = operation === 'mixed' ? 
            ['+', '-', '*', '÷'] : [operation];
        
        const selectedOp = operations[Math.floor(Math.random() * operations.length)];
        
        const num1 = this.generateRandomNumber(num1Params);
        const num2 = this.generateRandomNumber(num2Params);
        
        let answer;
        let displayOp = selectedOp;

        switch (selectedOp) {
            case '+':
                answer = num1 + num2;
                break;
            case '-':
                // Ensure positive results for beginners
                if (difficulty <= 2 && num1 < num2) {
                    answer = num2 - num1;
                    return { num1: num2, num2: num1, operation: '−', answer, difficulty };
                }
                answer = num1 - num2;
                displayOp = '−';
                break;
            case '*':
                answer = num1 * num2;
                displayOp = '×';
                break;
            case '/':
            case '÷':
                answer = parseFloat((num1 / num2).toFixed(2));
                displayOp = '÷';
                break;
        }

        return {
            num1,
            num2,
            operation: displayOp,
            answer,
            difficulty
        };
    }

    /**
     * Analyze user's answer and track mistakes
     * @param {Object} problem - The problem that was solved
     * @param {number} userAnswer - User's answer
     * @param {number} timeSpent - Time taken to solve (in seconds)
     * @returns {Object} Analysis result
     */
    analyzeAnswer(problem, userAnswer, timeSpent = 0) {
        const isCorrect = Math.abs(userAnswer - problem.answer) < 0.01; // Allow for small floating point errors
        const mistakeType = this.identifyMistakeType(problem, userAnswer);
        
        this.sessionStats.totalProblems++;
        
        if (isCorrect) {
            this.sessionStats.correctAnswers++;
            this.consecutiveCorrect++;
        } else {
            this.consecutiveCorrect = 0;
            this.trackMistake(problem, userAnswer, mistakeType);
        }

        return {
            isCorrect,
            expectedAnswer: problem.answer,
            userAnswer,
            mistakeType,
            timeSpent,
            suggestion: this.getSuggestion(mistakeType, problem)
        };
    }

    /**
     * Identify the type of mistake made
     * @param {Object} problem - The original problem
     * @param {number} userAnswer - User's incorrect answer
     * @returns {string} Mistake type
     */
    identifyMistakeType(problem, userAnswer) {
        const { num1, num2, operation, answer } = problem;
        
        // Check for common calculation mistakes
        switch (operation) {
            case '+':
                if (userAnswer === num1 - num2) return 'wrong_operation_subtraction';
                if (userAnswer === num1 * num2) return 'wrong_operation_multiplication';
                if (Math.abs(userAnswer - answer) <= 2) return 'counting_error';
                break;
                
            case '−':
                if (userAnswer === num1 + num2) return 'wrong_operation_addition';
                if (userAnswer === num2 - num1) return 'reversed_operands';
                if (Math.abs(userAnswer - answer) <= 2) return 'counting_error';
                break;
                
            case '×':
                if (userAnswer === num1 + num2) return 'wrong_operation_addition';
                if (this.isMultiplicationTableError(num1, num2, userAnswer)) return 'multiplication_table_error';
                break;
                
            case '÷':
                if (userAnswer === num1 * num2) return 'wrong_operation_multiplication';
                if (userAnswer === num2) return 'reversed_operands';
                break;
        }

        // Check for digit-based errors
        if (this.isDigitError(answer, userAnswer)) return 'digit_error';
        if (this.isPlaceValueError(answer, userAnswer)) return 'place_value_error';
        
        return 'calculation_error';
    }

    /**
     * Check if error is related to multiplication tables
     */
    isMultiplicationTableError(num1, num2, userAnswer) {
        // Check if user confused with adjacent multiplication facts
        const adjacent = [
            (num1 - 1) * num2, (num1 + 1) * num2,
            num1 * (num2 - 1), num1 * (num2 + 1)
        ];
        return adjacent.includes(userAnswer);
    }

    /**
     * Check for digit-based errors (like writing 6 instead of 9)
     */
    isDigitError(correct, userAnswer) {
        const correctStr = correct.toString();
        const userStr = userAnswer.toString();
        
        if (correctStr.length !== userStr.length) return false;
        
        let differences = 0;
        for (let i = 0; i < correctStr.length; i++) {
            if (correctStr[i] !== userStr[i]) differences++;
        }
        
        return differences === 1;
    }

    /**
     * Check for place value errors
     */
    isPlaceValueError(correct, userAnswer) {
        const ratio = userAnswer / correct;
        return ratio === 10 || ratio === 0.1 || ratio === 100 || ratio === 0.01;
    }

    /**
     * Track mistakes for pattern recognition
     */
    trackMistake(problem, userAnswer, mistakeType) {
        const key = `${problem.operation}_${mistakeType}`;
        
        if (!this.mistakeHistory.has(key)) {
            this.mistakeHistory.set(key, []);
        }
        
        this.mistakeHistory.get(key).push({
            problem,
            userAnswer,
            timestamp: new Date(),
            difficulty: problem.difficulty
        });

        // Track in session stats
        this.sessionStats.commonMistakes.set(
            mistakeType,
            (this.sessionStats.commonMistakes.get(mistakeType) || 0) + 1
        );
    }

    /**
     * Adapt difficulty based on performance
     */
    adaptDifficulty() {
        // Increase difficulty after 5 consecutive correct answers
        if (this.consecutiveCorrect >= 5) {
            this.difficultyLevel = Math.min(this.difficultyLevel + 1, 4);
            this.consecutiveCorrect = 0;
        }
        
        // Decrease difficulty if accuracy is below 60%
        const accuracy = this.sessionStats.totalProblems > 0 ? 
            this.sessionStats.correctAnswers / this.sessionStats.totalProblems : 1;
            
        if (this.sessionStats.totalProblems >= 10 && accuracy < 0.6) {
            this.difficultyLevel = Math.max(this.difficultyLevel - 1, 1);
        }
        
        return this.difficultyLevel;
    }

    /**
     * Get personalized suggestions based on mistake patterns
     */
    getSuggestion(mistakeType, problem) {
        const suggestions = {
            'wrong_operation_addition': "Remember to look at the operation sign! This is addition (+), not subtraction.",
            'wrong_operation_subtraction': "Check the operation sign! This is subtraction (−), not addition.",
            'wrong_operation_multiplication': "Look carefully at the operation sign! This is multiplication (×).",
            'reversed_operands': `For subtraction and division, order matters! ${problem.num1} ${problem.operation} ${problem.num2} is different from ${problem.num2} ${problem.operation} ${problem.num1}.`,
            'counting_error': "Take your time with counting. Try using your fingers or drawing dots if it helps!",
            'multiplication_table_error': `Review your ${Math.min(problem.num1, problem.num2)} times table. Practice makes perfect!`,
            'digit_error': "Double-check each digit in your answer. Sometimes we write numbers that look similar.",
            'place_value_error': "Be careful with place values! Make sure your answer has the right number of digits.",
            'calculation_error': "Let's break this down step by step. Try solving it again more slowly."
        };
        
        return suggestions[mistakeType] || "Keep practicing! You're doing great!";
    }

    /**
     * Get performance insights and recommendations
     */
    getPerformanceInsights() {
        const accuracy = this.sessionStats.totalProblems > 0 ? 
            (this.sessionStats.correctAnswers / this.sessionStats.totalProblems * 100).toFixed(1) : 0;
        
        const topMistakes = Array.from(this.sessionStats.commonMistakes.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        return {
            accuracy: `${accuracy}%`,
            totalProblems: this.sessionStats.totalProblems,
            correctAnswers: this.sessionStats.correctAnswers,
            currentDifficulty: this.difficultyLevel,
            consecutiveCorrect: this.consecutiveCorrect,
            topMistakes: topMistakes.map(([type, count]) => ({ type, count })),
            recommendations: this.getRecommendations()
        };
    }

    /**
     * Get personalized learning recommendations
     */
    getRecommendations() {
        const recommendations = [];
        
        // Analyze mistake patterns
        for (const [mistakeType, count] of this.sessionStats.commonMistakes.entries()) {
            if (count >= 3) {
                switch (mistakeType) {
                    case 'multiplication_table_error':
                        recommendations.push("Practice multiplication tables with flashcards or games");
                        break;
                    case 'wrong_operation_addition':
                    case 'wrong_operation_subtraction':
                        recommendations.push("Practice identifying operation signs before solving");
                        break;
                    case 'place_value_error':
                        recommendations.push("Review place value concepts with manipulatives");
                        break;
                }
            }
        }

        if (recommendations.length === 0) {
            recommendations.push("Keep up the great work! Try more challenging problems.");
        }

        return recommendations;
    }

    /**
     * Reset session statistics
     */
    resetSession() {
        this.sessionStats = {
            totalProblems: 0,
            correctAnswers: 0,
            commonMistakes: new Map()
        };
        this.consecutiveCorrect = 0;
    }

    /**
     * Export learning data for progress tracking
     */
    exportData() {
        return {
            mistakeHistory: Object.fromEntries(this.mistakeHistory),
            sessionStats: {
                ...this.sessionStats,
                commonMistakes: Object.fromEntries(this.sessionStats.commonMistakes)
            },
            difficultyLevel: this.difficultyLevel,
            consecutiveCorrect: this.consecutiveCorrect
        };
    }
}