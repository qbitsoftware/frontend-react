import { createFileRoute, useRouter } from '@tanstack/react-router'
import { ArrowLeft, Save } from 'lucide-react'
import Editor from '../../-components/yooptaeditor'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { YooptaContentValue } from '@yoopta/editor'
import { Link } from '@tanstack/react-router'
import { UseCreateBlog } from '@/queries/blogs'
import { Blog } from '@/types/blogs'
import { categories, contentParser } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/admin/blog/new/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [value, setValue] = useState<YooptaContentValue>();
  const [isPublished, setIsPublished] = useState(false);
  const [category, setCategory] = useState<string>('');
  const blogMutation = UseCreateBlog()
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation();


  const handleClick = async () => {
    if (!value) {
      toast({
        title: "Content is empty",
        description: "Please add some content to your blog post.",
        variant: "destructive"
      });
      return;
    }

    const { title, description, hasImages, imageUrl } = contentParser(value)

    if (!title) {
      toast({
        title: "Title is missing",
        description: "Please add a title to your blog post.",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "Saving blog post",
        description: "Please wait while we save your post...",
      });

      const blog: Blog = {
        id: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        title,
        description,
        has_image: hasImages,
        image_url: imageUrl,
        full_content: JSON.stringify(value),
        status: isPublished ? 'published' : 'draft',
        category: category,
      }

      await blogMutation.mutateAsync(blog)

      toast({
        title: "Success!",
        description: `Blog post has been ${isPublished ? 'published' : 'saved as draft'}.`,
        variant: "default"
      });

      router.navigate({ to: '/admin/blog' })
    } catch (error) {
      toast({
        title: "Failed to save",
        description: "An error occurred while saving your blog post.",
        variant: "destructive"
      });
      console.error('Failed to create blog:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center">
              <Link
                href='/admin/blog'
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('admin.blogs.back')}
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {/* Add category selector */}
              <div className="flex items-center space-x-2">
                <Select
                  value={category}
                  onValueChange={value => setCategory(value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t('admin.blogs.choose_category')} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="publish-mode"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
                <Label htmlFor="publish-mode">
                  {isPublished ? t('admin.blogs.save_public') : t('admin.blogs.save_draft')}
                </Label>
              </div>

              <Button
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={handleClick}
              >
                <Save className="w-4 h-4 mr-2" />
                  {isPublished ? t('admin.blogs.save_public') : t('admin.blogs.save_draft')}
              </Button>
            </div>
          </div>
        </div>
      </header>
      <div className='flex items-center justify-center'>
        <Editor value={value} setValue={setValue} readOnly={false} />
      </div>
    </div>
  )
}
