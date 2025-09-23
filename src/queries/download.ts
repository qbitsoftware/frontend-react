import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "./axiosconf";

export const UseGetDownloadProtocol = (tournament_id: number, group_id: number, match_id: string, type: 'protocol' | 'lottery_sheet') => {
    return useQuery<Blob>({
        queryKey: ['cl_protocol', tournament_id, group_id, match_id, type],
        queryFn: async () => {
            const { data } = await axiosInstance.get(`/api/v1/tournaments/${tournament_id}/tables/${group_id}/match/${match_id}/protocol`, {
                withCredentials: true,
                responseType: 'blob',
                params: {
                    type: type,
                }
            })
            return data;
        }
    })
}


export const downloadExcelFile = (blob: Blob, fileName: string = 'protocol.xlsx') => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}