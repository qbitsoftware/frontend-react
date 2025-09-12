import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { replaceSpecialCharacters } from "@/lib/utils";
import { Blog } from "@/types/blogs";
import { Link } from "@tanstack/react-router";

export const BlogCard = ({ blog, className = "" }: { blog: Blog, className?: string }) => {

    const categories = blog.category.split('/').map((category) => category.trim())

    return (
        <Card className={`overflow-hidden ${className}`}>
            <div className="h-48 overflow-hidden">
                {blog.has_image && blog.image_url ? (
                    <img
                        src={blog.image_url}
                        alt={blog.title}
                        className="w-full h-full object-contain"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No image available</span>
                    </div>
                )}
            </div>
            <CardHeader>
                <div className="text-sm font-medium text-blue-600 mb-2">{categories.map((category, idx) => {
                    if (idx === categories.length - 1) {
                        return (
                                <Link key={idx} to={`/uudised`} search={{ category: replaceSpecialCharacters(category) }}>
                                <span key={idx}>{category}</span>
                            </Link>
                        )
                    } else {
                        return (
                            <div key={idx}>
                                <Link key={idx} to={`/uudised`} search={{ category: replaceSpecialCharacters(category) }}>
                                    <span key={category} className="mr-2">{category}</span>
                                </Link>
                                <span className='mr-2'>/</span>
                            </div>
                        )
                    }
                })}</div>
                <CardTitle className="mt-2 line-clamp-2">{blog.title}</CardTitle>
            </CardHeader>
            <CardFooter>
                <Link to={`/uudised/$blogid`} params={{ blogid: String(blog.id) }}>
                    <Button variant="outline" className="border-blue-500 hover:bg-blue-100">Read More</Button>
                </Link>
            </CardFooter>
        </Card>
    )
}

