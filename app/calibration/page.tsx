"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CheckCircle, Loader2, RefreshCw } from "lucide-react"
import DashboardLayout from "@/components/layout"

const questions = [
  {
    id: "greeting",
    question: "How do you usually greet your clients in emails?",
    type: "textarea",
    placeholder: "e.g., Hi [Name], Hope you're doing well...",
  },
  {
    id: "follow_up",
    question: "How would you follow up with someone who hasn't answered yet?",
    type: "textarea",
    placeholder: "e.g., Just wanted to circle back on my previous email...",
  },
  {
    id: "excitement",
    question: "Tell me a sentence you'd write to say something exciting is coming soon.",
    type: "textarea",
    placeholder: "e.g., Get ready for something amazing that's about to drop...",
  },
  {
    id: "tone",
    question: "How formal do you like your tone to be?",
    type: "radio",
    options: ["Casual", "Friendly", "Professional", "Corporate"],
  },
]

export default function CalibrationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isRetake = searchParams.get("retake") === "true"

  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoadingExisting, setIsLoadingExisting] = useState(isRetake)

  useEffect(() => {
    if (isRetake) {
      loadExistingAnswers()
    }
  }, [isRetake])

  const loadExistingAnswers = async () => {
    try {
      const response = await fetch("/api/calibration/status")
      const data = await response.json()

      if (data.completed && data.calibration) {
        setAnswers({
          greeting: data.calibration.greeting || "",
          follow_up: data.calibration.follow_up || "",
          excitement: data.calibration.excitement || "",
          tone: data.calibration.tone || "",
        })
      }
    } catch (error) {
      console.error("Error loading existing answers:", error)
    } finally {
      setIsLoadingExisting(false)
    }
  }

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/calibration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers, isRetake }),
      })

      if (response.ok) {
        if (isRetake) {
          router.push("/settings?calibration=updated")
        } else {
          router.push("/?calibration=completed")
        }
      } else {
        throw new Error("Failed to save calibration")
      }
    } catch (error) {
      console.error("Error saving calibration:", error)
      alert("Failed to save your responses. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentQuestion = questions[currentStep]
  const isLastStep = currentStep === questions.length - 1
  const canProceed = answers[currentQuestion.id]

  if (isLoadingExisting) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-slate-400">Loading your current calibration...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            {isRetake && <RefreshCw className="h-8 w-8 text-blue-400" />}
            {isRetake ? "Update Your" : ""} Email Style Calibration
          </h1>
          <p className="text-slate-400">
            {isRetake
              ? "Update your communication style preferences"
              : "Help us personalize your email templates by sharing your communication style"}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
          />
        </div>

        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                {currentStep + 1}
              </span>
              Question {currentStep + 1} of {questions.length}
            </CardTitle>
            <CardDescription className="text-slate-300 text-lg">{currentQuestion.question}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentQuestion.type === "textarea" ? (
              <div>
                <Textarea
                  placeholder={currentQuestion.placeholder}
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  className="bg-slate-800 border-slate-600 text-white min-h-[100px]"
                />
              </div>
            ) : (
              <RadioGroup
                value={answers[currentQuestion.id] || ""}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              >
                {currentQuestion.options?.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option} className="text-white cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Previous
              </Button>

              {isLastStep ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed || isSubmitting}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isRetake ? "Updating..." : "Saving..."}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {isRetake ? "Update Calibration" : "Complete Calibration"}
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Next Question
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary of completed answers */}
        {currentStep > 0 && (
          <Card className="bg-slate-900/30 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">Your Responses So Far</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {questions.slice(0, currentStep).map((q, index) => (
                <div key={q.id} className="text-sm">
                  <span className="text-slate-400">
                    {index + 1}. {q.question}
                  </span>
                  <p className="text-slate-300 ml-4 truncate">{answers[q.id]}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
