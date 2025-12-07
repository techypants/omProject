"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function IllustrationCarousel() {
  const imagesList = [
    "/diagram-1-user-journey.svg",
    "/diagram-2-state-management.svg",
    "/diagram-3-game-modes.svg",
    "/diagram-4-question-generation.svg",
    "/diagram-5-timer-answer-flow.svg",
    "/diagram-6-data-persistence.svg",
    "/diagram-7-weakness-analysis.svg",
    "/diagram-8-complete-overview.svg",
  ]

  const [currentIndex, setCurrentIndex] = useState(0)
  const [autoPlay, setAutoPlay] = useState(false)

  useEffect(() => {
    if (!autoPlay) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % imagesList.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [autoPlay, imagesList.length])

  const goToPrevious = () => {
    setAutoPlay(false)
    setCurrentIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length)
  }

  const goToNext = () => {
    setAutoPlay(false)
    setCurrentIndex((prev) => (prev + 1) % imagesList.length)
  }

  const goToSlide = (index) => {
    setAutoPlay(false)
    setCurrentIndex(index)
  }

  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-background">
      <div className="w-full max-w-6xl">
        <div className="relative flex gap-4 items-center justify-center h-96 md:h-screen bg-card rounded-lg overflow-hidden">
          <img
            src={imagesList[currentIndex] || "/placeholder.svg"}
            alt={`Diagram ${currentIndex + 1}`}
            className="w-full h-full object-contain"
          />

          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-primary/80 hover:bg-primary text-primary-foreground z-10 rounded-full"
            aria-label="Previous slide"
          >
            <ChevronLeft className="size-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary/80 hover:bg-primary text-primary-foreground z-10 rounded-full"
            aria-label="Next slide"
          >
            <ChevronRight className="size-6" />
          </Button>

          <div className="absolute top-4 right-4 bg-primary/80 text-primary-foreground px-3 py-1 rounded-full text-sm font-medium z-10">
            {currentIndex + 1} / {imagesList.length}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6">
          {imagesList.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all rounded-full ${
                index === currentIndex ? "bg-primary w-3 h-3" : "bg-muted w-2 h-2 hover:bg-muted-foreground"
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex}
            />
          ))}
        </div>

        <div className="flex items-center justify-center mt-4">
          <Button variant="outline" size="sm" onClick={() => setAutoPlay(!autoPlay)}>
            {autoPlay ? "Pause" : "Play"}
          </Button>
        </div>
      </div>
    </div>
  )
}
