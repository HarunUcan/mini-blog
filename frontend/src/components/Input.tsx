interface InputProps {
    label: string;
    id: string;
    placeholder: string;
    type?: string;
}
export default function Input({ label, id, placeholder, type = "text" }: InputProps) {
    return (
        <div className="flex flex-col w-full justify-center items-center">
            <label htmlFor={id} className="flex items-start justify-start w-3/4 text-gray-700 dark:text-gray-200">{label}</label>
            <input
                type={type}
                id={id}
                placeholder={placeholder}
                className="w-3/4 px-4 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
    )
}