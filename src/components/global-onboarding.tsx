// import { useOnboarding } from '@/providers/tutorialProvider'
// import { useRouter } from '@tanstack/react-router'
// import { useEffect, useRef } from 'react'
// import { OnboardingOverlay } from './onboarding-overlay'

// export function GlobalOnboarding() {
//     const { currentFlow, currentStepIndex, isActive, nextStep, skipFlow, completeFlow } = useOnboarding()
//     const router = useRouter()
//     const navigationTimeoutRef = useRef<NodeJS.Timeout>()
//     const lastStepIndexRef = useRef(-1)

//     const cleanupTutorialState = () => {
//         const ratingSwitch = document.getElementById('tournament-rating-switch')
//         const privateSwitch = document.getElementById('tournament-private-switch')

//         if (ratingSwitch) {
//             ratingSwitch.style.pointerEvents = 'auto'
//             ratingSwitch.style.opacity = '1'
//         }
//         if (privateSwitch) {
//             privateSwitch.style.pointerEvents = 'auto'
//             privateSwitch.style.opacity = '1'
//         }
//     }

//     // Cleanup when tutorial ends
//     useEffect(() => {
//         if (!isActive) {
//             cleanupTutorialState()
//         }
//     }, [isActive])

//     useEffect(() => {
//         if (currentFlow && isActive) {
//             const currentStep = currentFlow.steps[currentStepIndex]
//             const currentPath = window.location.pathname

//             // Resolve the target route - use routeResolver if available, otherwise use static route
//             let targetRoute = currentStep.route
//             if (currentStep.routeResolver) {
//                 try {
//                     targetRoute = currentStep.routeResolver()
//                 } catch (error) {

//                     // Fall back to original route or handle gracefully
//                     if (currentStep.route.includes('[id]')) {
//                         void error
//                         return
//                     }
//                 }
//             }

//             // Only navigate if:
//             // 1. We're not already on the correct route
//             // 2. The step index has actually changed (to prevent infinite loops)
//             // 3. The target route is valid (not a fallback to tournaments list)
//             if (targetRoute !== currentPath &&
//                 lastStepIndexRef.current !== currentStepIndex &&
//                 targetRoute !== '/admin/tournaments') {

//                 // Clear any pending navigation
//                 if (navigationTimeoutRef.current) {
//                     clearTimeout(navigationTimeoutRef.current)
//                 }

//                 // Update the last step index immediately
//                 lastStepIndexRef.current = currentStepIndex

//                 // Navigate immediately for better UX
//                 router.navigate({ to: targetRoute })
//             } else {
//                 // Update last step index even if no navigation needed
//                 lastStepIndexRef.current = currentStepIndex
//             }

//             // Execute step action after ensuring we're on the right route
//             if (currentStep.action && targetRoute === currentPath) {
//                 setTimeout(currentStep.action, 500)
//             }
//         }

//         return () => {
//             if (navigationTimeoutRef.current) {
//                 clearTimeout(navigationTimeoutRef.current)
//             }
//         }
//     }, [currentFlow, currentStepIndex, isActive, router])

//     if (!currentFlow || !isActive) {
//         return null
//     }

//     const currentStep = currentFlow.steps[currentStepIndex]

//     const handleSkip = () => {
//         cleanupTutorialState()
//         skipFlow()
//     }

//     const handleComplete = () => {
//         cleanupTutorialState()
//         completeFlow()
//     }

//     return (
//         <OnboardingOverlay
//             steps={[currentStep]}
//             currentStepIndex={0}
//             totalSteps={currentFlow.steps.length}
//             currentGlobalStep={currentStepIndex}
//             onNext={nextStep}
//             onSkip={handleSkip}
//             onComplete={handleComplete}
//         />
//     )
// }