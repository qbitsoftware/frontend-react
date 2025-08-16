interface Props {
    message: string;
}

export default function ErrorState({ message }: Props) {
    return (
        <div className="text-center py-8 lg:py-12">
            <div className="w-10 h-10 lg:w-12 lg:h-12 mx-auto mb-3 lg:mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <div className="w-5 h-5 lg:w-6 lg:h-6 bg-red-400 rounded-full"></div>
            </div>
            <p className="text-red-500 text-xs lg:text-sm font-medium">
                {message}
            </p>
        </div>
    )
}