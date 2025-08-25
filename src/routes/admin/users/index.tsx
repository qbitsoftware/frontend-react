import { createFileRoute } from '@tanstack/react-router'
import { axiosInstance } from '@/queries/axiosconf';

export const Route = createFileRoute('/admin/users/')({
    component: RouteComponent,
})


function RouteComponent() {
    // Example function to trigger download
    const downloadUsersXML = async () => {
        try {
            const response = await axiosInstance.get("/api/v1/users/export_xml", {
                responseType: "blob",
                withCredentials: true,
            });

            // Create a URL for the blob
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "users.xlsx");
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            // Handle error
            console.error("Download failed", error);
        }
    };

    return (
        <div>
            <button
                onClick={downloadUsersXML}
                className="px-5 py-2 mt-5 bg-blue-600 text-white rounded font-bold text-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                title="Export all users as XML file"
            >
                Export Users (XML)
            </button>
        </div>
    );
}

