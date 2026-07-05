type InputProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string | number;
};

export default function Input({
  label,
  name,
  type = "text",
  placeholder,
  required,
  defaultValue,
}: InputProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="block text-sm font-medium text-white/60"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        defaultValue={defaultValue}
        className="
          w-full
          rounded-xl
          border
          border-white/10
          bg-white/[0.03]
          px-4
          py-3
          text-white
          outline-none
          transition
          placeholder:text-white/20
          focus:border-[#C9A86A]
          focus:ring-2
          focus:ring-[#C9A86A]/20
        "
      />
    </div>
  );
}