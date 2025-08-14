import { createFileRoute, useParams, useRouter } from '@tanstack/react-router'
import { UseGetBlogQuery, UseUpdateBlog } from '@/queries/blogs'
import { useEffect, useState } from 'react'
import { YooptaContentValue } from '@yoopta/editor'
import { categories, contentParser } from '@/lib/utils'
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

export const Route = createFileRoute('/admin/blog/$blogid/')({
    component: RouteComponent,
})

function RouteComponent() {
    const params = useParams({ strict: false })
    const { data: blogData, isLoading } = UseGetBlogQuery(Number(params.blogid))
    const [value, setValue] = useState<YooptaContentValue | undefined>(undefined);
    const [category, setCategory] = useState<string>('');
    const [isPublished, setIsPublished] = useState(false);
    const blogUpdateMutation = UseUpdateBlog()
    const router = useRouter()


    useEffect(() => {
        if (!isLoading && blogData?.data) {
            try {
                setValue(JSON.parse(blogData.data.full_content));
                setIsPublished(blogData.data.status === 'published');
                setCategory(blogData.data.category);
            } catch (error) {
                toast.error("Error loading blog");
            }
        }

        if (!isLoading && (!blogData || !blogData.data)) {
            toast.error("Blog not found");
            router.navigate({ to: '/admin/blog' });
        }
    }, [isLoading, blogData, toast, router]);

    const handleClick = async () => {
        if (!value) {
            toast.error("Content is empty");
            return;
        }

        const { title, description, hasImages, imageUrl } = contentParser(value)

        if (!title) {
            toast.error("Title is missing");
            return;
        }

        if (blogData) {
            try {
                toast.message("Please wait while we update your post...");

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

                toast.message(`Blog post has been ${isPublished ? 'published' : 'saved as draft'}.`);

                router.navigate({ to: '/admin/blog' })
            } catch (error) {
                toast.error("Failed to update");
            }

        } else {
            toast.message("Refresh the page");

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
                    <div className="h-16 flex items-center justify-between">
                        <div className="flex items-center">
                            <Link
                                href='/admin/blog'
                                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Tagasi
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
                                        <SelectValue placeholder="Select category" />
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
                                    {isPublished ? 'Publish' : 'Save as Draft'}
                                </Label>
                            </div>

                            <Button
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                onClick={handleClick}
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {isPublished ? 'Publish' : 'Save Draft'}
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <div className='flex items-center justify-center'>
                {value ? (
                    <Editor value={value} setValue={setValue} readOnly={false} />
                ) : (
                    <div className="p-8 text-center">
                        <p>Loading editor...</p>
                    </div>
                )}
            </div>
        </div>
    )
}
