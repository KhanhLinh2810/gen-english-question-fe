const FormHeader = ({ logoSrc, title }) => {
  return (
    <div className="text-center">
      {logoSrc && (
        <img src={logoSrc} alt="logo" className="w-28 h-28 object-contain mx-auto mb-4" />
      )}
      <h2 className="text-3xl font-bold text-black mb-2">{title}</h2>
    </div>
  );
};

export default FormHeader;
