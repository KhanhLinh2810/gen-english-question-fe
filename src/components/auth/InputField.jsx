const InputField = ({
  label,
  id,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  ...rest
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-black">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        )}
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          {...rest}
          className={`block w-full min-w-0 border rounded-lg px-3 py-3 text-black font-medium placeholder-gray-500 ${
            Icon ? "pl-10" : ""
          } focus:outline-none focus:ring-2 focus:ring-indigo-500 transition ${
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-indigo-500"
          }`}
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default InputField;
