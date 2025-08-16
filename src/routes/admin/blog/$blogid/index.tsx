import { createFileRoute, useParams, useRouter } from '@tanstack/react-router'
import { UseGetBlogQuery, UseUpdateBlog } from '@/queries/blogs'
import { useEffect, useState } from 'react'
import { YooptaContentValue } from '@yoopta/editor'
import { contentParser, createCategories } from '@/lib/utils'
import { Blog } from '@/types/blogs'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Editor from '../../-components/yooptaeditor'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Link } from '@tanstack/react-router'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/admin/blog/$blogid/')({
    component: RouteComponent,
})

function RouteComponent() {
    const params = useParams({ strict: false })
    const { data: blogData, isLoading } = UseGetBlogQuery(Number(params.blogid))
    const [value, setValue] = useState<YooptaContentValue | undefined>(undefined);
    const [category, setCategory] = useState<string>('');
    const [isPublished, setIsPublished] = useState(false);
    const { t } = useTranslation()
    const blogUpdateMutation = UseUpdateBlog()
    const router = useRouter()
    const categories = createCategories()

    useEffect(() => {
        if (!isLoading && blogData?.data) {
            try {
                setValue(JSON.parse(blogData.data.full_content));
                setIsPublished(blogData.data.status === 'published');
                setCategory(blogData.data.category);
            } catch (error) {
                toast.error(t('admin.blogs.toasts.load_failed'));
            }
        }

        if (!isLoading && (!blogData || !blogData.data)) {
            toast.error(t('admin.blogs.toasts.not_found'));
            router.navigate({ to: '/admin/blog' });
        }
    }, [isLoading, blogData, toast, router]);

    const handleClick = async () => {
        if (!value) {
            toast.error(t('admin.blogs.toasts.empty_content'))
            return;
        }

        const { title, description, hasImages, imageUrl } = contentParser(value)

        if (!title) {
            toast.error(t('admin.blogs.toasts.missing_title'))
            return;
        }

        if (blogData) {
            try {
                toast.message(t('admin.blogs.toasts.saving'))

                const blog: Blog = {
                    ...blogData.data,
                    id: blogData.data.id,
                    updated_at: new Date().toISOString(),
                    title,
                    description,
                    has_image: hasImages,
                    image_url: imageUrl,
                    full_content: JSON.stringify(value),
                    status: isPublished ? 'published' : 'draft',
                    category,
                }

                await blogUpdateMutation.mutateAsync(blog)

                toast.message(t('admin.blogs.toasts.save_success'))
                router.navigate({ to: '/admin/blog' })
            } catch (error) {
                toast.error(t('admin.blogs.toasts.failed_to_save'))
            }

        } else {
            toast.message(t('admin.blogs.toasts.refresh'));

        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <Skeleton className="h-12 w-full mb-4" />
                <Skeleton className="h-[600px] w-full" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="h-16 sm:h-20 flex items-center justify-between">
                        {/* Left side - Back button */}
                        <div className="flex items-center">
                            <Link
                                href='/admin/blog'
                                className="inline-flex items-center px-3 py-3 rounded-md text-sm font-medium text-gray-800  transition-colors"
                            >
                                <ArrowLeft className="w-6 h-6 mr-1 sm:mr-2" />
                                {/* <span className="hidden sm:inline">Back</span> */}
                            </Link>
                        </div>

                        {/* Right side - Controls */}
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            {/* Category selector - hidden on very small screens */}
                            <div className="hidden xs:flex items-center">
                                <Select
                                    value={category}
                                    onValueChange={value => setCategory(value)}
                                >
                                    <SelectTrigger className="w-[140px] sm:w-[180px] h-9">
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

                            {/* Publish toggle */}
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="publish-mode"
                                    checked={isPublished}
                                    onCheckedChange={setIsPublished}
                                    className="scale-90 sm:scale-100"
                                />
                                <Label htmlFor="publish-mode" className="text-xs sm:text-sm whitespace-nowrap">
                                    <span className="">
                                        {isPublished ? t('admin.blogs.status_published') : t('admin.blogs.status_draft')}
                                    </span>
                                </Label>
                            </div>

                            {/* Save/Publish button */}
                            <Button
                                className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-[#4C97F1] hover:bg-[#5C97F1] focus:outline-none min-h-[36px] sm:min-h-[40px]"
                                onClick={handleClick}
                            >
                                <Save className="w-4 h-4 mr-1 sm:mr-2" />
                                <span className="">
                                    {isPublished ? t('admin.blogs.save_public') : t('admin.blogs.save_draft')}
                                </span>
                            </Button>
                        </div>
                    </div>

                    {/* Mobile category selector - shows below header on very small screens */}
                    <div className="xs:hidden pb-3 border-t border-gray-100">
                        <div className="pt-3">
                            <Select
                                value={category}
                                onValueChange={value => setCategory(value)}
                            >
                                <SelectTrigger className="w-full h-10">
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
                    </div>
                </div>
            </header>

            <div className='flex items-center justify-center'>
                {value ? (<div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4'>
                    <Editor value={value} setValue={setValue} readOnly={false} />
                </div>
                ) : (
                    <div className="p-8 text-center">
                        <p>Loading editor...</p>
                    </div>
                )}
            </div>
        </div>
    )
}
