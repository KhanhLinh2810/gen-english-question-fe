import logo from '../../assets/logo.png';
import FormHeader from './FormHeader';

const AuthLayout = ({ children, title }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <FormHeader logoSrc={logo} title={title} />
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
