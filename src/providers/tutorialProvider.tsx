import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface OnboardingStep {
    id: string
    title: string
    description: string
    visualId: string
    targetId?: string //Optional if we want to prefill something
    position: "top" | "bottom" | "left" | "right"
    route: string
    routeResolver?: () => string // Add this for dynamic routes
    action?: () => void
    triggerEvent?: 'click' | 'input' | 'change' | 'focus' | 'blur' | 'submit' | 'custom'
    triggerCondition?: (element: HTMLElement) => boolean
    prefillValue?: string | number
    waitForInteraction?: boolean
    requiresValidation?: boolean
}

export interface OnboardingFlow {
    id: string
    name: string
    steps: OnboardingStep[]
}

interface OnboardingContextType {
    currentFlow: OnboardingFlow | null
    currentStepIndex: number
    isActive: boolean
    startFlow: (flowId: string) => void
    nextStep: () => void
    prevStep: () => void
    skipFlow: () => void
    completeFlow: () => void
    pauseFlow: () => void
    resumeFlow: () => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

const ONBOARDING_FLOWS: Record<string, OnboardingFlow> = {
    'tournament-creation': {
        id: 'tournament-creation',
        name: 'Tournament Creation',
        steps: [
            {
                id: 'tournaments-list',
                title: 'Start Here',
                description: 'Click this button to create your first tournament',
                visualId: 'tutorial-tournament-add',
                position: 'left',
                route: '/admin/tournaments',
                triggerEvent: 'click',
                waitForInteraction: true
            },
            {
                id: 'tournament-name',
                title: 'Tournament Name',
                description: 'Give your tournament a memorable name',
                visualId: 'tutorial-tournament-name',
                targetId: 'tournament-name-input',
                position: 'bottom',
                route: '/admin/tournaments/new',
                triggerEvent: 'input',
                prefillValue: '',
                triggerCondition: (element) => {
                    const input = element as HTMLInputElement
                    if (!input || !input.value) return false
                    return input.value.length > 0
                },
                waitForInteraction: false,
                requiresValidation: true,
            },
            {
                id: 'tournament-sport',
                title: 'Select Sport',
                description: 'Choose Table Tennis from the dropdown. Currently, this is the only sport available.',
                visualId: 'tutorial-tournament-sport',
                targetId: 'tournament-sport-select',
                position: 'bottom',
                route: '/admin/tournaments/new',
                triggerEvent: 'change',
                triggerCondition: (element) => {
                    // Check if table tennis is selected
                    const trigger = element.querySelector('[role="combobox"]') as HTMLElement
                    if (trigger) {
                        const selectedText = trigger.textContent || trigger.innerText
                        return selectedText.includes('Table Tennis') || selectedText.includes('tabletennis') || selectedText.includes("Lauatennis")
                    }
                    return false
                },
                waitForInteraction: true,
                requiresValidation: false,
            },
            {
                id: 'tournament-start-date',
                title: 'Start Date',
                description: 'Select when your tournament will begin. Click on the calendar icon to open the date picker and choose a date.',
                visualId: 'tutorial-tournament-start-date',
                targetId: 'start-date-button',
                position: 'bottom',
                route: '/admin/tournaments/new',
                triggerEvent: 'change', // Change to 'change' to detect when date is selected
                triggerCondition: (element) => {
                    // Check if a date has been selected by looking at the button text or form state
                    const button = element as HTMLButtonElement
                    const buttonText = button.textContent || button.innerText
                    // Return true if the button doesn't contain placeholder text
                    return !buttonText.includes('Pick a date') && !buttonText.includes('start_date_placeholder')
                },
                waitForInteraction: true,
                requiresValidation: false,
            },
            {
                id: 'tournament-end-date',
                title: 'End Date',
                description: 'Select when your tournament will end. Click on the calendar icon to open the date picker and choose a date.',
                visualId: 'tutorial-tournament-end-date',
                targetId: 'end-date-button',
                position: 'bottom',
                route: '/admin/tournaments/new',
                triggerEvent: 'change', // Change to 'change' to detect when date is selected
                triggerCondition: (element) => {
                    // Check if a date has been selected
                    const button = element as HTMLButtonElement
                    const buttonText = button.textContent || button.innerText
                    return !buttonText.includes('Pick a date') && !buttonText.includes('end_date_placeholder')
                },
                waitForInteraction: true,
                requiresValidation: false,
            },
            {
                id: 'tournament-location',
                title: 'Tournament Location',
                description: 'Enter where your tournament will be held (e.g., "Community Center, Main Street")',
                visualId: 'tutorial-tournament-location',
                targetId: 'tournament-location-input',
                position: 'bottom',
                route: '/admin/tournaments/new',
                triggerEvent: 'input',
                prefillValue: '',
                triggerCondition: (element) => {
                    const input = element as HTMLInputElement
                    return input.value.length > 0 && input.value.trim() !== ''
                },
                waitForInteraction: false,
                requiresValidation: true,
            },
            {
                id: 'tournament-category',
                title: 'Tournament Category',
                description: 'Enter a category for your tournament (e.g., "Beginner", "Advanced", "Youth")',
                visualId: 'tutorial-tournament-category',
                targetId: 'tournament-category-input',
                position: 'left',
                route: '/admin/tournaments/new',
                triggerEvent: 'input',
                prefillValue: '',
                triggerCondition: (element) => {
                    const input = element as HTMLInputElement
                    return input.value.length > 0 && input.value.trim() !== ''
                },
                waitForInteraction: false,
                requiresValidation: true,
            },
            {
                id: 'tournament-tables',
                title: 'Number of Tables',
                description: 'Enter how many physical tables you are planning to use in the tournament',
                visualId: 'tutorial-tournament-tables',
                targetId: 'tournament-tables-input',
                position: 'bottom',
                route: '/admin/tournaments/new',
                triggerEvent: 'input',
                prefillValue: '1',
                triggerCondition: (element) => {
                    const input = element as HTMLInputElement
                    const value = parseInt(input.value)
                    return !isNaN(value) && value > 0
                },
                waitForInteraction: false,
                requiresValidation: true,
            },
            {
                id: 'tournament-rating',
                title: 'Rating Calculation',
                description: 'For this tutorial, we\'ll keep rating calculation disabled. This is perfect for casual tournaments. Click Next to continue.',
                visualId: 'tutorial-tournament-rating',
                position: 'left',
                route: '/admin/tournaments/new',
                waitForInteraction: true,
                requiresValidation: false,
                action: () => {
                    // Ensure rating is disabled for tutorial
                    const switchElement = document.getElementById('tournament-rating-switch') as HTMLButtonElement
                    if (switchElement && switchElement.getAttribute('data-state') === 'checked') {
                        switchElement.click()
                    }
                    // Disable the switch during tutorial
                    if (switchElement) {
                        switchElement.style.pointerEvents = 'none'
                        switchElement.style.opacity = '0.6'
                    }
                }
            },
            {
                id: 'tournament-private',
                title: 'Private Tournament',
                description: 'For this tutorial, we\'ll make the tournament private so only you can see it during testing. Click Next to continue.',
                visualId: 'tutorial-tournament-private',
                position: 'left',
                route: '/admin/tournaments/new',
                waitForInteraction: true,
                requiresValidation: false,
                action: () => {
                    // Ensure private is enabled for tutorial
                    const switchElement = document.getElementById('tournament-private-switch') as HTMLButtonElement
                    if (switchElement && switchElement.getAttribute('data-state') === 'unchecked') {
                        switchElement.click()
                    }
                    // Disable the switch during tutorial
                    if (switchElement) {
                        switchElement.style.pointerEvents = 'none'
                        switchElement.style.opacity = '0.6'
                    }
                }
            },
            {
                id: 'tournament-information',
                title: 'Additional Information',
                description: 'This rich text editor allows you to add detailed information about your tournament. You can skip this for now and add information later.',
                visualId: 'tutorial-tournament-information',
                position: 'top',
                route: '/admin/tournaments/new',
                waitForInteraction: true,
                requiresValidation: false,
            },
            {
                id: 'tournament-create',
                title: 'Create Your Tournament',
                description: 'Great! You\'ve filled in all the required information. Click the "Create Tournament" button to finish creating your tournament.',
                visualId: 'tutorial-tournament-create',
                targetId: 'tournament-create-button',
                position: 'top',
                route: '/admin/tournaments/new',
                triggerEvent: 'click',
                waitForInteraction: true,
                requiresValidation: false,
            }
        ]

    },
    'image-explainer': {
        id: 'image-explainer',
        name: 'Image Explainer',
        steps: [
            {
                id: 'image-overview',
                title: 'Tournament Images Overview',
                description: 'This section allows you to organize and manage images from your tournament by different game days.',
                visualId: 'tutorial-images-title',
                position: 'bottom',
                route: '/admin/tournaments/[id]/edit',
                routeResolver: () => {
                    const currentPath = window.location.pathname
                    const tournamentMatch = currentPath.match(/\/admin\/tournaments\/(\d+)/)
                    if (tournamentMatch && tournamentMatch[1]) {
                        return `/admin/tournaments/${tournamentMatch[1]}`
                    }
                    return '/admin/tournaments'
                },
                waitForInteraction: true,
                requiresValidation: false,
            },
            {
                id: 'image-add-gameday',
                title: 'Create Game Days',
                description: 'Click this button to create new game days. Each game day can contain multiple images from that specific day of the tournament.',
                visualId: 'tutorial-images-add-gameday',
                position: 'left',
                route: '/admin/tournaments/[id]/edit',
                routeResolver: () => {
                    const currentPath = window.location.pathname
                    const tournamentMatch = currentPath.match(/\/admin\/tournaments\/(\d+)/)
                    if (tournamentMatch && tournamentMatch[1]) {
                        return `/admin/tournaments/${tournamentMatch[1]}`
                    }
                    console.warn('Image tutorial: Unable to resolve tournament ID')
                    return '/admin/tournaments'
                },
                waitForInteraction: true,
                requiresValidation: false,
            },
            {
                id: 'image-tabs',
                title: 'Game Day Tabs',
                description: 'Switch between different game days using these tabs. Each tab represents a different day of your tournament.',
                visualId: 'tutorial-images-tabs',
                position: 'bottom',
                route: '/admin/tournaments/[id]/edit',
                routeResolver: () => {
                    const currentPath = window.location.pathname
                    const tournamentMatch = currentPath.match(/\/admin\/tournaments\/(\d+)/)
                    if (tournamentMatch && tournamentMatch[1]) {
                        return `/admin/tournaments/${tournamentMatch[1]}`
                    }
                    console.warn('Image tutorial: Unable to resolve tournament ID')
                    return '/admin/tournaments'
                },
                waitForInteraction: true,
                requiresValidation: false,
            },
            {
                id: 'image-upload-area',
                title: 'Upload Images',
                description: 'Use this area to upload images for the selected game day. You can drag and drop files or click to browse.',
                visualId: 'tutorial-images-upload',
                position: 'top',
                route: '/admin/tournaments/[id]/edit',
                routeResolver: () => {
                    const currentPath = window.location.pathname
                    const tournamentMatch = currentPath.match(/\/admin\/tournaments\/(\d+)/)
                    if (tournamentMatch && tournamentMatch[1]) {
                        return `/admin/tournaments/${tournamentMatch[1]}`
                    }
                    console.warn('Image tutorial: Unable to resolve tournament ID')
                    return '/admin/tournaments'
                },
                waitForInteraction: true,
                requiresValidation: false,
            },
            {
                id: 'image-gallery',
                title: 'Image Gallery',
                description: 'All uploaded images for the current game day will appear here. You can delete images by hovering over them and clicking the trash icon.',
                visualId: 'tutorial-images-gallery',
                position: 'top',
                route: '/admin/tournaments/[id]/edit',
                routeResolver: () => {
                    const currentPath = window.location.pathname
                    const tournamentMatch = currentPath.match(/\/admin\/tournaments\/(\d+)/)
                    if (tournamentMatch && tournamentMatch[1]) {
                        return `/admin/tournaments/${tournamentMatch[1]}`
                    }
                    console.warn('Image tutorial: Unable to resolve tournament ID')
                    return '/admin/tournaments'
                },
                waitForInteraction: true,
                requiresValidation: false,
            },
            {
                id: 'image-gameday-actions',
                title: 'Game Day Actions',
                description: 'Use these buttons to edit the game day name or delete the entire game day and all its images.',
                visualId: 'tutorial-images-gameday-actions',
                position: 'left',
                route: '/admin/tournaments/[id]/edit',
                routeResolver: () => {
                    const currentPath = window.location.pathname
                    const tournamentMatch = currentPath.match(/\/admin\/tournaments\/(\d+)/)
                    if (tournamentMatch && tournamentMatch[1]) {
                        return `/admin/tournaments/${tournamentMatch[1]}`
                    }
                    console.warn('Image tutorial: Unable to resolve tournament ID')
                    return '/admin/tournaments'
                },
                waitForInteraction: true,
                requiresValidation: false,
            }
        ]
    }
}

interface OnboardingProviderProps {
    children: ReactNode
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
    const [currentFlow, setCurrentFlow] = useState<OnboardingFlow | null>(null)
    const [currentStepIndex, setCurrentStepIndex] = useState(0)
    const [isActive, setIsActive] = useState(false)

