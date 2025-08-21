import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  Edit,
  Trash2,
  AlertCircle,
  FolderX,
  MoreHorizontal,
} from "lucide-react";
import { UseDeleteBlog, UseGetBlogsQuery } from "@/queries/blogs";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "react-i18next";
import { toast } from 'sonner'
import AdminHeader from "../-components/admin-header";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/blog/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [blogIdToDelete, setBlogIdToDelete] = useState<number | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const deleteMutation = UseDeleteBlog();
  const { data: blogData, isLoading, error } = UseGetBlogsQuery();
  const { t } = useTranslation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDeleteClick = (blogId: number) => {
    setOpenDropdownId(null);
    setBlogIdToDelete(blogId);
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (blogIdToDelete === null) return;

    try {
      await deleteMutation.mutateAsync(blogIdToDelete);
      toast.message(t('admin.blogs.toasts.deleted'));
      setBlogIdToDelete(null);
    } catch (err) {
      toast.error(t('admin.blogs.toasts.deleted_failed'));
    }
    setIsDialogOpen(false);
  };

  const handleDeleteCancel = () => {
    setBlogIdToDelete(null);
  };

  const getStatusVariant = (state: string) => {
    switch (state) {
      case "published":
        return { variant: "default" as const, className: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200" }
      case "draft":
        return { variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200" }
      default:
        return { variant: "destructive" as const, className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200" }
    }
  }

  if (error) {
    return (
      <div className="w-full p-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t("admin.blogs.title")}
            </h1>
            <p className="text-gray-600 mt-1">{t("admin.blogs.description")}</p>
          </div>
        </div>

        <div className="flex justify-center items-center h-[500px]">
          <div className="text-center p-8 bg-red-50 rounded-lg max-w-xl">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800">
              {t("admin.blogs.load_failed")}
            </h3>
            <p className="text-red-600 mt-2 mb-4">
              {t("admin.blogs.load_failed_description")}
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700"
            >
              {t("admin.blogs.refresh")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if ((!blogData || !blogData.data || blogData.data.length < 1) && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] m-8 space-y-2  rounded-lg border-2 border-dashed border-gray-200">
        <FolderX className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          {t("admin.blogs.not_found")}
        </h3>
        <p className="text-gray-500 text-center max-w-md">
          {t("admin.blogs.not_found_subtitle")}
        </p>
        <Link href="/admin/blog/new">
          <Button className="mt-2 px-6">{t("admin.blogs.add_new")}</Button>
        </Link>
      </div>
    );
  }

  const filteredBlogs = blogData && blogData.data.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="p-2 py-8 md:p-8">
        <AdminHeader
          title={t("admin.blogs.title")}
          description={t("admin.blogs.description")}
          add_new={t("admin.blogs.add_new")}
          href={"/admin/blog/new"}
          searchTerm={searchTerm}
          input_placeholder={t("admin.blogs.search")}
          setSearchTerm={setSearchTerm}
        />

        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="border-gray-200 bg-gray-50/50">
                    <TableHead className="text-xs sm:text-sm px-3 py-3 font-semibold text-gray-700 w-[300px]">
                      {t("admin.blogs.table.title")}
                    </TableHead>
                    <TableHead className="text-xs sm:text-sm px-3 py-3 text-center font-semibold text-gray-700">{t("admin.blogs.table.date")}</TableHead>
                    <TableHead className="hidden sm:block text-xs sm:text-sm px-3 py-3 text-center font-semibold text-gray-700">{t("admin.blogs.table.status")}</TableHead>
                    <TableHead className="text-xs sm:text-sm px-3 py-3 text-center font-semibold text-gray-700">
                      {t("admin.blogs.table.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(5)].map((_, index) => (
                      <TableRow key={index}>
                        <TableCell className="px-3 py-3">
                          <Skeleton className="h-4 w-[250px]" />
                        </TableCell>
                        <TableCell className="px-3 py-3">
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell className="px-3 py-3">
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </TableCell>
                        <TableCell className="px-3 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Skeleton className="h-8 w-20" />
                            <Skeleton className="h-8 w-20" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredBlogs && filteredBlogs.length > 0 ? (
                    filteredBlogs.map((blog) => (
                      <TableRow key={blog.id} className="cursor-pointer hover:bg-gray-50/75 border-gray-100 transition-colors duration-150">
                        <TableCell className="px-3 py-3 font-medium text-gray-900">
                          <div className="flex items-center gap-2">
                            <span className="truncate max-w-[130px] sm:max-w-[300px] md:max-w-[400px]" title={blog.title}>
                              {blog.title}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-3 py-3 text-gray-600 text-center truncate">
                          {blog.created_at
                            ? format(new Date(blog.created_at), "MMM dd, yyyy")
                            : t("admin.blogs.no_date")}
                        </TableCell>
                        <TableCell className="px-3 py-3 text-center hidden sm:table-cell">
                          <Badge className={`text-xs px-2 py-1 font-medium ${getStatusVariant(blog.status).className}`}>
                            {blog.status.replace('_', ' ').toUpperCase() === "DRAFT" ? t('admin.blogs.status_draft').toUpperCase() : t('admin.blogs.status_published').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-3 py-3">
                          <div className="flex justify-center">
                            <DropdownMenu
                              open={openDropdownId === blog.id}
                              onOpenChange={(open) => {
                                setOpenDropdownId(open ? blog.id : null);
                              }}
                            >
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link to={`/admin/blog/${blog.id}`} className="flex items-center">
                                    <Edit className="h-4 w-4 mr-2" />
                                    {t("admin.blogs.edit")}
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClick(blog.id)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  {t("admin.blogs.delete")}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <FolderX className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {searchTerm
                                ? t("admin.blogs.search_no_results")
                                : t("admin.blogs.no_results")}
                            </p>
                            <p className="text-sm text-gray-500">
                              {searchTerm
                                ? t('admin.blogs.search_criteria')
                                : t("admin.blogs.not_found_subtitle")}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.blogs.delete_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.blogs.delete_description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              {t("admin.blogs.delete_cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              {t("admin.blogs.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
