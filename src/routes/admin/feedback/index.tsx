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
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import AdminHeader from '../-components/admin-header'

export const Route = createFileRoute('/admin/feedback/')({
  component: FeedbackFormComponent,
})

export function FeedbackFormComponent() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { t } = useTranslation()

  const formSchema = z.object({
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
      title: '',
      body: '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const feedbackData: FeedbackForm = {
      ...values,
      name: 'ELTL admin',
    }

    try {
      const result = await sendUserFeedback(feedbackData)
      if (result.success) {
        setIsSubmitted(true)
        form.reset()

        setTimeout(() => {
          setIsSubmitted(false)
        }, 5000)
      }
    } catch (error) {
      void error
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="container p-8">
      <AdminHeader
        title={t('feedback.title')}
        description={t('feedback.subtitle')}
        href={""}
        feedback={true}
      />

      {isSubmitted ? (
        <div className="bg-green-50 p-6 rounded-lg border border-green-200 max-w-lg">
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
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 max-w-lg px-1"
          >
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
      )}
      </div>
    </div>
  )
}