    // Persist state in localStorage
    useEffect(() => {
        const saved = localStorage.getItem('onboarding-state')
        if (saved) {
            const { flowId, stepIndex, active } = JSON.parse(saved)
            if (flowId && ONBOARDING_FLOWS[flowId]) {
                setCurrentFlow(ONBOARDING_FLOWS[flowId])
                setCurrentStepIndex(stepIndex)
                setIsActive(active)
            }
        }
    }, [])

    useEffect(() => {
        if (currentFlow) {
            localStorage.setItem('onboarding-state', JSON.stringify({
                flowId: currentFlow.id,
                stepIndex: currentStepIndex,
                active: isActive
            }))
        }
    }, [currentFlow, currentStepIndex, isActive])

    const startFlow = (flowId: string) => {
        const flow = ONBOARDING_FLOWS[flowId]
        if (flow) {
            setCurrentFlow(flow)
            setCurrentStepIndex(0)
            setIsActive(true)
        }
    }

    const nextStep = () => {
        if (currentFlow && currentStepIndex < currentFlow.steps.length - 1) {
            const currentStep = currentFlow.steps[currentStepIndex]

            if (currentStep.action && currentStep.triggerEvent !== 'click') {
                currentStep.action()
            }

            setCurrentStepIndex(prev => prev + 1)
        } else {
            completeFlow()
        }
    }

    const prevStep = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1)
        }
    }

    const skipFlow = () => {
        setIsActive(false)
        setCurrentFlow(null)
        setCurrentStepIndex(0)
        localStorage.removeItem('onboarding-state')
    }

    const completeFlow = () => {
        setIsActive(false)
        setCurrentFlow(null)
        setCurrentStepIndex(0)
        localStorage.removeItem('onboarding-state')
    }

    const pauseFlow = () => {
        setIsActive(false)
    }

    const resumeFlow = () => {
        setIsActive(true)
    }

    return (
        <OnboardingContext.Provider value={{
            currentFlow,
            currentStepIndex,
            isActive,
            startFlow,
            nextStep,
            prevStep,
            skipFlow,
            completeFlow,
            pauseFlow,
            resumeFlow
        }}>
            {children}
        </OnboardingContext.Provider>
    )
}

export function useOnboarding() {
    const context = useContext(OnboardingContext)
    if (context === undefined) {
        throw new Error('useOnboarding must be used within an OnboardingProvider')
    }
    return context
}