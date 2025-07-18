import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthForm from '../components/auth/AuthForm';

const Signup = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSignUp = async ({ email, password, name }) => {
    await signUp(email, password, name);
    navigate('/');
  };

  return <AuthForm type="signup" onSubmit={handleSignUp} />;
};

export default Signup;