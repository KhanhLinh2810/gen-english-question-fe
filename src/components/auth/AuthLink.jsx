import { Link } from 'react-router-dom';

const AuthLink = ({ text, linkText, to }) => {
  return (
    <p className="text-center text-gray-600 text-sm">
      {text}{' '}
      <Link to={to} className="text-indigo-600 font-semibold hover:underline">
        {linkText}
      </Link>
    </p>
  );
};

export default AuthLink;
