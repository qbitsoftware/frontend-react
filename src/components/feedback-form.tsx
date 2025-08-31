import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { type FeedbackForm, sendUserFeedback } from '@/queries/users'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { CheckCircle, MessageSquarePlus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

interface FeedbackFormComponentProps {
  className?: string
  defaultName?: string
  showSuccessMessage?: boolean
}

export function FeedbackFormComponent({ 
  className = "", 
  defaultName = "",
  showSuccessMessage = true 
}: FeedbackFormComponentProps) {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const formSchema = z.object({
    name: z.string().optional(),
    title: z.string().min(5, {
      message: t('feedback.validation.titleMin'),
    }),
    body: z.string().min(10, {
      message: t('feedback.validation.bodyMin'),
    }),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: defaultName,
      title: '',
      body: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const feedbackData: FeedbackForm = {
      name: values.name || 'Anonymous',
      title: values.title,
      body: values.body,
    }

    try {
      const result = await sendUserFeedback(feedbackData)
      if (result.success) {
        setIsSubmitted(true)
        form.reset({ name: defaultName, title: '', body: '' })
        
        queryClient.invalidateQueries({ queryKey: ["feedback"] })

        if (showSuccessMessage) {
          setTimeout(() => {
            setIsSubmitted(false)
          }, 5000)
        }
      }
    } catch (error) {
      void error
    }
  }

  if (isSubmitted && showSuccessMessage) {
    return (
      <div className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm">
        <div className="p-6">
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="text-green-600 h-6 w-6" />
              <h4 className="font-medium text-green-800">
                {t('feedback.success.title')}
              </h4>
            </div>
            <p className="text-green-700">{t('feedback.success.description')}</p>
            <Button
              onClick={() => setIsSubmitted(false)}
              variant="outline"
              className="mt-4 border-green-300 text-green-700 hover:bg-green-100 hover:text-green-800"
            >
              {t('feedback.success.sendMoreButton')}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-xl shadow-sm">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquarePlus className="w-5 h-5 text-[#4C97F1]" />
          <h3 className="text-lg font-semibold text-gray-800">{t('feedback.title')}</h3>
        </div>
        
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className={`space-y-6 ${className}`}
          >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('feedback.name.title')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('feedback.name.placeholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('feedback.topic.title')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('feedback.topic.placeholder')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('feedback.message.title')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('feedback.message.placeholder')}
                  className="h-32 resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className={`w-full ${form.formState.isSubmitting ? 'opacity-70' : ''}`}
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting
            ? t('feedback.submitButton.sending')
            : t('feedback.submitButton.send')}
        </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}
