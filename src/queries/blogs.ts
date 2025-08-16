import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "./axiosconf";
import { Blog } from "@/types/blogs";

export interface BlogsResponse {
    data: Blog[]
    message: string
    error: string | null
}

export interface BlogsResponseUser {
    data: {
        blogs: Blog[],
        total_pages: number,
    }
    message: string
    error: string | null
}

export function UseGetBlogsQuery(page?: number, category?: string, search?: string) {
    return useQuery<BlogsResponse>({
        queryKey: ["blogs_admin", { page, category, search }],
        queryFn: async () => {
            const queryParams = new URLSearchParams();

            if (page !== undefined) {
                queryParams.append("page", page.toString());
            }

            if (category !== undefined && category !== '') {
                queryParams.append("category", category);
            }

            if (search !== undefined && search !== '') {
                queryParams.append("search", search);
            }

            const queryString = queryParams.toString();
            const url = queryString ? `/api/v1/blogs?${queryString}` : "/api/v1/blogs";

            const { data } = await axiosInstance.get(url, {
                withCredentials: true
            });
            return data;
        }
    });
}

export function UseGetBlogsOption(page?: number, category?: string, search?: string) {
    return queryOptions<BlogsResponseUser>({
        queryKey: ["blogs", { page, category, search }],
        queryFn: async () => {
            const queryParams = new URLSearchParams();

            if (page !== undefined) {
                queryParams.append("page", page.toString());
            }

            if (category !== undefined && category !== '') {
                queryParams.append("category", category);
            }

            if (search !== undefined && search !== '') {
                queryParams.append("search", search);
            }

            const queryString = queryParams.toString();
            const url = queryString ? `/api/v1/blogs?${queryString}` : "/api/v1/blogs";

            const { data } = await axiosInstance.get(url);
            return data;
        }
    });
}

export function UseGetBlogsQueryPublic(page?: number, category?: string, search?: string) {
    return useQuery<BlogsResponseUser>({
        queryKey: ["blogs", { page, category, search }],
        queryFn: async () => {
            const queryParams = new URLSearchParams();

            if (page !== undefined) {
                queryParams.append("page", page.toString());
            }

            if (category !== undefined && category !== '') {
                queryParams.append("category", category);
            }

            if (search !== undefined && search !== '') {
                queryParams.append("search", search);
            }

            const queryString = queryParams.toString();
            const url = queryString ? `/api/v1/blogs?${queryString}` : "/api/v1/blogs";

            const { data } = await axiosInstance.get(url);
            return data;
        }
    });
}

interface BlogResponse {
    data: Blog
    message: string
    error: string | null
}

export function UseGetBlog(id: number) {
    return queryOptions<BlogResponse>({
        queryKey: ["blog_client", id],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/api/v1/blogs/${id}`, {
                withCredentials: true
            })
            return data
        }
    })
}

export function UseGetBlogQuery(id: number) {
    return useQuery<BlogResponse>({
        queryKey: ["blog_admin", id],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/api/v1/blogs/${id}`, {
                withCredentials: true
            })
            return data
        }
    })
}

export function UseCreateBlog() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (blog: Blog) => {
            const { data } = await axiosInstance.post("/api/v1/blogs", blog,
                {
                    withCredentials: true
                }
            )
            return data
        },
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: ["blogs_admin"] })
            queryClient.invalidateQueries({ queryKey: ["blogs"] })
        }
    })
}

export function UseUpdateBlog() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (blog: Blog) => {
            const { data } = await axiosInstance.patch(`/api/v1/blogs/${blog.id}`, blog, {
                withCredentials: true
            })
            return data
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["blogs_admin"] })
            queryClient.invalidateQueries({ queryKey: ["blogs"] })
            queryClient.invalidateQueries({ queryKey: ["blog_admin", variables.id] })
        }
    })
}

export function UseDeleteBlog() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (id: number) => {
            const { data } = await axiosInstance.delete(`/api/v1/blogs/${id}`, {
                withCredentials: true
            })
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["blogs_admin"] })
            queryClient.invalidateQueries({ queryKey: ["blogs"] })
        }
    })
}
