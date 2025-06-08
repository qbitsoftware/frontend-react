import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X, AlertCircle } from "lucide-react"
import { OnboardingStep } from "@/providers/tutorialProvider"

interface OnboardingOverlayProps {
    steps: OnboardingStep[]
    currentStepIndex: number
    totalSteps: number
    currentGlobalStep: number
    onNext: () => void
    onSkip: () => void
    onComplete: () => void
    onPrevious?: () => void
}

export function OnboardingOverlay({
    steps,
    currentStepIndex,
    totalSteps,
    currentGlobalStep,
    onNext,
    onSkip,
    onPrevious
}: OnboardingOverlayProps) {
    const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
    const [hasInteracted, setHasInteracted] = useState(false)
    const [isValid, setIsValid] = useState(false)
    const [validationError, setValidationError] = useState<string>("")
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
    const eventListenerRef = useRef<(() => void) | null>(null)
    const stepAdvancedRef = useRef(false)

    const step = steps[currentStepIndex]

    // Update target rect when scrolling or resizing
    const updateTargetRect = () => {
        if (targetElement) {
            setTargetRect(targetElement.getBoundingClientRect())
        }
    }

    useEffect(() => {
        updateTargetRect()

        // Add scroll and resize listeners
        window.addEventListener('scroll', updateTargetRect, true)
        window.addEventListener('resize', updateTargetRect)

        return () => {
            window.removeEventListener('scroll', updateTargetRect, true)
            window.removeEventListener('resize', updateTargetRect)
        }
    }, [targetElement])

    useEffect(() => {
        stepAdvancedRef.current = false
        setHasInteracted(false)
        setIsValid(false)
        setValidationError("")
    }, [currentGlobalStep])

    useEffect(() => {
        const updateTargetPosition = () => {
            if (step) {
                const visualElement = document.getElementById(step.visualId)
                setTargetElement(visualElement)

                if (visualElement) {
                    setTargetRect(visualElement.getBoundingClientRect())
                }

                if (step.targetId) {
                    const inputElement = document.getElementById(step.targetId)
                    if (inputElement) {

                        if (step.prefillValue && !hasInteracted) {
                            if (inputElement instanceof HTMLInputElement) {
                                inputElement.value = String(step.prefillValue)
                                inputElement.dispatchEvent(new Event('input', { bubbles: true }))
                            } else if (inputElement instanceof HTMLSelectElement) {
                                inputElement.value = String(step.prefillValue)
                                inputElement.dispatchEvent(new Event('change', { bubbles: true }))
                            }
                        }

                        if (step.requiresValidation) {
                            checkValidation(inputElement)
                        }
                    }
                }
            }
        }

        const timeoutId = setTimeout(updateTargetPosition, 100)
        return () => clearTimeout(timeoutId)
    }, [step, hasInteracted])

    const checkValidation = (element: HTMLElement) => {
        if (!step?.requiresValidation || !step.triggerCondition) {
            setIsValid(true)
            setValidationError("")
            return true
        }

        const isValidNow = step.triggerCondition(element)
        setIsValid(isValidNow)

        if (!isValidNow) {
            if (step.id === 'tournament-name') {
                setValidationError("Please enter a tournament name")
            } else {
                setValidationError("Please complete this field")
            }
        } else {
            setValidationError("")
        }

        return isValidNow
    }

    useEffect(() => {
        if (eventListenerRef.current) {
            eventListenerRef.current()
            eventListenerRef.current = null
        }

        if (!step?.triggerEvent) {
            return
        }

        const elementToListenTo = step.requiresValidation && step.targetId ?
            document.getElementById(step.targetId) :
            targetElement

        if (!elementToListenTo) {
            return
        }

        const handleInteraction = (event: Event) => {
            if (step.requiresValidation) {
                setHasInteracted(true)

                const inputElement = document.getElementById(step.targetId!)
                if (inputElement) {
                    checkValidation(inputElement)
                }
                return
            }

            if (stepAdvancedRef.current) {
                return
            }


            if (step.triggerEvent === 'click' && (step.id === 'tournament-start-date' || step.id === 'tournament-end-date')) {
                return
            }

            if (step.triggerEvent === 'click') {
                event.preventDefault()
                event.stopPropagation()

                setHasInteracted(true)
                stepAdvancedRef.current = true

                onNext()
                return
            }

            setHasInteracted(true)

            if (step.triggerCondition) {
                if (!step.triggerCondition(elementToListenTo)) {
                    return
                }
            }

            stepAdvancedRef.current = true
            setTimeout(() => {
                onNext()
            }, 300)
        }

        elementToListenTo.addEventListener(step.triggerEvent, handleInteraction, true)

        eventListenerRef.current = () => {
            elementToListenTo.removeEventListener(step.triggerEvent!, handleInteraction, true)
        }

        return () => {
            if (eventListenerRef.current) {
                eventListenerRef.current()
            }
        }
    }, [targetElement, step, onNext])

    useEffect(() => {
        if (!step || (step.id !== 'tournament-start-date' && step.id !== 'tournament-end-date')) {
            return
        }

        if (stepAdvancedRef.current) {
            return
        }

        const targetButton = document.getElementById(step.targetId!)
        if (!targetButton) {
            return
        }

        const observer = new MutationObserver(() => {
            if (step.triggerCondition && step.triggerCondition(targetButton)) {
                setHasInteracted(true)
                stepAdvancedRef.current = true
                setTimeout(() => {
                    onNext()
                }, 500)
            }
        })

        observer.observe(targetButton, {
            childList: true,
            subtree: true,
            characterData: true
        })

        const form = targetButton.closest('form')
        if (form) {
            const handleFormChange = () => {
                setTimeout(() => {
                    if (step.triggerCondition && step.triggerCondition(targetButton)) {
                        setHasInteracted(true)
                        stepAdvancedRef.current = true
                        onNext()
                    }
                }, 100)
            }

            form.addEventListener('change', handleFormChange)

            return () => {
                observer.disconnect()
                form.removeEventListener('change', handleFormChange)
            }
        }

        return () => {
            observer.disconnect()
        }
    }, [step, targetElement, onNext])

    const handleNextClick = () => {
        if (step?.requiresValidation && step.targetId) {
            const inputElement = document.getElementById(step.targetId)
            if (inputElement) {
                const validationResult = checkValidation(inputElement)
                if (!validationResult) {
                    return
                }
            }
        }

        onNext()
    }

    useEffect(() => {
        if (step && !step.waitForInteraction && !step.requiresValidation) {
            const timer = setTimeout(() => {
                onNext()
            }, 2000)

            return () => clearTimeout(timer)
        }
    }, [step, onNext])

    if (!targetElement || !step || !targetRect) {
        return null
    }

    const getTooltipPosition = () => {
        const padding = 20
        const tooltipWidth = 280
        const tooltipHeight = 180 // Approximate height
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight

        let position = {
            top: 0,
            left: 0,
        }

        switch (step.position) {
            case "top":
                position = {
                    top: targetRect.top - tooltipHeight - padding,
                    left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
                }
                break
            case "bottom":
                position = {
                    top: targetRect.bottom + padding,
                    left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
                }
                break
            case "left":
                position = {
                    top: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
                    left: targetRect.left - tooltipWidth - padding,
                }
                break
            case "right":
                position = {
                    top: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
                    left: targetRect.right + padding,
                }
                break
        }

        // Ensure tooltip stays within viewport bounds
        if (position.left < padding) {
            position.left = padding
        } else if (position.left + tooltipWidth > viewportWidth - padding) {
            position.left = viewportWidth - tooltipWidth - padding
        }

        if (position.top < padding) {
            position.top = padding
        } else if (position.top + tooltipHeight > viewportHeight - padding) {
            position.top = viewportHeight - tooltipHeight - padding
        }

        return position
    }

    const tooltipPosition = getTooltipPosition()

    const spotlightStyle = {
        top: targetRect.top - 10,
        left: targetRect.left - 10,
        width: targetRect.width + 20,
        height: targetRect.height + 20,
    }

    return (
        <div className="fixed inset-0 z-40 pointer-events-none">
            <div
                className="absolute inset-0 bg-black/50"
                style={{
                    clipPath: `polygon(
                        0% 0%, 
                        0% 100%, 
                        ${targetRect.left - 10}px 100%, 
                        ${targetRect.left - 10}px ${targetRect.top - 10}px, 
                        ${targetRect.right + 10}px ${targetRect.top - 10}px, 
                        ${targetRect.right + 10}px ${targetRect.bottom + 10}px, 
                        ${targetRect.left - 10}px ${targetRect.bottom + 10}px, 
                        ${targetRect.left - 10}px 100%, 
                        100% 100%, 
                        100% 0%
                    )`
                }}
            />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute rounded-lg"
                style={spotlightStyle}
            >
                <div className="absolute inset-0 rounded-lg ring-4 ring-primary ring-pulse" />
            </motion.div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentGlobalStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute pointer-events-auto bg-white rounded-lg shadow-lg p-4 w-[280px] max-h-[350px] overflow-y-auto"
                    style={{
                        top: tooltipPosition.top,
                        left: tooltipPosition.left,
                    }}
                >
                    <button onClick={onSkip} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 z-10">
                        <X size={16} />
                    </button>

                    <div className="pr-6">
                        <h3 className="font-bold text-base mb-2">{step.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">{step.description}</p>
                    </div>

                    {validationError && (
                        <div className="mb-3 p-2 bg-red-50 rounded text-xs text-red-700 border border-red-200 flex items-center gap-2">
                            <AlertCircle className="h-3 w-3 flex-shrink-0" />
                            <span>{validationError}</span>
                        </div>
                    )}

                    {step.waitForInteraction && !step.requiresValidation && (
                        <div className="mb-3 p-2 bg-blue-50 rounded text-xs text-blue-700 border border-blue-200">
                            {step.triggerEvent === 'click' && !step.id.includes('date') && "👆 Click the highlighted element"}
                            {(step.id === 'tournament-start-date' || step.id === 'tournament-end-date') && "📅 Click to open the date picker and select a date"}
                            {step.triggerEvent === 'input' && "✏️ Type in the highlighted field"}
                            {step.triggerEvent === 'change' && "🔄 Make a selection or choose a date"}
                            {step.triggerEvent === 'focus' && "👆 Click to focus the field"}
                            {hasInteracted && (
                                <div className="mt-1 text-green-600 font-medium text-xs">
                                    ✅ Great! Moving to next step...
                                </div>
                            )}
                        </div>
                    )}

                    {step.requiresValidation && (
                        <div className="mb-3 p-2 bg-amber-50 rounded text-xs text-amber-700 border border-amber-200">
                            ✏️ Enter a tournament name, then click Next to continue
                            {isValid && (
                                <div className="mt-1 text-green-600 font-medium text-xs">
                                    ✅ Great! You can now proceed to the next step.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Progress indicators - compact */}
                    <div className="mb-3">
                        <div className="flex items-center justify-center overflow-x-auto pb-1">
                            <div className="flex gap-0.5 min-w-max">
                                {Array.from({ length: totalSteps }).map((_, index) => (
                                    <div
                                        key={index}
                                        className={`h-1 w-3 rounded-full flex-shrink-0 ${index === currentGlobalStep ? "bg-primary" :
                                            index < currentGlobalStep ? "bg-green-400" : "bg-gray-200"
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="text-xs text-gray-500 text-center mt-1">
                            Step {currentGlobalStep + 1} of {totalSteps}
                        </div>
                    </div>

                    {/* Buttons section */}
                    <div className="flex justify-end gap-2">
                        {currentGlobalStep > 0 && onPrevious && (
                            <Button variant="outline" size="sm" onClick={onPrevious} className="text-xs px-2 py-1">
                                <ChevronLeft className="h-3 w-3 mr-1" />
                                Back
                            </Button>
                        )}

                        <Button
                            size="sm"
                            onClick={handleNextClick}
                            disabled={step.requiresValidation && !isValid}
                            className={`text-xs px-3 py-1 ${step.requiresValidation && !isValid ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            {currentGlobalStep < totalSteps - 1 ? (
                                <>
                                    Next
                                    <ChevronRight className="h-3 w-3 ml-1" />
                                </>
                            ) : (
                                "Complete"
                            )}
                        </Button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    )
}