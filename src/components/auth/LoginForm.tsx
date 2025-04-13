"use client";

import { FacebookIcon, GoogleIcon } from "@components/icons"
import { useState, useTransition } from "react"
import { login } from "@/app/actions/auth"; // Bỏ comment để import server action

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        // Gọi server action để đăng nhập
        const result = await login(formData);
        if (!result?.success) {
          setError(result?.message);
        }

        // Nếu thành công, server action sẽ tự redirect
      } catch (err) {
        console.log(err);
        
        if (err instanceof Error && !err.message.includes('NEXT_REDIRECT')) {
          setError('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
       }
      }
    });
  };

  return (
    <div className="card border-0">
      <div className="p-4">
        <h3>Đăng Nhập</h3>
        {error && <div className="alert alert-danger">{error}</div>}
        <form action={handleSubmit}>
          <div className="row g-3">
            <div className="col-12">
              <div className="form-group">
                <label className="form-label" htmlFor="email-address">Email</label>
                <div className="form-control-wrap">
                  <input
                    type="email"
                    className="form-control"
                    id="email-address"
                    name="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="col-12">
              <div className="form-group">
                <label className="form-label d-flex" htmlFor="password">
                  Mật Khẩu <a href="forgot.html" className="link link-primary ms-auto">Quên mật khẩu?</a>
                </label>
                <div className="form-control-wrap">
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    placeholder="Mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="col-12">
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={isPending}
              >
                {isPending ? 'Đang xử lý...' : 'Đăng nhập tài khoản'}
              </button>
            </div>
          </div>
        </form>
      </div>
      <div className="p-4 border-top border-light">
        <h6 className="tyn-title-overline text-center pb-1">Hoặc Đăng Nhập Bằng</h6>
        <ul className="d-flex gap gap-3">
          <li className="flex-grow-1">
            <button className="btn btn-light w-100">
              <GoogleIcon />
              <span>Google</span>
            </button>
          </li>
          <li className="flex-grow-1">
            <button className="btn btn-light w-100">
              <FacebookIcon />
              <span>Facebook</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}
