import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, ArrowRight, CheckCircle2, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }

    if (!formData.displayName) {
      newErrors.displayName = '이름을 입력해주세요';
    } else if (formData.displayName.length < 2) {
      newErrors.displayName = '이름은 최소 2자 이상이어야 합니다';
    }

    if (!formData.phone) {
      newErrors.phone = '전화번호를 입력해주세요';
    } else if (!/^[0-9-]+$/.test(formData.phone)) {
      newErrors.phone = '숫자와 하이픈(-)만 입력 가능합니다';
    } else if (formData.phone.length < 10) {
      newErrors.phone = '올바른 전화번호 형식이 아닙니다';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호를 다시 입력해주세요';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    try {
      await signup(formData.email, formData.password, formData.displayName, formData.phone);
      toast.success('회원가입이 완료되었습니다!');
      navigate('/menu');
    } catch (error: any) {
      toast.error(error.message || '회원가입에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <Link to="/" className="inline-flex items-center justify-center w-20 h-20 gradient-primary rounded-3xl mb-4 shadow-lg hover:scale-105 transition-transform">
            <span className="text-4xl">🍜</span>
          </Link>
          <h1 className="text-3xl mb-2">
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              회원가입
            </span>
          </h1>
          <p className="text-gray-600">새로운 계정을 만들어보세요</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 animate-scale-in">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="이름"
              type="text"
              placeholder="홍길동"
              value={formData.displayName}
              onChange={(e) => updateField('displayName', e.target.value)}
              error={errors.displayName}
              icon={<UserIcon className="w-5 h-5" />}
              autoComplete="name"
            />

            <Input
              label="전화번호"
              type="tel"
              placeholder="010-1234-5678"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              error={errors.phone}
              icon={<Phone className="w-5 h-5" />}
              autoComplete="tel"
            />

            <Input
              label="이메일"
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              error={errors.email}
              icon={<Mail className="w-5 h-5" />}
              autoComplete="email"
            />

            <Input
              label="비밀번호"
              type="password"
              placeholder="최소 6자 이상"
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              error={errors.password}
              icon={<Lock className="w-5 h-5" />}
              autoComplete="new-password"
            />

            <Input
              label="비밀번호 확인"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              error={errors.confirmPassword}
              icon={<Lock className="w-5 h-5" />}
              autoComplete="new-password"
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isLoading}
              className="group"
            >
              {!isLoading && (
                <>
                  가입하기
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>

          {/* Benefits */}
          <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-orange-50 rounded-xl">
            <p className="text-sm font-medium text-gray-900 mb-3">회원 혜택</p>
            <ul className="space-y-2">
              <BenefitItem text="신규 가입 쿠폰 즉시 지급" />
              <BenefitItem text="주문 내역 관리 및 재주문" />
              <BenefitItem text="맞춤 추천 메뉴 제공" />
            </ul>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                로그인
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-gray-600 hover:text-gray-900 text-sm inline-flex items-center"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <li className="flex items-center text-sm text-gray-700">
      <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
      {text}
    </li>
  );
}
